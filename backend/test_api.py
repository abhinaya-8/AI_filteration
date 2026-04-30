import os
from bson import ObjectId
import jwt
from datetime import datetime, timedelta

from app import create_app

app = create_app()

with app.app_context():
    db = app.db
    admin = db.users.find_one({"role": "Admin"})
    drive = db.recruitment_drives.find_one()
    
    if not admin or not drive:
        print("Missing data")
        exit()
        
    admin_id = str(admin["_id"])
    drive_id = str(drive["_id"])
    
    print("Admin ID:", admin_id)
    print("Drive ID:", drive_id)
    
    payload = {
        "user_id": admin_id,
        "exp": datetime.utcnow() + timedelta(hours=1),
    }
    token = jwt.encode(payload, app.config["JWT_SECRET_KEY"], algorithm="HS256")
    if hasattr(token, "decode"):
        token = token.decode("utf-8")
        
    import requests
    res = requests.get(
        f"http://127.0.0.1:5000/api/resumes/drive/{drive_id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    print("Status:", res.status_code)
    print("Response:", res.json())
