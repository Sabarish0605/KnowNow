# KnowNow: AI-Powered Privacy Policy Analyzer 🛡️

**KnowNow** is a modern browser extension that uses **Google Gemini AI** to transform dense, legalistic privacy policies into clear, human-readable summaries. It identifies what matters most to your privacy in seconds.

## 🚀 Key Features

* **Simplified Summaries**: Replaces complex legal jargon with three easy-to-understand categories:
    * **📊 WHAT THEY COLLECT ABOUT YOU**: A clear breakdown of personal, behavioral, and technical data acquisition.
    * **🔒 THE RULES YOU AGREE TO**: Understanding the permanent provisions and binding rules of the service.
    * **⚖️ YOUR PRIVACY CONTROLS**: Highlighting the rights and controls you retain over your own data.
* **Risky Terms Detection**: Automatically scans and flags at least 5 critical concerns, such as aggressive data retention or broad content licensing.
* **Bilingual Support**: Instant toggle between **English** and **Tamil** for localized accessibility.
* **Clean Dark UI**: A crisp, professional interface designed for maximum readability and a premium user experience.

## 🛠️ Technical Stack

* **Frontend**: HTML5, CSS3 (Inter UI), JavaScript (Chrome Scripting API).
* **Backend**: Python, Flask.
* **AI Engine**: Google Gemini 1.5 Flash (via Generative AI API).
* **Licensing**: Protected under Creative Commons for non-commercial use.

## 📦 Installation & Setup

### 1. Backend Configuration
1.  Clone the repository:
    ```bash
    git clone [https://github.com/your-username/KnowNow.git](https://github.com/your-username/KnowNow.git)
    cd KnowNow
    ```
2.  Install required dependencies:
    ```bash
    pip install -r requirements.txt
    ```
3.  Configure your environment:
    * Create a `.env` file in the root directory.
    * Add your API key: `GEMINI_API_KEY=your_google_gemini_key_here`.
4.  Launch the Flask server:
    ```bash
    python app.py
    ```

### 2. Extension Installation
1.  Open Chrome and navigate to `chrome://extensions/`.
2.  Enable **Developer mode** (top right toggle).
3.  Click **Load unpacked** and select the folder containing the extension files.
4.  Open any Privacy Policy page (e.g., YouTube or Google) and click **Analyze Page**.

## 📸 Interface Preview

| Analysis View | Risky Provisions |
| :--- | :--- |
| ![Summary Tab](https://via.placeholder.com/380x500?text=Summary+View) | ![Risky Terms Tab](https://via.placeholder.com/380x500?text=Risky+Terms+View) |

## 📄 License & Intellectual Property

This project is licensed under the **Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)** license. 

**Summary of License:**
* **Attribution**: You must give appropriate credit to the original creator.
* **Non-Commercial**: You may not use this material for commercial purposes or financial gain.
* **ShareAlike**: If you remix or build upon the material, you must distribute your contributions under the same license.

For full legal details, see the [LICENSE](LICENSE) file.

---
**Developed with ❤️ by [Sabarish M](http://www.linkedin.com/in/sabarish-m-a7435334a)**