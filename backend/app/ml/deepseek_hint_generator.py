"""
DeepSeek Hint Generator Module

Uses DeepSeek-V4-Pro model from Hugging Face Transformers for generating
educational hints in the knowledge checker.

Features:
- Open-source, no API keys required
- Support for multi-turn conversations
- Temperature and max_tokens tuning
- Error handling and validation
- Hint-specific prompting (not full answers)
"""

import torch
from typing import List, Dict, Optional, Tuple
from transformers import AutoTokenizer, AutoModelForCausalLM
import logging

logger = logging.getLogger(__name__)

# Model configuration
MODEL_NAME = "deepseek-ai/DeepSeek-V4-Pro"
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

# Global model and tokenizer cache (loaded on first use)
_model = None
_tokenizer = None


def load_model_and_tokenizer():
    """
    Lazy load the DeepSeek model and tokenizer.
    Caches them globally to avoid repeated downloads.
    
    Returns:
        Tuple[model, tokenizer]
    """
    global _model, _tokenizer
    
    if _model is None or _tokenizer is None:
        logger.info(f"Loading DeepSeek model: {MODEL_NAME}")
        _tokenizer = AutoTokenizer.from_pretrained(
            MODEL_NAME,
            trust_remote_code=True,
            use_auth_token=None  # No auth needed for public model
        )
        _model = AutoModelForCausalLM.from_pretrained(
            MODEL_NAME,
            torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32,
            device_map="auto" if torch.cuda.is_available() else DEVICE,
            trust_remote_code=True
        )
        _model.eval()  # Set to evaluation mode
        logger.info(f"Model loaded successfully on device: {DEVICE}")
    
    return _model, _tokenizer


def encode_messages(messages: List[Dict[str, str]]) -> str:
    """
    Encode a list of messages into the chat format expected by DeepSeek.
    
    Args:
        messages: List of message dicts with "role" and "content" keys
                 Example: [
                     {"role": "user", "content": "What is DSA?"},
                     {"role": "assistant", "content": "Data Structures..."},
                     {"role": "user", "content": "How to learn it?"}
                 ]
    
    Returns:
        Encoded message string for the model
    """
    formatted_messages = ""
    
    for message in messages:
        role = message.get("role", "user").lower()
        content = message.get("content", "").strip()
        
        if role == "user":
            formatted_messages += f"User: {content}\n"
        elif role == "assistant":
            formatted_messages += f"Assistant: {content}\n"
        elif role == "system":
            formatted_messages += f"System: {content}\n"
    
    return formatted_messages.strip()


def parse_message_from_completion_text(text: str) -> str:
    """
    Parse the response text from the model and extract the useful hint content.
    
    Args:
        text: Raw model output text
    
    Returns:
        Cleaned response text suitable for display
    """
    if not text or not isinstance(text, str):
        return ""
    
    # Remove "Assistant:" prefix if present
    cleaned = text.strip()
    if cleaned.startswith("Assistant:"):
        cleaned = cleaned[10:].strip()
    
    # Remove extra newlines and clean up whitespace
    cleaned = "\n".join(line.rstrip() for line in cleaned.split("\n"))
    
    # Limit to first few sentences to ensure conciseness
    sentences = cleaned.split(".")
    if len(sentences) > 4:
        cleaned = ". ".join(sentences[:4]).strip() + "."
    
    return cleaned


