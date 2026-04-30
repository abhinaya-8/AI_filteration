"""
REST API: Resumes (upload, list by drive, AI filter).
"""
import os
from pathlib import Path

from flask import Blueprint, request, jsonify, current_app, send_from_directory
from bson import ObjectId
from werkzeug.utils import secure_filename

from app.utils.auth import token_required, admin_required
from app.utils.parsers import allowed_file, safe_save_path
from app.utils.status import calculate_drive_status
from app.ml.resume_filter import extract_text_from_file, analyze_resumes_batch
from app.ml.resume_builder import (
    get_resume_templates,
    suggest_bullet_point,
    extract_skills_from_text,
    score_resume_data,
)

resumes_bp = Blueprint("resumes", __name__)


@resumes_bp.route("/upload", methods=["POST"])
@token_required
def upload_resume(user_id):
    """
    POST /api/resumes/upload
    Form: recruitmentDriveId, file (PDF/DOCX)
    User only (applicant). Creates Resume with status Pending, extracts text.
    """
    user = current_app.db.users.find_one({"_id": ObjectId(user_id)})
    if user.get("role") != "User":
        return jsonify({"error": "Only applicants can upload resumes"}), 403

    drive_id = request.form.get("recruitmentDriveId")
    if not drive_id:
        return jsonify({"error": "recruitmentDriveId required"}), 400

    try:
        drive_oid = ObjectId(drive_id)
    except Exception:
        return jsonify({"error": "Invalid drive id"}), 400

    drive = current_app.db.recruitment_drives.find_one({"_id": drive_oid})
    if not drive:
        return jsonify({"error": "Drive not found"}), 404
    
    # Check if drive is open for applications
    status_data = calculate_drive_status(drive, current_app.db)
    if status_data["status"] == "Closed":
        return jsonify({"error": "Drive is closed for applications"}), 400

    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400
    file = request.files["file"]
    if not file.filename or not allowed_file(file.filename):
        return jsonify({"error": "Invalid file. Use PDF or DOCX"}), 400

    upload_folder = Path(current_app.config["UPLOAD_FOLDER"])
    save_path = safe_save_path(file.filename, upload_folder)
    try:
        file.save(str(save_path))
    except Exception as e:
        return jsonify({"error": "Failed to save file"}), 500

    extracted_text = extract_text_from_file(str(save_path))
    resume_doc = {
        "userId": user_id,
        "recruitmentDriveId": drive_id,
        "resumePath": str(save_path.name),
        "extractedText": extracted_text,
        "aiScore": None,
        "status": "Pending",
    }
    ins = current_app.db.resumes.insert_one(resume_doc)
    return jsonify({
        "id": str(ins.inserted_id),
        "userId": user_id,
        "recruitmentDriveId": drive_id,
        "status": "Pending",
        "message": "Resume submitted successfully",
    }), 201


@resumes_bp.route("/drive/<drive_id>", methods=["GET"])
@token_required
def list_resumes_by_drive(user_id, drive_id):
    """
    GET /api/resumes/drive/:driveId
    Admin: all resumes for that drive (their company).
    User: only their own resumes for that drive.
    """
    try:
        drive_oid = ObjectId(drive_id)
    except Exception:
        return jsonify({"error": "Invalid drive id"}), 400

    drive = current_app.db.recruitment_drives.find_one({"_id": drive_oid})
    if not drive:
        return jsonify({"error": "Drive not found"}), 404

    user = current_app.db.users.find_one({"_id": ObjectId(user_id)})
    query = {"recruitmentDriveId": drive_id}
    if user.get("role") == "User":
        query["userId"] = user_id
    elif user.get("role") == "Admin":
        if drive["companyId"] != user.get("companyId"):
            return jsonify({"error": "Forbidden"}), 403
    else:
        return jsonify({"error": "Forbidden"}), 403

    resumes = list(current_app.db.resumes.find(query))
    out = []
    for r in resumes:
        applicant_name = ""
        if r.get("userId"):
            u = current_app.db.users.find_one({"_id": ObjectId(r["userId"])})
            applicant_name = (u.get("name") or "") if u else ""
        out.append({
            "id": str(r["_id"]),
            "userId": r.get("userId"),
            "applicantName": applicant_name,
            "recruitmentDriveId": r.get("recruitmentDriveId"),
            "resumePath": r.get("resumePath"),
            "extractedText": (r.get("extractedText") or "")[:500],
            "aiScore": r.get("aiScore"),
            "status": r.get("status", "Pending"),
        })
    return jsonify(out)


@resumes_bp.route("/templates", methods=["GET"])
@token_required
def get_resume_templates_route(user_id):
    """GET /api/resumes/templates - Return available ATS-friendly resume templates."""
    return jsonify(get_resume_templates())


