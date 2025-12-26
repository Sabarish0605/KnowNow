from flask import Flask, request, jsonify
from flask_cors import CORS
import json
from google import genai

app = Flask(__name__)
# Enable CORS so your Chrome Extension can talk to this server
CORS(app)

# Initialize the Gemini Client
# Note: Keep your API key secure
client = genai.Client(api_key="AIzaSyA0sbvt3FaM8YlRVc9GxmoD-l4apQiEuvw")

@app.route("/analyze-policy", methods=["POST"])
def analyze_policy():
    try:
        # 1. Get data from the request
        data = request.get_json()
        policy_text = data.get("text", "")

        if not policy_text:
            return jsonify({"error": "No policy text provided"}), 400

        # 2. Optimized prompt for simple, structured analysis in both languages
        # This allows seamless switching in the popup
        prompt = (
            "Analyze this privacy policy. Return a JSON object with 'en' and 'ta' keys. "
            "For each language, provide a 'summary' string formatted with these headers: "
            "1. DATA COLLECTED: (List specific data items like email, location, device info) "
            "2. PERMANENT RULES: (Rules the user cannot change once accepted) "
            "3. YOUR RIGHTS: (What control the user still has). "
            "Keep the language extremely simple and avoid legal jargon. "
            "Also provide a 'riskyTerms' list of at least 5 specific dangerous clauses."
            f"\n\nTEXT:\n{policy_text[:15000]}"
        )

        # 3. Call Gemini 2.5 Flash
        response = client.models.generate_content(
            model="gemini-2.0-flash", # Use 2.0 or 1.5 flash as per availability
            config={
                "response_mime_type": "application/json", 
                "temperature": 0.1
            },
            contents=prompt
        )

        # 4. Parse the AI's JSON string into a Python dictionary and return it
        analysis_result = json.loads(response.text)
        return jsonify(analysis_result)

    except Exception as e:
        # Error handling to prevent the server from crashing
        print(f"Error: {str(e)}")
        return jsonify({"error": "Failed to analyze policy", "details": str(e)}), 500

if __name__ == "__main__":
    # Run the server on port 5000
    app.run(debug=True, port=5000)