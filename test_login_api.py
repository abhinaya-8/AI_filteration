import requests
import json

url = 'http://localhost:5000/api/auth/login'
data = {
    'email': 'admin@company.com',
    'password': 'admin123'
}

print(f"Testing login endpoint: {url}")
print(f"Data: {json.dumps(data)}")

try:
    response = requests.post(url, json=data, headers={'Content-Type': 'application/json'})
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
except Exception as e:
    print(f"Error: {e}")
