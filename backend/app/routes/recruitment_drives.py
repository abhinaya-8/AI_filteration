"""
REST API: Recruitment Drives.
- Admin: create drive, list my drives, get one drive.
- User: list open drives by company.
"""
from flask import Blueprint, request, jsonify, current_app
from bson import ObjectId
from datetime import datetime

from app.utils.auth import token_required, admin_required
from app.utils.status import calculate_drive_status, get_status_display

drives_bp = Blueprint("drives", __name__)


@drives_bp.route("", methods=["POST"])
@admin_required
def create_drive(user_id):
    """
    POST /api/drives
    Body: { 
        "roleTitle", 
        "jobDescription", 
        "totalOpenings" (number),
        "deadline" (ISO date string, optional),
        "filteringCriteria": "optional additional filtering description" 
    }
    Admin only; drive is linked to admin's company.
    Status is automatically "Open" unless overridden.
    """
    data = request.get_json()
    if not data:
        return jsonify({"error": "JSON body required"}), 400

    role_title = (data.get("roleTitle") or "").strip()
    job_description = (data.get("jobDescription") or "").strip()
    total_openings = data.get("totalOpenings", 0)
    deadline = data.get("deadline")
    filtering_criteria = (data.get("filteringCriteria") or "").strip()
    
    if not role_title:
        return jsonify({"error": "roleTitle is required"}), 400

    user = current_app.db.users.find_one({"_id": ObjectId(user_id)})
    if not user or user.get("role") != "Admin" or not user.get("companyId"):
        return jsonify({"error": "Admin company not found"}), 403

    company_id = user["companyId"]
    drive_doc = {
        "companyId": company_id,
        "roleTitle": role_title,
        "jobDescription": job_description,
        "totalOpenings": int(total_openings) if total_openings else 0,
        "deadline": deadline,
        "filteringCriteria": filtering_criteria,
        "statusOverride": None,  # Manual override (null = use automatic calculation)
        "createdAt": datetime.utcnow(),
    }
    ins = current_app.db.recruitment_drives.insert_one(drive_doc)
    drive_doc["_id"] = ins.inserted_id
    
    # Calculate status
    status_data = calculate_drive_status(drive_doc, current_app.db)
    status_display = get_status_display(status_data)
    
    return jsonify({
        "id": str(ins.inserted_id),
        "companyId": company_id,
        "roleTitle": role_title,
        "jobDescription": job_description,
        "totalOpenings": int(total_openings) if total_openings else 0,
        "deadline": deadline,
        "filteringCriteria": filtering_criteria,
        "status": status_display["status"],
        "statusColor": status_display["color"],
        "progress": status_display["progress"],
        "createdAt": drive_doc["createdAt"].isoformat() + "Z",
    }), 201


@drives_bp.route("", methods=["GET"])
@token_required
def list_drives(user_id):
    """
    GET /api/drives
    Query: ?companyId=... (optional) → open drives for that company.
    If no companyId: return drives for current user's company (Admin).
    Returns drives with status information.
    """
    company_id = request.args.get("companyId")
    user = current_app.db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        return jsonify({"error": "User not found"}), 401

    if user.get("role") == "Admin":
        # Admin sees all drives of their company
        filter_query = {"companyId": user.get("companyId")}
    else:
        # User: must pass companyId to see that company's open drives
        if not company_id:
            return jsonify({"error": "companyId required for applicants"}), 400
        filter_query = {"companyId": company_id}

    drives = list(current_app.db.recruitment_drives.find(filter_query).sort("createdAt", -1))
    out = []
    for d in drives:
        # Calculate current status
        status_data = calculate_drive_status(d, current_app.db)
        status_display = get_status_display(status_data)
        

        out.append({
            "id": str(d["_id"]),
            "companyId": d["companyId"],
            "roleTitle": d["roleTitle"],
            "jobDescription": d["jobDescription"],
            "totalOpenings": d.get("totalOpenings", 0),
            "deadline": d.get("deadline"),
            "filteringCriteria": d.get("filteringCriteria", ""),
            "status": status_display["status"],
            "statusColor": status_display["color"],
            "progress": status_display["progress"],
            "createdAt": d["createdAt"].isoformat() + "Z" if d.get("createdAt") else None,
        })
    return jsonify(out)


