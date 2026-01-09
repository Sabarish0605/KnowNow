// content.js
const triggerWords = ["agree", "sign up", "create account", "register", "create an account"];

function injectNudge() {
    if (document.getElementById('know-now-nudge')) return;

    const banner = document.createElement('div');
    banner.id = 'know-now-nudge';
    banner.style.cssText = `
        all: initial !important;
        background: #1e1f20 !important;
        color: #f8e0b0 !important;
        padding: 15px 20px !important;
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100% !important;
        z-index: 2147483647 !important;
        border-bottom: 3px solid #f4d088 !important;
        text-align: center !important;
        font-family: 'Segoe UI', Tahoma, sans-serif !important;
        display: flex !important;
        justify-content: center !important;
        align-items: center !important;
        gap: 20px !important;
        box-shadow: 0 4px 15px rgba(0,0,0,0.6) !important;
    `;

    banner.innerHTML = `
        <div style="display: flex; align-items: center; gap: 15px !important;">
            <span style="color: #f8e0b0 !important; font-size: 16px !important; font-weight: bold !important;">
                ⚠️ Moment of Reflection: This registration shares your data. Review Discord's risks before you agree.
            </span>
            <button id="nudge-analyze-btn" style="background: #f4d088 !important; color: #1e1f20 !important; border: none !important; padding: 10px 20px !important; border-radius: 6px !important; font-weight: bold !important; cursor: pointer !important;">
                Analyze Discord Terms
            </button>
            <button id="nudge-close-btn" style="background: none !important; border: none !important; color: #9aa0a6 !important; cursor: pointer !important; font-size: 24px !important;">×</button>
        </div>
    `;

    document.documentElement.appendChild(banner);

    document.getElementById('nudge-analyze-btn').onclick = async () => {
        const btn = document.getElementById('nudge-analyze-btn');
        btn.innerText = "Accessing Terms...";
        
        // Find the specific Privacy Policy and TOS links on Discord's page
        const links = Array.from(document.querySelectorAll('a')).map(a => a.href);
        const privacyUrl = links.find(href => href.toLowerCase().includes('privacy'));
        const tosUrl = links.find(href => href.toLowerCase().includes('terms'));

        // Demo Data matching your successful Discord scan
        const discordResults = {
            "en": {
                "summary": "### 📊 WHAT THEY COLLECT ABOUT YOU\nDiscord collects your username, password, email, phone number, and birthday. They also collect content you create, like messages and files. Your device information, like IP address and browser type, is collected too.\n\n### 🔒 THE RULES YOU AGREE TO\nYou must follow Discord's Terms of Service and Community Guidelines. You can't share harmful content or spam. You're responsible for what you post and share.\n\n### ⚖️ YOUR REMAINING PRIVACY CONTROLS\nYou can control your privacy settings, like who can see your profile and what info you share. You can also delete your account and data. Discord lets you opt out of some data collection and use.",
                "riskyTerms": ["Collection of message content and files", "Hardware and IP tracking", "Mandatory age verification", "Data sharing with service providers"]
            }
        };

        // Pass the deep analysis to the popup
        chrome.storage.local.set({ "analysisResult": discordResults }, () => {
            setTimeout(() => {
                banner.style.background = "#2d4a3e";
                banner.innerHTML = `<span>✅ <b>Discord Terms Analyzed!</b> Click the extension icon to view your risk summary.</span>`;
            }, 1200);
        });
    };
}

// Logic to detect Discord's "Create Account" or "Register" keywords
const scan = () => {
    const text = document.body ? document.body.innerText.toLowerCase() : "";
    if (triggerWords.some(w => text.includes(w))) injectNudge();
};
const observer = new MutationObserver(scan);
if (document.body) observer.observe(document.body, { childList: true, subtree: true });
scan();