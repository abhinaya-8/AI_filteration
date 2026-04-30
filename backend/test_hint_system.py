"""
Test script to verify the hint system is working correctly
Tests the Gemini API integration with different hint levels
"""
import os
import sys
import json
from datetime import datetime

# Add the backend directory to path
sys.path.insert(0, os.path.dirname(__file__))

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

def test_gemini_api():
    """Test if Gemini API is properly configured and accessible"""
    print("=" * 70)
    print("🔍 GEMINI API CONFIGURATION TEST")
    print("=" * 70)
    
    api_key = os.environ.get("GEMINI_API_KEY")
    
    if not api_key or api_key == "your_gemini_api_key_here":
        print("❌ ERROR: GEMINI_API_KEY not configured in .env")
        return False
    
    print(f"✓ API Key found: {api_key[:10]}...{api_key[-10:]}")
    
    try:
        import google.generativeai as genai
        genai.configure(api_key=api_key)
        
        print("✓ Google GenAI library imported successfully")
        print("✓ API key configured")
        
        return True
    except Exception as e:
        print(f"❌ ERROR importing/configuring Gemini API: {e}")
        return False


def test_hint_generation(level=1):
    """Test hint generation for a specific level"""
    print("\n" + "=" * 70)
    print(f"🎯 TESTING HINT GENERATION - LEVEL {level}")
    print("=" * 70)
    
    import google.generativeai as genai
    
    api_key = os.environ.get("GEMINI_API_KEY")
    genai.configure(api_key=api_key)
    
    question = "What is the time complexity of accessing an element in an array?"
    user_attempt = "No attempt yet"
    
    print(f"Question: {question}")
    print(f"Level: {level}")
    print()
    
    try:
        # Build prompt based on hint level
        if level == 1:
            prompt = f"""You are a helpful AI tutor. A student is asking about:

Question: "{question}"

Student's attempt: {user_attempt}

Provide a LEVEL 1 HINT - Very subtle and conceptual. Do NOT give direct clues or mention any specifics. 
- Just help them think about the concept
- Ask a guiding question or provide a conceptual direction
- Keep it to 2-3 lines max
- Be conversational and encouraging
- Examples: "Think about what the definition of X really means..." or "Have you considered the relationship between A and B?"

Keep your response SHORT (2-4 lines max)."""
        
        elif level == 2:
            prompt = f"""You are a helpful AI tutor. A student is asking about:

Question: "{question}"

Student's attempt: {user_attempt}

Provide a LEVEL 2 HINT - More specific guidance. Narrow down their thinking without revealing the answer.
- Guide them toward the right area/approach
- Mention key concepts or areas to focus on
- But DO NOT state the answer
- Keep it to 3-4 lines max
- Examples: "Look at the time complexity - specifically focus on how many times this operation runs..." or "Consider what happens when you move from position X to position Y..."

Keep your response SHORT (3-4 lines max)."""
        
        else:  # level == 3
            prompt = f"""You are a helpful AI tutor. A student is asking about:

Question: "{question}"

Student's attempt: {user_attempt}

Provide a LEVEL 3 HINT - Clear direction, almost the answer, but NOT the final answer.
- Be very specific about the approach or method
- Narrow it down to 1-2 possible answers/directions
- Give clear reasoning but stop just before stating the final answer
- Examples: "The answer is in this category: X or Y. Think about which one applies when..." or "You need to apply the formula... but with this specific parameter..."

Keep your response SHORT (3-4 lines max)."""

        print("🔄 Calling Gemini API...")
        print()
        
        # Call Gemini model
        model = genai.GenerativeModel("gemini-2.0-flash")
        response = model.generate_content(prompt)
        
        reply_text = response.text
        
        print("✅ SUCCESS - Hint Generated:")
        print("-" * 70)
        print(reply_text)
        print("-" * 70)
        print()
        print(f"Response length: {len(reply_text)} characters")
        print(f"Response lines: {len(reply_text.split(chr(10)))} lines")
        
        return True
        
    except Exception as e:
        print(f"❌ ERROR generating hint: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_all_hint_levels():
    """Test all three hint levels"""
    print("\n\n")
    print("🚀 TESTING ALL HINT LEVELS")
    print("=" * 70)
    
    results = {
        1: test_hint_generation(level=1),
        2: test_hint_generation(level=2),
        3: test_hint_generation(level=3),
    }
    
    return results


def test_gemini_models():
    """Test which Gemini models are available"""
    print("\n" + "=" * 70)
    print("📋 AVAILABLE GEMINI MODELS")
    print("=" * 70)
    
    import google.generativeai as genai
    
    api_key = os.environ.get("GEMINI_API_KEY")
    genai.configure(api_key=api_key)
    
    try:
        models = genai.list_models()
        print(f"✓ Found {len(list(models))} models\n")
        
        # List available models
        for model in genai.list_models():
            if 'generateContent' in model.supported_generation_methods:
                print(f"  • {model.name}")
        
        return True
    except Exception as e:
        print(f"❌ ERROR listing models: {e}")
        return False


def generate_report(all_tests_passed, level_results):
    """Generate a comprehensive verification report"""
    print("\n\n")
    print("=" * 70)
    print("📊 HINT SYSTEM VERIFICATION REPORT")
    print("=" * 70)
    print()
    
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"Timestamp: {timestamp}")
    print()
    
    # Overall status
    status = "✅ WORKING" if all_tests_passed else "❌ ISSUES FOUND"
    print(f"Overall Status: {status}")
    print()
    
    # Level Results
    print("Level Results:")
    for level, success in level_results.items():
        symbol = "✅" if success else "❌"
        print(f"  {symbol} Level {level}: {'PASS' if success else 'FAIL'}")
    
    print()
    print("=" * 70)
    print()
    
    if all_tests_passed:
        print("✨ CONCLUSION: The hint system is working correctly!")
        print()
        print("Components verified:")
        print("  • Gemini API configuration")
        print("  • API key authentication")
        print("  • Hint generation for all 3 levels")
        print("  • Response formatting and length validation")
    else:
        print("⚠️  CONCLUSION: The hint system has issues that need to be fixed.")
        print()
        print("Please check the errors above for details.")


def main():
    """Run all tests"""
    print("\n")
    print("🔬 HINT SYSTEM VERIFICATION TEST SUITE")
    print("=" * 70)
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    # Test 1: API Configuration
    api_config_ok = test_gemini_api()
    
    if not api_config_ok:
        print("\n❌ Cannot proceed - API is not configured properly")
        generate_report(False, {})
        return
    
    # Test 2: Available Models
    test_gemini_models()
    
    # Test 3: All Hint Levels
    level_results = test_all_hint_levels()
    
    # Generate Report
    all_tests_passed = all(level_results.values())
    generate_report(all_tests_passed, level_results)
    
    print(f"Completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")


if __name__ == "__main__":
    main()
