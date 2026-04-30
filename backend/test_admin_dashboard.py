#!/usr/bin/env python
"""Test admin applications viewing"""
import requests
import json

BASE_URL = "http://localhost:5000/api"

print("=" * 60)
print("TESTING ADMIN DASHBOARD - APPLICATIONS DISPLAY")
print("=" * 60)

# Step 1: Admin login
print("\n1. Admin Login...")
admin_login = requests.post(f"{BASE_URL}/auth/login", json={
    "email": "admin@test.com",
    "password": "admin123"
}).json()

admin_token = admin_login.get("token")
admin_user = admin_login.get("user")
print(f"   ✓ Logged in as: {admin_user['name']}")

# Step 2: Get admin's drives
print("\n2. Admin Gets Their Drives...")
drives_res = requests.get(
    f"{BASE_URL}/drives",
    headers={"Authorization": f"Bearer {admin_token}"}
).json()

print(f"   ✓ Found {len(drives_res)} drive(s)")
if len(drives_res) == 0:
    print("   ERROR: No drives found! Admin needs to create a drive first.")
    exit(1)

drive = drives_res[0]
drive_id = drive["id"]
print(f"   ✓ Using drive: {drive['roleTitle']} (ID: {drive_id})")

# Step 3: Get resumes for this drive
print("\n3. Admin Gets Applications for Drive...")
resumes_res = requests.get(
    f"{BASE_URL}/resumes/drive/{drive_id}",
    headers={"Authorization": f"Bearer {admin_token}"}
)

print(f"   Status: {resumes_res.status_code}")
if resumes_res.status_code != 200:
    print(f"   ERROR: {resumes_res.text}")
    exit(1)

resumes = resumes_res.json()
print(f"   ✓ Found {len(resumes)} application(s)")

if len(resumes) == 0:
    print("   ⚠ No applications found (this might be okay if none were submitted)")
else:
    print("\n   Applications:")
    for resume in resumes:
        print(f"   - {resume.get('applicantName', 'Unknown')}")
        print(f"     Status: {resume.get('status')}")
        print(f"     Similarity Score: {resume.get('similarityScore')}")
        print(f"     Resume ID: {resume.get('id')}")

# Step 4: User login and get their applications
print("\n4. User Gets Their Applications...")
user_login = requests.post(f"{BASE_URL}/auth/login", json={
    "email": "john@test.com",
    "password": "john123"
}).json()

user_token = user_login.get("token")
print(f"   ✓ Logged in as: {user_login['user']['name']}")

user_apps = requests.get(
    f"{BASE_URL}/resumes/my-applications",
    headers={"Authorization": f"Bearer {user_token}"}
).json()

print(f"   ✓ Found {len(user_apps)} application(s)")
for app in user_apps:
    print(f"   - {app.get('roleTitle')} at {app.get('companyName')}")
    print(f"     Status: {app.get('status')}")

print("\n" + "=" * 60)
print("DEBUG INFO: API RESPONSE STRUCTURE")
print("=" * 60)

if len(resumes) > 0:
    print("\nResume object structure (first item):")
    print(json.dumps(resumes[0], indent=2, default=str))

if len(user_apps) > 0:
    print("\nUser application object structure (first item):")
    print(json.dumps(user_apps[0], indent=2, default=str))

print("\n" + "=" * 60)
print("TEST COMPLETE")
print("=" * 60)
