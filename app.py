# app.py

from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import os
import json # Import the json library for safer parsing
import re   # Import regex for more robust string handling

app = Flask(__name__)
CORS(app)  # This is crucial for allowing the browser extension to connect.

# Initialize the Gemini API with your API key
# Ensure this line specifically checks for 'GEMINI_API_KEY'
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

@app.route('/analyze-policy', methods=['POST'])
def analyze_policy():
    """
    Analyzes a privacy policy text using the Gemini API to provide a summary and identify risky terms.
    """
    try:
        # Get the text from the incoming POST request
        data = request.get_json()
        policy_text = data.get('text', '')

        if not policy_text:
            return jsonify({
                "summary": "No policy text was provided.",
                "riskyTerms": []
            })

        # Define the AI model to use
        # This model is specifically for text generation tasks
        model = genai.GenerativeModel('gemini-2.5-flash-preview-05-20')

        # Craft a prompt to get a summary and risky terms from the AI
        prompt = f"""
        Analyze the following text which is a privacy policy.
        
        1.  Provide a short, easy-to-understand summary of the policy in a single paragraph.
        2.  Identify a list of up to 5 "risky terms" or phrases. Risky terms are those that indicate user data might be shared, sold, tracked, or used for purposes the user might not expect.

        Format your response as a JSON object with two keys: "summary" and "riskyTerms" (an array of strings).

        Here is the text to analyze:
        ---
        {policy_text}
        ---
        """
        
        # Generate the content using the model
        response = model.generate_content(prompt)
        
        # The AI will return the response as a string, so we need to parse it
        try:
            ai_response_text = response.text
            # Attempt to directly parse the response as JSON
            parsed_response = json.loads(ai_response_text)

        except json.JSONDecodeError:
            # If direct parsing fails, try to extract a JSON block using regex
            try:
                json_match = re.search(r'```json\n([\s\S]*)\n```', ai_response_text)
                if json_match:
                    json_string = json_match.group(1)
                    parsed_response = json.loads(json_string)
                else:
                    raise ValueError("Could not find a valid JSON block in the AI response.")
            except (json.JSONDecodeError, ValueError) as ve:
                # Handle cases where the AI response is malformed
                print(f"Error parsing AI response: {ve}")
                return jsonify({
                    "summary": "Could not parse AI response. Please try again.",
                    "riskyTerms": []
                }), 500
        except Exception as e:
            # Catch any other unexpected errors during parsing
            print(f"Unexpected error during parsing: {e}")
            return jsonify({
                "summary": "Could not parse AI response. Please try again.",
                "riskyTerms": []
            }), 500

        # Return the parsed AI response
        return jsonify({
            "summary": parsed_response.get("summary", "Could not generate summary."),
            "riskyTerms": parsed_response.get("riskyTerms", [])
        })

    except Exception as e:
        # Handle any other exceptions that might occur
        print(f"An internal error occurred: {e}")
        return jsonify({
            "summary": "An internal error occurred.",
            "riskyTerms": [],
            "error": str(e)
        }), 500

if __name__ == '__main__':
    # You must run the server with `flask run`
    app.run(debug=True, port=5000)
