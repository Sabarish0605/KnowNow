import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from google import genai
from dotenv import load_dotenv

# Load variables from .env file
load_dotenv()

app = Flask(__name__)
# Enable CORS for Chrome Extension communication
CORS(app)

# Securely retrieve the API key from the environment
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Initialize the Gemini Client
client = genai.Client(api_key=GEMINI_API_KEY)

@app.route("/analyze-policy", methods=["POST"])
def analyze_policy():
    try:
        # 1. Extract data from request
        data = request.get_json()
        policy_text = data.get("text", "")

        if not policy_text:
            return jsonify({"error": "No policy text provided"}), 400

        # 2. Optimized Structured Prompt
        # Instructs AI to provide a clean, consistent format for both languages
        prompt = (
            "Analyze this privacy policy. Return a valid JSON object with 'en' and 'ta' keys. "
            "For each language, provide a 'summary' string formatted exactly with these bold headers: "
            "\n**1. DATA COLLECTED:** (List specific data items) "
            "\n**2. PERMANENT RULES:** (Irreversible rules) "
            "\n**3. YOUR RIGHTS:** (User controls). "
            "Keep the language simple and friendly. "
            "Also provide a 'riskyTerms' list containing 5-7 dangerous clauses found in the text."
            f"\n\nTEXT TO ANALYZE:\n{policy_text[:15000]}"
        )

        # 3. Call Gemini 2.0 Flash with JSON constraint
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            config={
                "response_mime_type": "application/json", 
                "temperature": 0.1 # Low temperature for consistent formatting
            },
            contents=prompt
        )

        # 4. Parse and Return
        return jsonify(json.loads(response.text))

    except Exception as e:
        # Log error for server-side debugging
        print(f"Analysis Error: {str(e)}")
        return jsonify({
            "error": "Failed to analyze policy", 
            "details": "The AI service is currently busy or the text was too complex."
        }), 500

if __name__ == "__main__":
    # Ensure port matches your popup.js fetch URL
    app.run(debug=True, port=5000)