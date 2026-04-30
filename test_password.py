import sys
from pathlib import Path
sys.path.insert(0, str(Path.cwd()))
from pymongo import MongoClient
import bcrypt
import os

MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/')
MONGO_DB = os.getenv('MONGO_DB', 'recruitment_db')

client = MongoClient(MONGO_URI)
db = client[MONGO_DB]

# Test login with admin@company.com / admin123
email = 'admin@company.com'
password = 'admin123'

user = db.users.find_one({'email': email})
if user:
    print(f"Found user: {email}")
    print(f"Password hash: {user['password']}")
    
    # Test bcrypt verify
    result = bcrypt.checkpw(password.encode('utf-8'), user['password'].encode('utf-8'))
    print(f"Password check result: {result}")
else:
    print(f"User {email} not found")
