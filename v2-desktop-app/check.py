import requests
resp = requests.post(
    "http://127.0.0.1:5000/analyze-policy",
    json={"text": "This is a privacy policy example about collecting user data and selling it to advertisers."}
)
print(resp.status_code)
print(resp.json())
