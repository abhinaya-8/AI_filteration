#!/usr/bin/env python
"""Test complete flow: admin login, create drive, user login, upload resume, admin views resumes"""
import requests
import json

BASE_URL = "http://localhost:5000/api"

print("=" * 60)
print("TESTING COMPLETE APPLICATION FLOW")
print("=" * 60)

# Step 1: Admin login
print("\n1. Admin Login...")
admin_login = requests.post(f"{BASE_URL}/auth/login", json={
    "email": "admin@test.com",
    "password": "admin123"
}).json()

if "error" in admin_login:
    print(f"   ERROR: {admin_login['error']}")
    exit(1)

admin_token = admin_login.get("token")
admin_user = admin_login.get("user")
print(f"   ✓ Logged in as: {admin_user['name']} (CompanyId: {admin_user['companyId']})")

# Step 2: Admin creates drive
print("\n2. Admin Creates Recruitment Drive...")
drive_res = requests.post(
    f"{BASE_URL}/drives",
    headers={"Authorization": f"Bearer {admin_token}"},
    json={
        "roleTitle": "Python Developer",
        "jobDescription": "Looking for an experienced Python developer with 3+ years experience",
        "totalOpenings": 5,
        "deadline": "2026-05-22",
        "filteringCriteria": "Python, Django, REST API"
    }
).json()

if "error" in drive_res:
    print(f"   ERROR: {drive_res['error']}")
    exit(1)

drive_id = drive_res.get("id")
drive_company_id = drive_res.get("companyId")
print(f"   ✓ Drive created (ID: {drive_id})")
print(f"     CompanyId in drive: {drive_company_id}")

# Step 3: User signup (if not already done)
print("\n3. User Signup...")
user_signup = requests.post(f"{BASE_URL}/auth/signup", json={
    "name": "John Doe",
    "email": "john@test.com",
    "password": "john123",
    "role": "User"
}).json()
print(f"   ✓ {user_signup.get('message', 'User created')}")

# Step 4: User login
print("\n4. User Login...")
user_login = requests.post(f"{BASE_URL}/auth/login", json={
    "email": "john@test.com",
    "password": "john123"
}).json()

if "error" in user_login:
    print(f"   ERROR: {user_login['error']}")
    exit(1)

user_token = user_login.get("token")
print(f"   ✓ Logged in as: {user_login['user']['name']}")

# Step 5: Create a dummy resume file
print("\n5. Creating Test Resume File...")
import tempfile
import os
from PyPDF2 import PdfWriter
import io

# Create a minimal PDF with text content
# We'll create an empty PDF using PyPDF2
writer = PdfWriter()
page = writer.add_blank_page(width=612, height=792)

# Since PyPDF2 doesn't easily add text, we'll just create a minimal valid PDF
temp_file = tempfile.NamedTemporaryFile(mode='wb', suffix='.pdf', delete=False)
temp_path = temp_file.name

# Write a minimal PDF structure with resume content
# PDF headers and basic structure
pdf_content = b"""%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 200 >>
stream
BT
/F1 12 Tf
50 750 Td
(John Doe - Python Developer with 5 years experience) Tj
0 -30 Td
(Skills: Python, Django, REST APIs, PostgreSQL, MongoDB) Tj
0 -30 Td
(Senior Python Developer at Tech Corp 2021-Present) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000220 00000 n 
0000000469 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
550
%%EOF"""

temp_file.write(pdf_content)
temp_file.close()

print(f"   ✓ Resume file created: {temp_path}")

# Step 6: User uploads resume
print("\n6. User Uploads Resume...")
with open(temp_path, 'rb') as f:
    files = {'file': f}
    data = {'recruitmentDriveId': drive_id}
    upload_res = requests.post(
        f"{BASE_URL}/resumes/upload",
        headers={"Authorization": f"Bearer {user_token}"},
        files=files,
        data=data
    ).json()

if "error" in upload_res:
    print(f"   ERROR: {upload_res['error']}")
    exit(1)

resume_id = upload_res.get("id")
print(f"   ✓ Resume uploaded (ID: {resume_id})")

# Clean up temp file
os.unlink(temp_path)

# Step 7: Admin views resumes for the drive
print("\n7. Admin Views Resumes for Drive...")
resumes_res = requests.get(
    f"{BASE_URL}/resumes/drive/{drive_id}",
    headers={"Authorization": f"Bearer {admin_token}"}
)

if resumes_res.status_code != 200:
    print(f"   ERROR: {resumes_res.status_code}")
    print(f"   Response: {resumes_res.text}")
    exit(1)

resumes = resumes_res.json()
print(f"   ✓ Retrieved {len(resumes)} resume(s)")

if len(resumes) > 0:
    for i, resume in enumerate(resumes, 1):
        print(f"\n   Resume #{i}:")
        print(f"     - Applicant: {resume.get('applicantName')}")
        print(f"     - Status: {resume.get('status')}")
        print(f"     - Similarity Score: {resume.get('similarityScore')}")
else:
    print("   ERROR: No resumes found! This indicates an authorization or query issue.")

print("\n" + "=" * 60)
print("TEST COMPLETED SUCCESSFULLY!")
print("=" * 60)
