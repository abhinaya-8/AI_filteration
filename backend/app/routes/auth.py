"""
REST API: Authentication (Signup / Login).
- Signup: name, email, password, role; if Admin, companyName required → create Company, link admin.
- Login: email, password → JWT.
"""
from flask import Blueprint, request, jsonify, current_app
import bcrypt
import jwt
from datetime import datetime, timedelta
from bson import ObjectId

from app.config import Config
from app.utils.auth import token_required

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/signup", methods=["POST"])
def signup():
    """
    POST /api/auth/signup
    Body: { "name", "email", "password", "role": "Admin"|"User", "companyName" (required if role=Admin) }
    """
    data = request.get_json()
    if not data:
        return jsonify({"error": "JSON body required"}), 400

    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password")
    role = (data.get("role") or "").strip()
    company_name = (data.get("companyName") or "").strip()

    if not name or not email or not password:
        return jsonify({"error": "Name, email and password are required"}), 400
    if role not in ("Admin", "User"):
        return jsonify({"error": "Role must be Admin or User"}), 400
    if role == "Admin" and not company_name:
        return jsonify({"error": "Company name is required for Admin"}), 400

    db = current_app.db
    if db.users.find_one({"email": email}):
        return jsonify({"error": "Email already registered"}), 409

    hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    user_doc = {
        "name": name,
        "email": email,
        "password": hashed,
        "role": role,
        "companyId": None,
        "knowledgeXP": 0,
        "totalCorrectQuestions": 0,
        "knowledgeWeakAreas": [],
    }

    if role == "Admin":
        company_doc = {
            "companyName": company_name,
            "adminId": None,  # set after user insert
        }
        ins = db.companies.insert_one(company_doc)
        user_doc["companyId"] = str(ins.inserted_id)
        user_ins = db.users.insert_one(user_doc)
        db.companies.update_one(
            {"_id": ins.inserted_id},
            {"$set": {"adminId": str(user_ins.inserted_id)}}
        )
    else:
        db.users.insert_one(user_doc)

    return jsonify({"message": "Registration successful"}), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    """
    POST /api/auth/login
    Body: { "email", "password" }
    Returns: { "token", "user": { id, name, email, role, companyId? } }
    """
    data = request.get_json()
    print(f"DEBUG: Login request data: {data}")  # DEBUG
    if not data:
        return jsonify({"error": "JSON body required"}), 400

    email = (data.get("email") or "").strip().lower()
    password = data.get("password")
    print(f"DEBUG: Email={email}, Password={password}")  # DEBUG
    
    # DEBUG: Check what users exist
    all_users = list(current_app.db.users.find({}, {'email': 1}))
    print(f"DEBUG: All users in DB: {[u['email'] for u in all_users]}")  # DEBUG

    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400

    user = current_app.db.users.find_one({"email": email})
    print(f"DEBUG: User found: {user is not None}")  # DEBUG
    if user:
        pwd_check = bcrypt.checkpw(password.encode("utf-8"), user["password"].encode("utf-8"))
        print(f"DEBUG: Password check: {pwd_check}")  # DEBUG
    if not user or not bcrypt.checkpw(password.encode("utf-8"), user["password"].encode("utf-8")):
        return jsonify({"error": "Invalid email or password"}), 401

    payload = {
        "user_id": str(user["_id"]),
        "exp": datetime.utcnow() + Config.JWT_ACCESS_TOKEN_EXPIRES,
    }
    token = jwt.encode(payload, Config.JWT_SECRET_KEY, algorithm="HS256")
    if hasattr(token, "decode"):
        token = token.decode("utf-8")

    out = {
        "token": token,
        "user": {
            "id": str(user["_id"]),
            "name": user["name"],
            "email": user["email"],
            "role": user["role"],
            "companyId": user.get("companyId"),
        },
    }
    return jsonify(out)
