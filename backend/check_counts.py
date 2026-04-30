import os
from pymongo import MongoClient

client = MongoClient('mongodb+srv://abhinayabandaru8_db_user:abhi2005@cluster0.i3w4t4f.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
db = client['ai_filter']

drives = list(db.recruitment_drives.find({}))
print('Drives:', len(drives))
resumes = list(db.resumes.find({}))
print('Resumes:', len(resumes))

for d in drives:
    print('Drive:', d['_id'], d.get('roleTitle'))
    print('  Count(str):', db.resumes.count_documents({'recruitmentDriveId': str(d['_id'])}))
    print('  Count(oid):', db.resumes.count_documents({'recruitmentDriveId': d['_id']}))
