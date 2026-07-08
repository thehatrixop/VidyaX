import requests
import json

payload = {
    "subject_id": "aptitude",
    "topics": ["Blood Relations"],
    "challenge": "rookie",
    "question_count": 3
}

print("Fetching updated generated questions...")
r = requests.post("http://localhost:8000/api/v1/generate-paper", json=payload)
if r.status_code == 200:
    print(json.dumps(r.json(), indent=2))
else:
    print("Error:", r.status_code, r.text)
