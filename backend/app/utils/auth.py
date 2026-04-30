"""
JWT authentication helpers.
"""
from functools import wraps
from flask import request, jsonify
import jwt
from bson import ObjectId
from app.config import Config


def get_current_user_id():
    """Extract user id from JWT in Authorization header. Returns None if invalid."""
    auth = request.headers.get("Authorization")
    if not auth or not auth.startswith("Bearer "):
        return None
    token = auth.split(" ")[1]
    try:
        payload = jwt.decode(token, Config.JWT_SECRET_KEY, algorithms=["HS256"])
        return payload.get("user_id")
    except jwt.InvalidTokenError:
        return None


def token_required(f):
    """Decorator: require valid JWT. Injects user_id into kwargs."""

    @wraps(f)
    def decorated(*args, **kwargs):
        user_id = get_current_user_id()
        if not user_id:
            return jsonify({"error": "Authentication required"}), 401
        kwargs["user_id"] = user_id
        return f(*args, **kwargs)

    return decorated


def admin_required(f):
    """Decorator: require valid JWT and role=Admin. Injects user_id."""

    @wraps(f)
    def decorated(*args, **kwargs):
        user_id = get_current_user_id()
        if not user_id:
            return jsonify({"error": "Authentication required"}), 401
        from flask import current_app
        try:
            uid = ObjectId(user_id)
        except Exception:
            return jsonify({"error": "Invalid user"}), 403
        user = current_app.db.users.find_one({"_id": uid})
        if not user or user.get("role") != "Admin":
            return jsonify({"error": "Admin access required"}), 403
        kwargs["user_id"] = user_id
        return f(*args, **kwargs)

    return decorated