@drives_bp.route("/<drive_id>", methods=["GET"])
@token_required
def get_drive(user_id, drive_id):
    """
    GET /api/drives/:id
    Returns single drive with status; admin can see any drive of their company; 
    user can see open/filling fast drives.
    """
    try:
        oid = ObjectId(drive_id)
    except Exception:
        return jsonify({"error": "Invalid drive id"}), 400

    drive = current_app.db.recruitment_drives.find_one({"_id": oid})
    if not drive:
        return jsonify({"error": "Drive not found"}), 404

    user = current_app.db.users.find_one({"_id": ObjectId(user_id)})
    
    # Calculate current status
    status_data = calculate_drive_status(drive, current_app.db)
    status_display = get_status_display(status_data)
    
    if user.get("role") == "Admin":
        if drive["companyId"] != user.get("companyId"):
            return jsonify({"error": "Forbidden"}), 403
    else:
        # Regular user can only see Open or Filling Fast drives
        if status_display["status"] == "Closed":
            return jsonify({"error": "Drive is closed"}), 403

    return jsonify({
        "id": str(drive["_id"]),
        "companyId": drive["companyId"],
        "roleTitle": drive["roleTitle"],
        "jobDescription": drive["jobDescription"],
        "totalOpenings": drive.get("totalOpenings", 0),
        "deadline": drive.get("deadline"),
        "filteringCriteria": drive.get("filteringCriteria", ""),
        "status": status_display["status"],
        "statusColor": status_display["color"],
        "progress": status_display["progress"],
        "createdAt": drive["createdAt"].isoformat() + "Z" if drive.get("createdAt") else None,
    })


@drives_bp.route("/<drive_id>", methods=["PATCH"])
@admin_required
def update_drive(user_id, drive_id):
    """
    PATCH /api/drives/:id
    Body: { 
        "roleTitle", 
        "jobDescription", 
        "totalOpenings",
        "deadline",
        "statusOverride": "Open"|"Filling Fast"|"Closed"|null (null removes override)
    } (all optional)
    """
    try:
        oid = ObjectId(drive_id)
    except Exception:
        return jsonify({"error": "Invalid drive id"}), 400

    drive = current_app.db.recruitment_drives.find_one({"_id": oid})
    if not drive or drive["companyId"] != current_app.db.users.find_one({"_id": ObjectId(user_id)}).get("companyId"):
        return jsonify({"error": "Drive not found"}), 404

    data = request.get_json() or {}
    updates = {}
    
    if "roleTitle" in data and data["roleTitle"] is not None:
        updates["roleTitle"] = str(data["roleTitle"]).strip()
    if "jobDescription" in data and data["jobDescription"] is not None:
        updates["jobDescription"] = str(data["jobDescription"]).strip()
    if "totalOpenings" in data and data["totalOpenings"] is not None:
        updates["totalOpenings"] = int(data["totalOpenings"])
    if "deadline" in data:
        updates["deadline"] = data["deadline"]
    if "statusOverride" in data:
        # Validate override status
        override_status = data["statusOverride"]
        if override_status is None or override_status in ("Open", "Filling Fast", "Closed"):
            updates["statusOverride"] = override_status

    if updates:
        current_app.db.recruitment_drives.update_one({"_id": oid}, {"$set": updates})

    drive = current_app.db.recruitment_drives.find_one({"_id": oid})
    status_data = calculate_drive_status(drive, current_app.db)
    status_display = get_status_display(status_data)
    
    return jsonify({
        "id": str(drive["_id"]),
        "companyId": drive["companyId"],
        "roleTitle": drive["roleTitle"],
        "jobDescription": drive["jobDescription"],
        "totalOpenings": drive.get("totalOpenings", 0),
        "deadline": drive.get("deadline"),
        "status": status_display["status"],
        "statusColor": status_display["color"],
        "progress": status_display["progress"],
        "createdAt": drive["createdAt"].isoformat() + "Z" if drive.get("createdAt") else None,
    })
