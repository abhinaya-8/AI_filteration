# DeepSeek Hint Generator Integration Guide

## Overview

The Knowledge Checker in this application now uses **DeepSeek-V4-Pro**, an open-source language model from Hugging Face, to generate educational hints for students. This replaces the previous Gemini API integration, offering:

✅ **Open-source** - No paid API keys required  
✅ **Privacy** - Model can run locally  
✅ **Free** - No usage costs or rate limits  
✅ **Context-aware** - Maintains conversation history  
✅ **Flexible** - Three difficulty levels of hints  

---

## What Changed

### Removed
- `google-generativeai` dependency (Gemini API)
- `GEMINI_API_KEY` environment variable requirement
- Direct API calls to Google's servers

### Added
- `transformers` library (Hugging Face)
- `torch` library (PyTorch)
- `accelerate` library (GPU support)
- New module: `app/ml/deepseek_hint_generator.py`

---

## Installation & Setup

### 1. Update Dependencies

```bash
cd backend
pip install -r requirements.txt
```

The following packages will be installed:
```
transformers>=4.40.0  # Hugging Face model hub
torch>=2.0.0          # Deep learning framework
accelerate>=0.24.0    # GPU acceleration support
```

### 2. No API Keys Needed

Remove or comment out `GEMINI_API_KEY` from your `.env` file (if present):

```bash
# OLD (no longer needed)
# GEMINI_API_KEY=your-key-here

# NEW - No changes needed for DeepSeek!
```

### 3. First Run

When the hint endpoint is called for the first time:
- DeepSeek model (~8GB) downloads from Hugging Face
- Model is cached locally for subsequent uses
- Initial request may take 30-60 seconds
- Subsequent requests complete in 2-5 seconds

---

## API Usage

### Endpoint

```
POST /api/users/hint-chat
```

### Request Body

```json
{
  "question": "What is the time complexity of binary search?",
  "level": 1,
  "userAttempt": "O(n) because we iterate through the array?",
  "conversationHistory": [
    {
      "role": "user",
      "content": "Can you help me with searching algorithms?"
    },
    {
      "role": "assistant",
      "content": "Sure! Let's start with binary search..."
    }
  ]
}
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `question` | string | ✅ Yes | The student's question |
| `level` | integer | ❌ No | Hint difficulty: 1 (subtle), 2 (specific), 3 (near-answer). Default: 1 |
| `userAttempt` | string | ❌ No | Student's current attempt/understanding |
| `conversationHistory` | array | ❌ No | Previous messages for context |

### Hint Levels

**Level 1 - Subtle & Conceptual** (Default)
- Very subtle guidance
- Conceptual thinking only
- No direct clues
- Example: "Think about what happens when you eliminate half the data each time..."

**Level 2 - Specific Guidance**
- More focused direction
- Mention key concepts
- Narrow the approach
- Example: "Focus on how binary search divides the search space at each step..."

**Level 3 - Clear Direction**
- Almost the answer
- Specific approach
- Multiple possible answers
- Example: "Each comparison eliminates half of the remaining data, so count how many times you can divide by 2..."

### Response

```json
{
  "reply": "Think about what happens when you eliminate half the data with each comparison...",
  "timestamp": "2026-05-01T12:30:45.123456",
  "concept": "Complexity Analysis",
  "model": "DeepSeek-V4-Pro",
  "level": 1
}
```

---

## Architecture & Implementation

### Core Module: `app/ml/deepseek_hint_generator.py`

#### Key Functions

##### `load_model_and_tokenizer()`
```python
def load_model_and_tokenizer() -> Tuple[model, tokenizer]
```
- Lazy loads the DeepSeek model from Hugging Face
- Caches globally to avoid repeated downloads
- Handles GPU/CPU device selection automatically
- Returns `(model, tokenizer)` tuple

##### `encode_messages(messages)`
```python
def encode_messages(messages: List[Dict[str, str]]) -> str
```
- Converts a list of message dicts to chat format
- Input: `[{"role": "user", "content": "..."}, ...]`
- Output: Formatted string for model input

##### `parse_message_from_completion_text(text)`
```python
def parse_message_from_completion_text(text: str) -> str
```
- Cleans and parses model output
- Removes prompts and extra tokens
- Limits to 4 sentences max for conciseness
- Returns readable hint text

##### `generate_hint(messages, level, temperature, max_tokens)`
```python
def generate_hint(
    messages: List[Dict[str, str]],
    level: int = 1,
    temperature: float = 0.7,
    max_tokens: int = 200
) -> str
```
- Main function to generate hints
- Accepts conversation context
- Supports 3 difficulty levels
- Returns hint text

**Parameters:**
- `messages`: Conversation history with current question
- `level`: 1 (subtle), 2 (specific), or 3 (near-answer)
- `temperature`: 0.0-1.0 (0=deterministic, 1=random). Default: 0.7
- `max_tokens`: Max response length. Default: 200

**Returns:**
- String containing the hint

**Raises:**
- `ValueError`: If messages are invalid
- `RuntimeError`: If model inference fails

##### `generate_concept_tag(question)`
```python
def generate_concept_tag(question: str) -> str
```
- Auto-categorizes questions based on keywords
- Returns concept tags like "Data Structures", "Complexity Analysis", etc.
- Used for analytics and UI organization

---

## Performance Tuning

### Temperature Settings

Adjust `temperature` in the `generate_hint()` call in `users.py`:

```python
# Current: More consistent hints
reply_text = generate_hint(
    messages=messages,
    level=level,
    temperature=0.6,  # ← Adjust here (0.0-1.0)
    max_tokens=200
)
```

- **0.0-0.3**: Deterministic, repetitive (good for precise hints)
- **0.4-0.7**: Balanced, consistent (recommended)
- **0.8-1.0**: Creative, varied (more diverse hints)

### Max Tokens

Limit response length by adjusting `max_tokens`:

```python
reply_text = generate_hint(
    messages=messages,
    level=level,
    temperature=0.6,
    max_tokens=150  # ← Adjust here (50-500)
)
```

- **150**: Very concise (2-3 sentences)
- **200**: Standard (3-4 sentences, default)
- **300**: Detailed (4-5 sentences)

### GPU vs CPU

The module automatically:
- Uses **GPU** if CUDA/Metal is available (fast)
- Falls back to **CPU** if no GPU (slower)

Force CPU-only mode if GPU causes issues:
```python
# In deepseek_hint_generator.py, line ~18:
DEVICE = "cpu"  # Force CPU
```

---

## Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `CUDA out of memory` | GPU is too small | Use CPU or reduce `max_tokens` |
| `Connection timeout` | Can't download model | Check internet, retry |
| `Model not found` | Wrong model name | Verify `MODEL_NAME` in config |
| `TokenizerNotFound` | Tokenizer loading failed | Run `transformers-cli` to debug |

### Response Codes

| Code | Meaning | Next Steps |
|------|---------|-----------|
| 200 | Success | Hint generated successfully |
| 400 | Bad request | Check JSON structure and parameters |
| 503 | Service unavailable | Model is loading, retry in 30 seconds |
| 500 | Server error | Check logs, report with error message |

---

## Integration with Flask Route

### Updated Route: `POST /api/users/hint-chat`

Located in `app/routes/users.py`:

```python
@users_bp.route("/hint-chat", methods=["POST"])
@token_required
def hint_chat(user_id):
    """
    Generates hints using DeepSeek model.
    - No API key required
    - Supports conversation history
    - 3 difficulty levels
    """
    data = request.get_json() or {}
    question = data.get("question", "").strip()
    level = int(data.get("level", 1))
    user_attempt = data.get("userAttempt", "No attempt yet").strip()
    conversation_history = data.get("conversationHistory", [])
    
    # Build message list for context
    messages = []
    if isinstance(conversation_history, list):
        for msg in conversation_history:
            if isinstance(msg, dict) and "role" in msg and "content" in msg:
                messages.append(msg)
    
    messages.append({
        "role": "user",
        "content": f"Question: {question}\n\nMy attempt: {user_attempt}"
    })
    
    # Generate hint
    reply_text = generate_hint(
        messages=messages,
        level=level,
        temperature=0.6,
        max_tokens=200
    )
    
    concept = generate_concept_tag(question)
    
    return jsonify({
        "reply": reply_text,
        "timestamp": datetime.utcnow().isoformat(),
        "concept": concept,
        "model": "DeepSeek-V4-Pro",
        "level": level
    })
