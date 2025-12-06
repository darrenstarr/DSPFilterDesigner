import requests
import json

# Test the spectrum endpoint
try:
    response = requests.post(
        'http://localhost:5000/api/spectrum',
        json={'type': 'original', 'freq_range': [0, 22050]}
    )
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)[:500]}")
except Exception as e:
    print(f"Error: {e}")
