import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from groq import Groq
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
# Enable CORS for Chrome Extension communication
CORS(app)

# Initialize Groq Client (Uses your GROQ_API_KEY from .env)
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
client = Groq(api_key=GROQ_API_KEY)

@app.route("/analyze-policy", methods=["POST"])
def analyze_policy():
    try:
        # 1. Get the data from the extension
        data = request.get_json()
        policy_text = data.get("text", "")

        if not policy_text:
            return jsonify({"error": "No policy text provided"}), 400

        # 2. SYSTEM INSTRUCTION: Forces the "Watchdog" persona and Legacy style
        system_message = (
            "You are a helpful AI that simplifies legal jargon for common people. "
            "Your goal is to be honest, blunt, and extremely concise. "
            "Do not use polite fillers. Respond ONLY in a valid JSON object."
        )

        # 3. USER PROMPT: Matches your screenshots exactly
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

        # 4. Call the Free Groq API
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": user_prompt}
            ],
            response_format={"type": "json_object"}, # Ensures JSON output
            temperature=0.1 # Low temperature for consistent formatting
        )

        # 5. Clean and Parse the response
        raw_content = response.choices[0].message.content.strip()
        
        # This cleaning step ensures your app doesn't show "nothing" if the AI adds markdown
        if raw_content.startswith("```"):
            raw_content = raw_content.split("json")[-1].split("```")[0].strip()

        # 6. Return the JSON to your JavaScript
        return jsonify(json.loads(raw_content))

    except Exception as e:
        # Log the error to your terminal for debugging
        print(f"Analysis Error: {str(e)}")
        return jsonify({
            "error": "Failed to analyze policy", 
            "details": str(e)
        }), 500

if __name__ == "__main__":
    # Ensure port matches your popup.js fetch URL
    app.run(debug=True, port=5000)