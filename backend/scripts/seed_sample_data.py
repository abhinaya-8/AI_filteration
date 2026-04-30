"""
Sample test data: 1 Admin + Company + 2 Drives, 2 Users, and sample resumes (text only).
Run from backend folder: python -m scripts.seed_sample_data
Requires: MONGO_URI, MONGO_DB (or defaults to localhost/recruitment_db).
"""
import os
import sys
from pathlib import Path
from datetime import datetime

# Add parent to path so app is importable
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import bcrypt
from pymongo import MongoClient

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
MONGO_DB = os.getenv("MONGO_DB", "recruitment_db")

def main():
    client = MongoClient(MONGO_URI)
    db = client[MONGO_DB]

    if db.users.find_one({"email": "admin@company.com"}):
        print("Sample data already present. Skip or delete existing sample users to re-seed.")
        return

    # 1. Admin + Company
    admin_password = bcrypt.hashpw(b"admin123", bcrypt.gensalt()).decode("utf-8")
    company_doc = {"companyName": "Acme Corp", "adminId": None}
    company_id = db.companies.insert_one(company_doc).inserted_id
    admin_doc = {
        "name": "Admin User",
        "email": "admin@company.com",
        "password": admin_password,
        "role": "Admin",
        "companyId": str(company_id),
    }
    admin_id = db.users.insert_one(admin_doc).inserted_id
    db.companies.update_one({"_id": company_id}, {"$set": {"adminId": str(admin_id)}})

    # 2. Recruitment Drives
    drive1 = {
        "companyId": str(company_id),
        "roleTitle": "Senior Python Developer",
        "jobDescription": "We are looking for a Senior Python Developer with 4+ years experience in Python, Flask or Django, REST APIs, and databases. Experience with ML libraries like scikit-learn is a plus.",
        "hiringStatus": "Open",
        "createdAt": datetime.utcnow(),
    }
    drive2 = {
        "companyId": str(company_id),
        "roleTitle": "Frontend React Developer",
        "jobDescription": "Frontend developer with strong React.js, Tailwind CSS, and modern JavaScript. Experience with state management and responsive design required.",
        "hiringStatus": "Open",
        "createdAt": datetime.utcnow(),
    }
    drive1_id = db.recruitment_drives.insert_one(drive1).inserted_id
    drive2_id = db.recruitment_drives.insert_one(drive2).inserted_id

    # 3. Applicants
    user_password = bcrypt.hashpw(b"user123", bcrypt.gensalt()).decode("utf-8")
    alice = db.users.insert_one({
        "name": "Alice Smith",
        "email": "alice@example.com",
        "password": user_password,
        "role": "User",
        "companyId": None,
    }).inserted_id
    bob = db.users.insert_one({
        "name": "Bob Jones",
        "email": "bob@example.com",
        "password": user_password,
        "role": "User",
        "companyId": None,
    }).inserted_id

    # 4. Sample resumes (extracted text only - no file)
    resume_text_alice = "Alice Smith. Python developer with 5 years experience. Flask, Django, REST APIs. Scikit-learn and data pipelines. MongoDB and PostgreSQL."
    resume_text_bob = "Bob Jones. Frontend developer. React.js, Tailwind CSS, JavaScript. Built responsive dashboards and recruitment UIs."

    db.resumes.insert_one({
        "userId": str(alice),
        "recruitmentDriveId": str(drive1_id),
        "resumePath": "sample_alice.pdf",
        "extractedText": resume_text_alice,
        "similarityScore": None,
        "status": "Pending",
    })
    db.resumes.insert_one({
        "userId": str(bob),
        "recruitmentDriveId": str(drive1_id),
        "resumePath": "sample_bob.pdf",
        "extractedText": resume_text_bob,
        "similarityScore": None,
        "status": "Pending",
    })
    db.resumes.insert_one({
        "userId": str(bob),
        "recruitmentDriveId": str(drive2_id),
        "resumePath": "sample_bob2.pdf",
        "extractedText": resume_text_bob,
        "similarityScore": None,
        "status": "Pending",
    })

    print("Sample data seeded successfully.")
    print("Admin: admin@company.com / admin123")
    print("Users: alice@example.com, bob@example.com / user123")
    print("Company: Acme Corp with 2 open drives and 3 sample resumes.")


if __name__ == "__main__":
    main()