@resumes_bp.route("/builder/score", methods=["POST"])
@token_required
def score_resume(user_id):
    """POST /api/resumes/builder/score - Score a resume draft based on completeness and ATS readiness."""
    data = request.get_json() or {}
    resume_data = data.get("resumeData") or data
    score = score_resume_data(resume_data)
    return jsonify({"score": score})


@resumes_bp.route("/builder/suggest", methods=["POST"])
@token_required
def suggest_resume_bullet(user_id):
    """POST /api/resumes/builder/suggest - Improve a bullet point for impact."""
    data = request.get_json() or {}
    bullet = data.get("bullet") or ""
    improved = suggest_bullet_point(bullet)
    return jsonify({"suggestion": improved})


@resumes_bp.route("/builder/extract-skills", methods=["POST"])
@token_required
def extract_resume_skills(user_id):
    """POST /api/resumes/builder/extract-skills - Extract skill keywords from descriptive text."""
    data = request.get_json() or {}
    text = data.get("text") or ""
    skills = extract_skills_from_text(text)
    return jsonify({"skills": skills})


@resumes_bp.route("/ai/filter-applicants", methods=["POST"])
@admin_required
def run_ai_filter(user_id):
    """
    POST /api/resumes/ai/filter-applicants
    Input: { "jobId": "drive_id", "keywords": "optional extra keywords" }
    Runs TF-IDF + cosine similarity vs job description + keywords; updates status (Selected/Rejected).
    """
    data = request.get_json() or {}
    drive_id = data.get("jobId")
    if not drive_id:
        return jsonify({"error": "jobId is required"}), 400

    try:
        drive_oid = ObjectId(drive_id)
    except Exception:
        return jsonify({"error": "Invalid jobId"}), 400

    drive = current_app.db.recruitment_drives.find_one({"_id": drive_oid})
    if not drive:
        return jsonify({"error": "Drive not found"}), 404

    user = current_app.db.users.find_one({"_id": ObjectId(user_id)})
    if drive["companyId"] != user.get("companyId"):
        return jsonify({"error": "Forbidden"}), 403

    keywords = data.get("keywords") or ""

    resumes = list(current_app.db.resumes.find({"recruitmentDriveId": drive_id}))
    if not resumes:
        return jsonify({"message": "No resumes to analyze", "updated": 0}), 200

    job_description = drive.get("jobDescription") or ""
    resume_texts = [r.get("extractedText") or "" for r in resumes]
    threshold = current_app.config.get("SIMILARITY_THRESHOLD", 0.45)

    try:
        results = analyze_resumes_batch(job_description, keywords, resume_texts, threshold)
    except RuntimeError as e:
        return jsonify({"error": str(e)}), 503

    formatted_results = []
    for i, res in enumerate(results):
        if i < len(resumes):
            rid = resumes[i]["_id"]
            user_str = resumes[i].get("userId")
            current_app.db.resumes.update_one(
                {"_id": rid},
                {"$set": {"aiScore": res["aiScore"], "status": res["status"]}}
            )
            formatted_results.append({
                "userId": user_str,
                "prediction": res["status"].lower(),
                "score": res["aiScore"]
            })

    selected = sum(1 for r in results if r["status"] == "Selected")
    rejected = sum(1 for r in results if r["status"] == "Rejected")
    return jsonify({
        "message": "Analysis complete",
        "updated": len(resumes),
        "selectedCount": selected,
        "rejectedCount": rejected,
        "results": formatted_results,
    })


@resumes_bp.route("/my-applications", methods=["GET"])
@token_required
def my_applications(user_id):
    """
    GET /api/resumes/my-applications
    Query: ?driveId= optional. Returns current user's resume submissions with drive info.
    """
    query = {"userId": user_id}
    drive_id = request.args.get("driveId")
    if drive_id:
        query["recruitmentDriveId"] = drive_id

    resumes = list(current_app.db.resumes.find(query))
    out = []
    for r in resumes:
        drive = current_app.db.recruitment_drives.find_one({"_id": ObjectId(r["recruitmentDriveId"])}) if r.get("recruitmentDriveId") else None
        company = current_app.db.companies.find_one({"_id": ObjectId(drive["companyId"])}) if drive and drive.get("companyId") else None
        out.append({
            "id": str(r["_id"]),
            "recruitmentDriveId": r.get("recruitmentDriveId"),
            "roleTitle": drive.get("roleTitle") if drive else None,
            "companyName": company.get("companyName") if company else None,
            "status": r.get("status", "Pending"),
            "aiScore": r.get("aiScore"),
        })
    return jsonify(out)