```

---

## Testing

### Manual Test

```bash
cd backend
python -c "
from app.ml.deepseek_hint_generator import generate_hint

messages = [
    {'role': 'user', 'content': 'What is binary search?'},
    {'role': 'assistant', 'content': 'Binary search is an efficient search algorithm...'},
    {'role': 'user', 'content': 'How to find its time complexity?'}
]

hint = generate_hint(messages, level=1)
print('Hint:', hint)
"
```

### Frontend Test

```javascript
// Test via frontend
const response = await fetch('http://localhost:5000/api/users/hint-chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer YOUR_JWT_TOKEN`
  },
  body: JSON.stringify({
    question: 'What is the space complexity of merge sort?',
    level: 2,
    userAttempt: 'O(1) because we reuse the same array?',
    conversationHistory: []
  })
});

const data = await response.json();
console.log('Hint:', data.reply);
console.log('Concept:', data.concept);
```

---

## Troubleshooting

### Model Won't Load

**Problem**: Model downloads are slow or fail
**Solution**: 
```bash
# Pre-download model manually
python -c "from transformers import AutoModel; AutoModel.from_pretrained('deepseek-ai/DeepSeek-V4-Pro')"
```

### Memory Issues

**Problem**: "CUDA out of memory" or very slow
**Solution**:
1. Reduce `max_tokens` to 150
2. Use CPU instead of GPU
3. Install `bitsandbytes` for quantization:
   ```bash
   pip install bitsandbytes
   ```

### CORS/Authentication Issues

**Problem**: Frontend can't reach the endpoint
**Solution**: Check `CORS_ORIGINS` in `.env`:
```
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

---

## Future Improvements

Potential enhancements:

- [ ] Model quantization for faster inference
- [ ] Caching hint responses for duplicate questions
- [ ] Fine-tuning DeepSeek on educational data
- [ ] Multi-language support
- [ ] Streaming responses for faster perceived performance
- [ ] Integration with analytics for hint effectiveness tracking

---

## References

- **DeepSeek Model**: https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro
- **Hugging Face Transformers**: https://huggingface.co/docs/transformers/
- **PyTorch**: https://pytorch.org/docs/stable/
- **Accelerate**: https://huggingface.co/docs/accelerate/

---

## Support

If you encounter issues:
1. Check the logs in `backend/app.log`
2. Verify model download from HuggingFace
3. Test with the manual test script above
4. Check system resources (RAM/VRAM)

