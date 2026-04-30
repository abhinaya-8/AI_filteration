"""
REST API: Companies (list for Users to see and pick drives).
"""
from flask import Blueprint, jsonify, current_app
from bson import ObjectId

from app.utils.auth import token_required

companies_bp = Blueprint("companies", __name__)


@companies_bp.route("", methods=["GET"])
@token_required
def list_companies(user_id):
    """
    GET /api/companies
    Returns list of companies (for User dashboard cards).
    """
    companies = list(current_app.db.companies.find({}))
    out = []
    for c in companies:
        out.append({
            "id": str(c["_id"]),
            "companyName": c["companyName"],
        })
    return jsonify(out)
