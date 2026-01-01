import os
import json
import threading
import time
import win32clipboard
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from groq import Groq
from dotenv import load_dotenv
from flaskwebgui import FlaskUI

load_dotenv()
app = Flask(__name__)
CORS(app)

# --- INITIALIZATION ---
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
client = Groq(api_key=GROQ_API_KEY)

latest_analysis_result = None
is_analyzing = False
last_analyzed_text = ""

ui = FlaskUI(app=app, server="flask", port=5001, width=850, height=750)

def get_clipboard_text():
    """Aggressive Windows Clipboard Fetcher."""
    for _ in range(3):
        try:
            win32clipboard.OpenClipboard()
            if win32clipboard.IsClipboardFormatAvailable(win32clipboard.CF_UNICODETEXT):
                data = win32clipboard.GetClipboardData(win32clipboard.CF_UNICODETEXT)
                win32clipboard.CloseClipboard()
                return data if data else ""
            win32clipboard.CloseClipboard()
        except:
            time.sleep(0.1)
    return ""

def perform_analysis(text):
    """Deep Auditor Prompt: No introductions, strictly professional results."""
    system_message = (
        "You are a blunt legal auditor. Do not use generic filler. "
        "Analyze for: 1. Data items collected, 2. Third-party sharing, 3. Risks. "
        "If it is a license (GPL/MIT), explain rights. Respond ONLY in JSON."
    )

    user_prompt = (
        "Analyze this text. Return a JSON object with 'en' and 'ta' keys. "
        "In the 'summary' field, use Markdown headers (###). Be extremely specific. "
        f"\n\nTEXT:\n{text[:15000]}"
    )

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": user_prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.1
        )
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        return {"en": {"summary": f"### ❌ Error\n{str(e)}"}, "ta": {"summary": "பிழை"}}

def clipboard_monitor():
    """Background loop that watches for changes and filters out code."""
    global last_analyzed_text, latest_analysis_result, is_analyzing
    print("🚀 Aggressive Guardian Active (Optimized for Chrome)...")
    
    while True:
        try:
            current = get_clipboard_text().strip()
            
            # Criteria: Changed, Long enough, and Not your VS Code work
            if current != last_analyzed_text and len(current) > 200:
                # Skip if it looks like code
                if any(ind in current for ind in ["def ", "import ", "const ", "function", "return "]):
                    last_analyzed_text = current
                    continue

                keywords = ["privacy", "terms", "data", "cookies", "policy", "agreement", "license", "legal"]
                if any(k in current.lower() for k in keywords):
                    print(f"🎯 Policy Match! Analyzing {len(current)} characters...")
                    last_analyzed_text = current
                    is_analyzing = True
                    latest_analysis_result = perform_analysis(current)
                    is_analyzing = False
            
            time.sleep(1.0) # Check every second
        except:
            time.sleep(2)

# Start the background thread
threading.Thread(target=clipboard_monitor, daemon=True).start()

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/check-updates")
def check_updates():
    global latest_analysis_result, is_analyzing
    res = {"new_data": latest_analysis_result, "is_analyzing": is_analyzing}
    if latest_analysis_result:
        latest_analysis_result = None
    return jsonify(res)

@app.route("/analyze-policy", methods=["POST"])
def manual_analyze():
    data = request.get_json()
    return jsonify(perform_analysis(data.get("text", "")))

if __name__ == "__main__":
    ui.run()