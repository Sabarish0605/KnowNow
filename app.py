import os
import json
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from groq import Groq
from dotenv import load_dotenv
from flaskwebgui import FlaskUI # NEW: Desktop Wrapper

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Initialize Groq Client
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
client = Groq(api_key=GROQ_API_KEY)

# NEW: Configure the Desktop UI
# This will open your Flask app in a dedicated window
ui = FlaskUI(app=app, server="flask", port=5001, width=800, height=600)

@app.route("/")
def index():
    # This renders the manual paste UI for Phase 1
    return render_template("index.html")

@app.route("/analyze-policy", methods=["POST"])
def analyze_policy():
    try:
        data = request.get_json()
        policy_text = data.get("text", "")

        if not policy_text:
            return jsonify({"error": "No policy text provided"}), 400

        system_message = (
            "You are a helpful AI that simplifies legal jargon for common people. "
            "Your goal is to be honest, blunt, and extremely concise. "
            "Do not use polite fillers. Respond ONLY in a valid JSON object."
        )

        user_prompt = (
            "Analyze this privacy policy. Return a JSON object with 'en' and 'ta' keys. "
            "For each language, provide a 'summary' string using these EXACT headers and icons: "
            "\n\n### 📊 WHAT THEY COLLECT ABOUT YOU\n(Explain data items like location, identity, and behavior in 2-3 short, blunt sentences) "
            "\n\n### 🔒 THE RULES YOU AGREE TO\n(Explain the most restrictive rules regarding content and behavior in 2-3 short, blunt sentences) "
            "\n\n### ⚖️ YOUR REMAINING PRIVACY CONTROLS\n(Explain rights like deleting data or opting out in 2-3 short, blunt sentences) "
            "\n\nCRITICAL: Keep the language simple for non-experts. Do not use italics (*) or background tags. "
            "Also, provide a 'riskyTerms' list inside each language object with 5 blunt concerns."
            f"\n\nTEXT TO ANALYZE:\n{policy_text[:15000]}"
        )

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": user_prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.1
        )

        raw_content = response.choices[0].message.content.strip()
        
        if raw_content.startswith("```"):
            raw_content = raw_content.split("json")[-1].split("```")[0].strip()

        return jsonify(json.loads(raw_content))

    except Exception as e:
        print(f"Analysis Error: {str(e)}")
        return jsonify({"error": "Failed to analyze policy", "details": str(e)}), 500

if __name__ == "__main__":
    # Start the Desktop UI instead of app.run()
    ui.run()