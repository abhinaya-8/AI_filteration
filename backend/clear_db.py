from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()
mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
db = MongoClient(mongo_uri)[os.getenv("MONGO_DB", "recruitment_db")]

# Clear all collections
print("Clearing database...")
db.users.delete_many({})
db.companies.delete_many({})
db.recruitment_drives.delete_many({})
db.resumes.delete_many({})
print("Database cleared!")
