import os
from pymongo import MongoClient
import pprint

mongo_uri = "mongodb+srv://abhinayabandaru8_db_user:abhi2005@cluster0.i3w4t4f.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
try:
    client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
    db = client["ai_filter"]
    
    print("Resumes:")
    for r in db.resumes.find():
        pprint.pprint(r)
        print("-" * 40)
        
    print("\nDrives:")
    print("\nUsers:")
    for u in db.users.find():
        print(u["_id"], u["email"], u["role"], u.get("companyId"), type(u.get("companyId")))
        
    print("\nCompanies:")
    for c in db.companies.find():
        print(c["_id"], c["companyName"], c.get("adminId"))
except Exception as e:
    print("Connection failed:", e)
