"""
Demo script showing the Hint Chat System functionality
"""

def demo_hint_system():
    """Demonstrate how the hint system works with different types of questions"""

    # Sample questions and responses
    demo_scenarios = [
        {
            "question": "What is the time complexity of accessing an element in an array?",
            "user_messages": [
                "give me a hint",
                "explain time complexity",
                "what is O(1)"
            ],
            "expected_responses": [
                "Hint: Focus on the concept of time complexity. Think about its key characteristics and use cases.",
                "Time complexity measures how the runtime grows with input size. O(1) means constant time, O(n) means linear time.",
                "O(1) means constant time complexity - the operation takes the same amount of time regardless of input size."
            ]
        },
        {
            "question": "Which data structure uses LIFO principle?",
            "user_messages": [
                "what does LIFO mean",
                "give me a hint",
                "explain stack"
            ],
            "expected_responses": [
                "LIFO stands for Last In, First Out - the last item added is the first one removed.",
                "Hint: Focus on the concept of stack. Think about its key characteristics and use cases.",
                "Stack follows LIFO (Last In, First Out). Operations: push, pop, peek. Used for function calls, undo operations."
            ]
        }
    ]

    print("🤖 AI Hint System Demo")
    print("=" * 50)

    for i, scenario in enumerate(demo_scenarios, 1):
        print(f"\n📚 Scenario {i}: {scenario['question'][:50]}...")
        print("-" * 30)

        for j, (user_msg, expected) in enumerate(zip(scenario['user_messages'], scenario['expected_responses'])):
            print(f"👤 User: {user_msg}")
            print(f"🤖 Bot: {expected}")
            print()

    print("✨ Key Features:")
    print("• Contextual hints based on question content")
    print("• Progressive learning (hints before answers)")
    print("• Multi-turn conversation support")
    print("• Educational focus on concepts")
    print("• No direct answer spoilers")

if __name__ == "__main__":
    demo_hint_system()