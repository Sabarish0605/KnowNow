from google import genai
import os

client = genai.Client(api_key="AIzaSyCBEVIe4QD9qgDXRryChujcns7QuhQ8hdY")

print("--- Available Models ---")
for model in client.models.list():
    print(model.name)