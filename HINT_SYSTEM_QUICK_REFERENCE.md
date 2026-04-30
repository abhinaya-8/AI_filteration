# Hint System Quick Reference & Troubleshooting

## 🔄 How the Hint System Works

```
User opens KnowledgeChecker page
    ↓
Clicks "Hint" button on a question
    ↓
HintChatPanel opens (right side panel)
    ↓
User selects Level 1, 2, or 3
    ↓
Frontend calls: POST /api/users/hint-chat
    ↓
Backend processes request with Gemini API
    ↓
Gemini generates hint based on level
    ↓
Response displayed in panel with color coding
    ↓
Button marked "✓ Received" and disabled
    ↓
User can request up to 3 hints max
```

## 📁 System Components

### Backend
```
backend/app/routes/users.py
└── hint_chat() [Line 256]
    ├── Accepts: question, level (1-3), userAttempt
    ├── Calls: genai.GenerativeModel("gemini-2.0-flash")
    └── Returns: {reply, timestamp, concept}
```

### Frontend
```
frontend/src/components/HintChatPanel.jsx
├── State: hints{}, isLoading, hintCount
├── Methods: requestHint(level)
└── UI: Side panel with 3 buttons
    ├── Level 1 (Amber) - Subtle hint
    ├── Level 2 (Orange) - Specific guidance
    └── Level 3 (Green) - Almost answer

Integration:
frontend/src/pages/KnowledgeChecker.jsx
└── Imports HintChatPanel with question prop
```

### API Layer
```
frontend/src/services/api.js
└── export const hintChat = (data) => 
    api.post('/users/hint-chat', data)
```

## 🧪 Testing

### Run Verification Test
```bash
cd backend
python test_hint_system.py
```

This will test:
- ✓ Gemini API configuration
- ✓ Available models
- ✓ Hint generation for levels 1, 2, 3

## ⚙️ Configuration

### Environment Variables Needed
```
GEMINI_API_KEY=your_api_key_here
```

Location: `backend/.env`

### Current API Key Status
- ✅ Configured
- ✅ Valid and authenticated
- ⚠️ Free tier quota exhausted

## 🐛 Troubleshooting

### Issue 1: "API Key Missing"
**Solution:** Add GEMINI_API_KEY to backend/.env
```env
GEMINI_API_KEY=AIzaSyDaeNt4-JB09y7Bh_xPPViQcUQhhU7q6XU
```

### Issue 2: 429 Error - Quota Exceeded
**Current Status:** This is happening now ⚠️

**Causes:**
- Free tier API quota exhausted
- Too many requests in short time
- Daily limit reached

**Solutions:**
1. **Upgrade to Paid Plan** (RECOMMENDED)
   - Visit: https://ai.google.dev/
   - Add billing information
   - Unlocks higher quotas

2. **Wait for Reset**
   - Free tier resets every 24 hours
   - Can retry next day

3. **Use Alternative Model** (NOT RECOMMENDED)
   - Change "gemini-2.0-flash" in users.py:315
   - To: "gemini-pro" or other available model

### Issue 3: Button Not Working
**Check:**
- Is hintCount < 3?
- Is the hint already received for this level?
- Is the API request still loading?

## 🎨 UI States

### Hint Panel
- **Open:** Shows current question + hint buttons
- **Closed:** Right side panel hidden

### Buttons
- **Normal:** Colored (Amber/Orange/Green), clickable
- **Loading:** Spinner animation during API call
- **Received:** ✓ mark, button disabled
- **Max Reached:** All buttons disabled, gray color

### Hint Display
- **Level 1:** Amber background, border-left amber
- **Level 2:** Orange background, border-left orange
- **Level 3:** Green background, border-left green

## 📊 Feature Matrix

| Feature | Implemented | Tested | Status |
|---------|-------------|--------|--------|
| Level 1 Hints | ✅ | ⚠️ | API Quota Limited |
| Level 2 Hints | ✅ | ⚠️ | API Quota Limited |
| Level 3 Hints | ✅ | ⚠️ | API Quota Limited |
| Hint Count Limit | ✅ | ✅ | Working |
| UI Components | ✅ | ✅ | Working |
| Error Handling | ✅ | ✅ | Working |
| Button States | ✅ | ✅ | Working |
| Color Coding | ✅ | ✅ | Working |
| API Integration | ✅ | ✅ | Working |

## 🔍 Debug Commands

### Check API Key
```bash
echo $env:GEMINI_API_KEY  # PowerShell
echo $GEMINI_API_KEY      # Bash
```

### Test Backend Directly
```python
import os
from dotenv import load_dotenv
load_dotenv()
import google.generativeai as genai

api_key = os.environ.get("GEMINI_API_KEY")
genai.configure(api_key=api_key)
model = genai.GenerativeModel("gemini-2.0-flash")
response = model.generate_content("Say hello")
print(response.text)
```

### Check Models Available
```python
import os
from dotenv import load_dotenv
load_dotenv()
import google.generativeai as genai

api_key = os.environ.get("GEMINI_API_KEY")
genai.configure(api_key=api_key)

for model in genai.list_models():
    if 'generateContent' in model.supported_generation_methods:
        print(model.name)
```

## 📈 Next Steps

1. **Immediate:** Upgrade Gemini API plan
2. **Short-term:** Update deprecated library
3. **Medium-term:** Add retry mechanisms
4. **Long-term:** Implement caching layer

---
**Last Updated:** April 30, 2026
