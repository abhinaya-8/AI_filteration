import os
from pymongo import MongoClient
from bson import ObjectId

mongo_uri = "mongodb+srv://abhinayabandaru8_db_user:abhi2005@cluster0.i3w4t4f.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
try:
    client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
    db = client["ai_filter"]
    
    # Let's get the drive
    drive = db.recruitment_drives.find_one()
    if not drive:
        print("No drive found")
        exit()
        
    drive_id = str(drive["_id"])
    print("Drive ID:", drive_id)
    
    # Find Admin
    admin = db.users.find_one({"role": "Admin", "companyId": drive["companyId"]})
    print("Admin:", admin["email"])
    
    # Simulate list_resumes_by_drive logic
    query = {"recruitmentDriveId": drive_id}
    resumes = list(db.resumes.find(query))
    
    print(f"Found {len(resumes)} resumes using string query")
    
    query_obj = {"recruitmentDriveId": ObjectId(drive_id)}
    resumes_obj = list(db.resumes.find(query_obj))
    print(f"Found {len(resumes_obj)} resumes using ObjectId query")

except Exception as e:
    print("Error:", e)
