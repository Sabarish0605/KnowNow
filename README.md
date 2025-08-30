Know Now: AI-Powered Privacy Policy Analyzer

Know Now is a browser extension designed to help users quickly understand complex and lengthy privacy policies. By leveraging the power of Google's Gemini AI, this tool provides concise summaries and highlights potentially risky terms directly within your browser, making it easier to make informed decisions about your data.
Table of Contents

    Features

    How It Works

    Project Structure

    Technologies Used

    Setup and Installation

        Prerequisites

        Backend Setup

        Frontend (Chrome Extension) Setup

    How to Use

Features

    AI-Powered Summaries: Get easy-to-understand summaries of any webpage's privacy policy.

    Risky Term Identification: Automatically detects and lists clauses and terms that might be risky from a privacy perspective.

    Keyword Highlighting: Visually highlights important keywords within the summary for quick scanning.

    Multi-Language Support: Provides analysis in multiple languages (currently supports English and Tamil).

    User-Friendly Interface: A clean, tabbed interface to switch between the AI summary and the list of risky terms.

How It Works

The project consists of two main components: a browser extension frontend and a local Python backend.

    Browser Extension (Frontend): When a user navigates to a privacy policy page and clicks "Analyze Page", the extension's content script extracts the text from the page.

    Local Server (Backend): The extracted text is sent to a local Flask server running on your machine.

    AI Analysis: The Flask server forwards the text to the Google Gemini API, requesting a summary, a list of risky terms, and relevant keywords.

    Display Results: The AI-generated analysis is sent back to the browser extension, where it is neatly displayed in the popup UI.

Project Structure

.
├── app.py                # Flask backend server that communicates with the Gemini API
├── check.py              # A simple script to test the backend endpoint
├── manifest.json         # The core configuration file for the Chrome extension
├── popup.html            # The HTML structure for the extension's popup window
├── popup.js              # The JavaScript logic for the popup, handles API calls and DOM manipulation
├── popup.css             # The CSS file for styling the popup
└── icons/                # Directory for extension icons (e.g., icon16.png, icon48.png)

Technologies Used

    Frontend: HTML, CSS, JavaScript (for the Chrome Extension)

    Backend: Python, Flask, Flask-CORS

    AI Model: Google Gemini

    Python Libraries: google-generativeai, requests

Setup and Installation

Follow these steps to get the extension running on your local machine.
Prerequisites

    Python 3.7+

    Google Chrome (or any Chromium-based browser)

    A Google Gemini API Key. You can get one from Google AI Studio.

Backend Setup

    Clone the Repository:

    git clone <your-repository-url>
    cd <your-repository-directory>

    Create a Virtual Environment (Recommended):

    python -m venv venv
    # On Windows
    venv\Scripts\activate
    # On macOS/Linux
    source venv/bin/activate

    Install Dependencies:
    Create a requirements.txt file with the following content:

    Flask
    Flask-Cors
    google-generativeai
    requests

    Then, run the installation command:

    pip install -r requirements.txt

    Set Environment Variable:
    You must set your Gemini API key as an environment variable.

    # On Windows (Command Prompt)
    set GEMINI_API_KEY=YOUR_API_KEY_HERE

    # On macOS/Linux (Bash/Zsh)
    export GEMINI_API_KEY='YOUR_API_KEY_HERE'

    Run the Flask Server:

    flask run

    The backend server should now be running at http://127.0.0.1:5000.

Frontend (Chrome Extension) Setup

    Open your Chrome browser and navigate to chrome://extensions.

    Enable Developer mode using the toggle switch in the top-right corner.

    Click the "Load unpacked" button that appears on the top-left.

    In the file selection dialog, select the folder containing the extension files (the root of your project directory where manifest.json is located).

    The "Know Now Extension" should now appear in your list of extensions and be active.

How to Use

    Navigate to a webpage that contains a privacy policy.

    Click on the "Know Now" extension icon in your browser's toolbar.

    The popup will appear. Click the "Analyze Page" button.

    Wait a few moments for the AI to process the text.

    View the generated summary in the "AI Summary" tab.

    Click on the "Risky Terms" tab to see a list of potentially problematic clauses.

    Use the language dropdown to switch the analysis to a different language.
