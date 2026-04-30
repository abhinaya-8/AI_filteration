import requests
import json

# Test login
response = requests.post("http://localhost:5000/api/auth/login", json={
    "email": "admin@test.com",
    "password": "admin123"
})

print(f"Status: {response.status_code}")
print(f"Response: {json.dumps(response.json(), indent=2)}")

# Also test user login
response2 = requests.post("http://localhost:5000/api/auth/login", json={
    "email": "john@test.com",
    "password": "john123"
})

print(f"\nUser Login Status: {response2.status_code}")
print(f"User Response: {json.dumps(response2.json(), indent=2)}")
