"""
REST API: Current user profile and admin company info.
"""
import json
import os
from flask import Blueprint, jsonify, current_app, request
from bson import ObjectId

from app.utils.auth import token_required, admin_required

users_bp = Blueprint("users", __name__)

DATASET_PATH = os.path.join(os.path.dirname(__file__), '..', 'models', 'knowledge_progress_dataset.json')

def load_knowledge_dataset():
    """Load the knowledge progress dataset from file."""
    try:
        with open(DATASET_PATH, 'r') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        # Return default structure if file doesn't exist or is corrupted
        return {
            "metadata": {
                "description": "Knowledge Checker Progress Dataset",
                "created": "2026-04-05",
                "version": "1.0",
                "purpose": "Track user XP, total correct questions, and weak areas for analytics and progress monitoring"
            },
            "users": {},
            "global_stats": {
                "total_users": 0,
                "total_xp_earned": 0,
                "average_xp_per_user": 0,
                "most_common_weak_areas": [],
                "domain_completion_rates": {
                    "DSA": 0,
                    "DBMS": 0,
                    "OS": 0,
                    "Web Dev": 0
                }
            }
        }

def save_knowledge_dataset(dataset):
    """Save the knowledge progress dataset to file."""
    try:
        with open(DATASET_PATH, 'w') as f:
            json.dump(dataset, f, indent=2)
    except Exception as e:
        current_app.logger.error(f"Failed to save knowledge dataset: {e}")

def update_dataset_stats(dataset):
    """Update global statistics in the dataset."""
    users = dataset["users"]
    total_users = len(users)
    total_xp = sum(user_data.get("xp", 0) for user_data in users.values())

    # Count weak areas
    weak_area_counts = {}
    for user_data in users.values():
        for area in user_data.get("weakAreas", []):
            weak_area_counts[area] = weak_area_counts.get(area, 0) + 1

    most_common_weak_areas = sorted(weak_area_counts.items(), key=lambda x: x[1], reverse=True)[:5]

    dataset["global_stats"] = {
        "total_users": total_users,
        "total_xp_earned": total_xp,
        "average_xp_per_user": total_xp / total_users if total_users > 0 else 0,
        "most_common_weak_areas": most_common_weak_areas,
        "domain_completion_rates": dataset["global_stats"].get("domain_completion_rates", {
            "DSA": 0,
            "DBMS": 0,
            "OS": 0,
            "Web Dev": 0
        })
    }


@users_bp.route("/me", methods=["GET"])
@token_required
def me(user_id):
    """
    GET /api/users/me
    Returns current user + company name if Admin.
    """
    user = current_app.db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        return jsonify({"error": "User not found"}), 404

    out = {
        "id": str(user["_id"]),
        "name": user["name"],
        "email": user["email"],
        "role": user["role"],
        "companyId": user.get("companyId"),
        "companyName": None,
        "knowledgeXP": user.get("knowledgeXP", 0),
        "totalCorrectQuestions": user.get("totalCorrectQuestions", 0),
        "knowledgeWeakAreas": user.get("knowledgeWeakAreas", []),
    }
    if user.get("companyId"):
        company = current_app.db.companies.find_one({"_id": ObjectId(user["companyId"])})
        if company:
            out["companyName"] = company.get("companyName")

    return jsonify(out)


@users_bp.route("/knowledge-progress", methods=["GET"])
@token_required
def get_knowledge_progress(user_id):
    """
    GET /api/users/knowledge-progress
    Returns current user's knowledge XP progress and weak areas.
    """
    user = current_app.db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        return jsonify({"error": "User not found"}), 404

    # Also check dataset for additional data
    dataset = load_knowledge_dataset()
    user_data = dataset["users"].get(user_id, {})

    return jsonify({
        "xp": user.get("knowledgeXP", 0),
        "totalCorrectQuestions": user.get("totalCorrectQuestions", 0),
        "weakAreas": user.get("knowledgeWeakAreas", []),
        "dataset_xp": user_data.get("xp", 0),
        "dataset_totalCorrectQuestions": user_data.get("totalCorrectQuestions", 0),
        "last_updated": user_data.get("last_updated")
    })


