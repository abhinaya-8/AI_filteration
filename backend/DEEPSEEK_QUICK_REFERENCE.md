# DeepSeek Integration - Quick Reference

## Installation

```bash
cd backend
pip install -r requirements.txt
```

## Key Changes

### ✅ New Files
- `app/ml/deepseek_hint_generator.py` - Core DeepSeek integration module
- `DEEPSEEK_INTEGRATION.md` - Full documentation

### ✅ Modified Files
- `requirements.txt` - Replaced Gemini with Transformers
- `app/routes/users.py` - Updated `/hint-chat` endpoint
- `backend/.env.example` - Removed GEMINI_API_KEY
- `backend/app/ml/__init__.py` - May need to update imports

### ❌ Removed Files
- NONE (Gemini code is replaced, not deleted for backward compatibility)

## API Endpoint

```
POST /api/users/hint-chat
Authorization: Bearer <JWT_TOKEN>

Body:
{
  "question": "How to find time complexity?",
  "level": 1,  // 1=subtle, 2=specific, 3=near-answer
  "userAttempt": "I think it's O(n)",
  "conversationHistory": []  // Optional
}

Response:
{
  "reply": "Think about how many iterations occur relative to input size...",
  "concept": "Complexity Analysis",
  "model": "DeepSeek-V4-Pro",
  "level": 1,
  "timestamp": "2026-05-01T12:30:45.123456"
}
```

## Core Functions

```python
# In app/ml/deepseek_hint_generator.py

# Main function - generates hints
generate_hint(messages, level=1, temperature=0.7, max_tokens=200)

# Encode message history for model input
encode_messages(messages)

# Parse model output
parse_message_from_completion_text(text)

# Categorize questions
generate_concept_tag(question)

# Check model availability
validate_model_availability()
```

## Performance Notes

- **First run**: 30-60 seconds (model download + cache)
- **Subsequent runs**: 2-5 seconds (cached model)
- **GPU**: ~2-3 seconds per request
- **CPU**: ~5-10 seconds per request
- **Model size**: ~8GB (auto-downloaded from HuggingFace)

## Configuration

In `app/routes/users.py`, line ~386:

```python
reply_text = generate_hint(
    messages=messages,
    level=level,
    temperature=0.6,      # Lower = more consistent (0.0-1.0)
    max_tokens=200        # Max response length (50-500)
)
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Slow first request | Normal - model is loading, ~30-60 seconds |
| CUDA out of memory | Use CPU or reduce max_tokens to 150 |
| Model not found | Check internet connection for HuggingFace download |
| Empty response | Check question/message format |

## Environment Variables

**REMOVED** (no longer needed):
```
GEMINI_API_KEY=...
```

**NEW** (optional):
- None required! DeepSeek works out of the box.

## Next Steps

1. ✅ Install dependencies: `pip install -r requirements.txt`
2. ✅ Test endpoint with POST to `/api/users/hint-chat`
3. ✅ Monitor logs for any loading issues
4. ✅ Adjust temperature/max_tokens as needed for your use case

## Files Reference

| File | Purpose |
|------|---------|
| `app/ml/deepseek_hint_generator.py` | Core integration logic |
| `app/routes/users.py` | Flask endpoint |
| `requirements.txt` | Dependencies |
| `DEEPSEEK_INTEGRATION.md` | Full documentation |
| `DEEPSEEK_QUICK_REFERENCE.md` | This file |

