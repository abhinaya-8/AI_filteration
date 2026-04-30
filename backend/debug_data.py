from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()
mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
db = MongoClient(mongo_uri)[os.getenv("MONGO_DB", "recruitment_db")]

# Check admin user
admin = db.users.find_one({"email": "admin@test.com"})
if admin:
    print("Admin User:")
    print(f"  ID: {admin['_id']}")
    print(f"  CompanyId: {admin.get('companyId')} (type: {type(admin.get('companyId')).__name__})")
    print(f"  Role: {admin.get('role')}")
    print()

# Check company
company = db.companies.find_one()
if company:
    print("Company:")
    print(f"  ID: {company['_id']} (type: {type(company['_id']).__name__})")
    print(f"  CompanyId from admin: {admin.get('companyId') if admin else 'N/A'}")
    print()

# Check drives
drive = db.recruitment_drives.find_one()
if drive:
    print("Drive:")
    print(f"  ID: {drive['_id']} (type: {type(drive['_id']).__name__})")
    print(f"  CompanyId: {drive.get('companyId')} (type: {type(drive.get('companyId')).__name__})")
    print()

# Check resumes
resume = db.resumes.find_one()
if resume:
    print("Resume:")
    print(f"  ID: {resume['_id']}")
    print(f"  RecruitmentDriveId: {resume.get('recruitmentDriveId')} (type: {type(resume.get('recruitmentDriveId')).__name__})")
    print(f"  UserId: {resume.get('userId')} (type: {type(resume.get('userId')).__name__})")
    print()
    print("Checking if resume query would find this resume:")
    drive_id = resume.get('recruitmentDriveId')
    found = db.resumes.find_one({"recruitmentDriveId": drive_id})
    print(f"  Found with drive_id string: {found is not None}")
else:
    print("No resumes found in database")
