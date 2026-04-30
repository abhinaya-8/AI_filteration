import sys
from pathlib import Path
sys.path.insert(0, str(Path.cwd()))
from pymongo import MongoClient
import os

MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/')
MONGO_DB = os.getenv('MONGO_DB', 'recruitment_db')

client = MongoClient(MONGO_URI)
db = client[MONGO_DB]

users = list(db.users.find({}, {'email': 1, 'password': 1, 'role': 1}))
print(f'Found {len(users)} users:')
for u in users:
    pwd_len = len(u.get('password', ''))
    print(f"  Email: {u.get('email')}, Role: {u.get('role')}, Password hash length: {pwd_len}")