@users_bp.route("/knowledge-progress", methods=["POST"])
@token_required
def update_knowledge_progress(user_id):
    """
    POST /api/users/knowledge-progress
    Body: { xpDelta, totalCorrectQuestions, weakAreas }
    Updates the user's knowledge challenge progress in both MongoDB and dataset.
    """
    from datetime import datetime

    data = request.get_json() or {}
    xp_delta = int(data.get("xpDelta", 0))
    total_correct_questions = data.get("totalCorrectQuestions")
    weak_areas = data.get("weakAreas")

    user = current_app.db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        return jsonify({"error": "User not found"}), 404

    # Update MongoDB
    update_fields = {}
    if xp_delta:
        update_fields["knowledgeXP"] = user.get("knowledgeXP", 0) + xp_delta
    if total_correct_questions is not None:
        try:
            total_correct_val = int(total_correct_questions)
            update_fields["totalCorrectQuestions"] = total_correct_val
        except (TypeError, ValueError):
            pass
    if weak_areas is not None and isinstance(weak_areas, list):
        update_fields["knowledgeWeakAreas"] = list({*user.get("knowledgeWeakAreas", []), *weak_areas})

    if update_fields:
        current_app.db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": update_fields}
        )

    # Update dataset
    dataset = load_knowledge_dataset()
    if user_id not in dataset["users"]:
        dataset["users"][user_id] = {
            "user_id": user_id,
            "name": user.get("name", ""),
            "email": user.get("email", ""),
            "xp": 0,
            "totalCorrectQuestions": 0,
            "weakAreas": [],
            "progress_history": [],
            "created_at": datetime.utcnow().isoformat()
        }

    user_dataset = dataset["users"][user_id]

    # Update dataset values
    if xp_delta:
        user_dataset["xp"] = user_dataset.get("xp", 0) + xp_delta
    if total_correct_questions is not None:
        try:
            total_correct_val = int(total_correct_questions)
            user_dataset["totalCorrectQuestions"] = total_correct_val
        except (TypeError, ValueError):
            pass
    if weak_areas is not None and isinstance(weak_areas, list):
        user_dataset["weakAreas"] = list(set(user_dataset.get("weakAreas", []) + weak_areas))

    # Add progress entry to history
    progress_entry = {
        "timestamp": datetime.utcnow().isoformat(),
        "xp_delta": xp_delta,
        "new_totalCorrectQuestions": user_dataset.get("totalCorrectQuestions", 0),
        "weak_areas": weak_areas or []
    }
    user_dataset["progress_history"] = user_dataset.get("progress_history", [])
    user_dataset["progress_history"].append(progress_entry)

    # Keep only last 100 entries to prevent file from growing too large
    if len(user_dataset["progress_history"]) > 100:
        user_dataset["progress_history"] = user_dataset["progress_history"][-100:]

    user_dataset["last_updated"] = datetime.utcnow().isoformat()

    # Update global stats
    update_dataset_stats(dataset)

    # Save dataset
    save_knowledge_dataset(dataset)

    # Get updated user data
    user = current_app.db.users.find_one({"_id": ObjectId(user_id)})
    return jsonify({
        "xp": user.get("knowledgeXP", 0),
        "totalCorrectQuestions": user.get("totalCorrectQuestions", 0),
        "weakAreas": user.get("knowledgeWeakAreas", []),
        "dataset_saved": True
    })


@users_bp.route("/knowledge-dataset/stats", methods=["GET"])
@token_required
def get_knowledge_dataset_stats(user_id):
    """
    GET /api/users/knowledge-dataset/stats
    Returns global knowledge progress statistics from the dataset.
    """
    dataset = load_knowledge_dataset()
    return jsonify(dataset["global_stats"])


@users_bp.route("/knowledge-dataset/export", methods=["GET"])
@admin_required
def export_knowledge_dataset(user_id):
    """
    GET /api/users/knowledge-dataset/export
    Admin only: Export the complete knowledge progress dataset.
    """
    dataset = load_knowledge_dataset()
    return jsonify(dataset)


@users_bp.route("/hint-chat", methods=["POST"])
@token_required
def hint_chat(user_id):
    """
    POST /api/users/hint-chat
    Body: { question, level, userAttempt }
    Returns AI-generated hint based on level (1, 2, or 3)
    Level 1: Very subtle conceptual hint
    Level 2: More specific guidance
    Level 3: Almost the answer (clear direction)
    """
    from datetime import datetime
    import os

    data = request.get_json() or {}
    question = data.get("question", "").strip()
    level = data.get("level", 1)
    user_attempt = data.get("userAttempt", "No attempt yet").strip()

    if not question:
        return jsonify({"error": "Question is required"}), 400

    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key or api_key == "your_gemini_api_key_here":
        return jsonify({
            "reply": "⚠️ **API Key Missing**\n\nTo enable the real-time AI Tutor, please add your Google Gemini API key (`GEMINI_API_KEY`) to the `backend/.env` file and restart the server.",
            "timestamp": datetime.utcnow().isoformat(),
            "concept": "System Setup"
        })

    try:
        import google.generativeai as genai
        genai.configure(api_key=api_key)
        
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

        # Call Gemini model
        model = genai.GenerativeModel("gemini-2.0-flash")
        response = model.generate_content(prompt)
        
        reply_text = response.text

        # Generate a short concept summary based on the question
        concept = "Computer Science Fundamentals"
        if "array" in question.lower() or "list" in question.lower() or "stack" in question.lower(): 
            concept = "Data Structures"
        elif "time complexity" in question.lower() or "o(" in question.lower(): 
            concept = "Complexity Analysis"

        return jsonify({
            "reply": reply_text,
            "timestamp": datetime.utcnow().isoformat(),
            "concept": concept
        })

    except Exception as e:
        current_app.logger.error(f"Gemini API Error: {str(e)}")
        return jsonify({
            "reply": f"Sorry, I encountered an error connecting to the AI service: {str(e)}",
            "timestamp": datetime.utcnow().isoformat(),
            "concept": "Error"
        })