def generate_hint(
    messages: List[Dict[str, str]],
    level: int = 1,
    temperature: float = 0.7,
    max_tokens: int = 200
) -> str:
    """
    Generate a helpful hint for a student question using DeepSeek model.
    
    Args:
        messages: List of conversation messages with context
                 Last message should be the question needing a hint
        level: Hint level (1=subtle, 2=specific, 3=near-answer)
        temperature: Sampling temperature (0.0-1.0), higher = more creative
        max_tokens: Maximum tokens in response
    
    Returns:
        Generated hint text
    
    Raises:
        ValueError: If messages list is empty
        RuntimeError: If model loading or inference fails
    """
    if not messages or len(messages) == 0:
        raise ValueError("Messages list cannot be empty")
    
    if not isinstance(messages, list):
        raise ValueError("Messages must be a list of dicts")
    
    try:
        # Load model and tokenizer
        model, tokenizer = load_model_and_tokenizer()
        
        # Build the hint-specific system prompt based on level
        hint_prompts = {
            1: """You are a helpful AI tutor. Generate a LEVEL 1 HINT - Very subtle and conceptual.
- Do NOT give direct clues or mention any specifics
- Help them think about the concept
- Ask a guiding question or provide a conceptual direction
- Keep response to 2-3 lines max
- Be conversational and encouraging
Example: "Think about what the definition of X really means..." or "Have you considered the relationship between A and B?"
""",
            2: """You are a helpful AI tutor. Generate a LEVEL 2 HINT - More specific guidance.
- Guide them toward the right area/approach without revealing the answer
- Mention key concepts or areas to focus on
- Do NOT state the answer
- Keep response to 3-4 lines max
Example: "Look at the time complexity - specifically focus on how many times this operation runs..."
""",
            3: """You are a helpful AI tutor. Generate a LEVEL 3 HINT - Clear direction, almost the answer.
- Be very specific about the approach or method
- Narrow it down to 1-2 possible answers/directions
- Give clear reasoning but stop just before stating the final answer
- Keep response to 3-4 lines max
Example: "The answer is in this category: X or Y. Think about which one applies when..."
"""
        }
        
        system_prompt = hint_prompts.get(level, hint_prompts[1])
        
        # Prepare the conversation context
        conversation = encode_messages(messages)
        
        # Build the full prompt
        full_prompt = f"{system_prompt}\n\nConversation:\n{conversation}\n\nAssistant:"
        
        # Tokenize input
        inputs = tokenizer.encode(full_prompt, return_tensors="pt").to(model.device)
        
        # Generate response
        with torch.no_grad():
            outputs = model.generate(
                inputs,
                max_new_tokens=max_tokens,
                temperature=temperature,
                top_p=0.95,
                do_sample=True,
                pad_token_id=tokenizer.eos_token_id,
            )
        
        # Decode response
        response_text = tokenizer.decode(outputs[0], skip_special_tokens=True)
        
        # Extract only the new generated text (remove the prompt)
        if full_prompt in response_text:
            response_text = response_text.split(full_prompt)[-1].strip()
        
        # Parse and clean the response
        hint_text = parse_message_from_completion_text(response_text)
        
        if not hint_text:
            return "I couldn't generate a hint at this moment. Try rephrasing your question."
        
        return hint_text
        
    except ValueError as ve:
        logger.error(f"Value error in hint generation: {str(ve)}")
        raise
    except RuntimeError as re:
        logger.error(f"Runtime error (possibly CUDA/memory): {str(re)}")
        raise RuntimeError(f"Model inference failed: {str(re)}")
    except Exception as e:
        logger.error(f"Unexpected error in DeepSeek hint generation: {type(e).__name__}: {str(e)}")
        raise RuntimeError(f"Error generating hint: {str(e)}")


def generate_concept_tag(question: str) -> str:
    """
    Generate a concept tag based on the question content.
    Used for categorizing hints.
    
    Args:
        question: The student's question
    
    Returns:
        Concept tag string
    """
    question_lower = question.lower()
    
    # Category keywords mapping
    categories = {
        "Data Structures": ["array", "list", "stack", "queue", "tree", "graph", "linked", "hash", "heap"],
        "Complexity Analysis": ["time complexity", "o(", "o(n", "space complexity", "big o", "asymptotic"],
        "Algorithms": ["sort", "search", "traversal", "dynamic programming", "greedy", "recursion", "backtrack"],
        "DBMS": ["database", "sql", "query", "transaction", "normalization", "key", "index", "join"],
        "OS": ["process", "thread", "memory", "scheduling", "deadlock", "synchronization", "interrupt"],
        "Web Development": ["http", "request", "response", "api", "rest", "endpoint", "status code"],
        "Python": ["python", "list", "dict", "tuple", "decorator", "lambda"],
        "JavaScript": ["javascript", "async", "promise", "callback", "dom", "event"],
    }
    
    for category, keywords in categories.items():
        if any(keyword in question_lower for keyword in keywords):
            return category
    
    return "Computer Science Fundamentals"


def validate_model_availability() -> Tuple[bool, str]:
    """
    Check if the DeepSeek model can be loaded (internet connectivity, disk space, etc).
    
    Returns:
        Tuple of (is_available: bool, message: str)
    """
    try:
        load_model_and_tokenizer()
        return True, "DeepSeek model loaded successfully"
    except Exception as e:
        error_msg = f"Failed to load DeepSeek model: {str(e)}"
        logger.error(error_msg)
        return False, error_msg
