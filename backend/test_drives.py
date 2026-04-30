import requests

# We need the admin token
import jwt
import datetime

token = jwt.encode({
    "userId": "69e8a0f10abf1ec6e00d0fa7", # admin userId from test_db.py
    "exp": datetime.datetime.utcnow() + datetime.timedelta(days=1)
}, "your_jwt_secret_key", algorithm="HS256")

headers = {"Authorization": f"Bearer {token}"}
res = requests.get("http://localhost:5000/api/drives", headers=headers)
drives = res.json()

print(drives)
