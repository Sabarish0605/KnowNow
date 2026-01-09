// popup.js
let cachedData = null; 

document.addEventListener('DOMContentLoaded', () => {
    const analyzeBtn = document.getElementById('analyzeButton');
    const langSelect = document.getElementById('languageSelect');
    const loading = document.getElementById('loading');
    const progressBar = document.getElementById('progressBar');
    const progressPercent = document.getElementById('progressPercent');
    const summaryText = document.getElementById('summaryText');
    const riskyTermsText = document.getElementById('riskyTermsText');

    // CHECK STORAGE FOR EXISTING RESULTS
    chrome.storage.local.get(['analysisResult'], (result) => {
        if (result.analysisResult) {
            cachedData = result.analysisResult;
            updateDisplay();
            // Optional: chrome.storage.local.remove('analysisResult'); // Clear after use
        }
    });

    const updateDisplay = () => {
        if (!cachedData) return;

        const lang = langSelect.value; 
        const content = cachedData[lang];

        let rawSummary = String(content.summary || "");
        let cleanSummary = rawSummary.replace(/\*/g, '');
        let formattedSummary = cleanSummary.replace(/### (.*)/g, '<span class="summary-header">$1</span>');
        formattedSummary = formattedSummary.replace(/\n/g, '<br>');

        summaryText.innerHTML = formattedSummary;

        riskyTermsText.innerHTML = ""; 
        const terms = content.riskyTerms || [];
        
        if (terms.length > 0) {
            const ul = document.createElement('ul');
            terms.forEach((term, index) => {
                const li = document.createElement('li');
                li.style.fontStyle = "normal";
                const cleanTerm = String(term).replace(/\*/g, '').trim();
                li.innerHTML = `<strong>${index + 1}.</strong> ${cleanTerm}`;
                ul.appendChild(li);
            });
            riskyTermsText.appendChild(ul);
        } else {
            riskyTermsText.innerHTML = `<p style="text-align:center; padding-top:20px; color:#9aa0a6;">No risks detected.</p>`;
        }
    };

    langSelect.addEventListener('change', updateDisplay);

    // Tab Switcher Logic
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.getAttribute('data-tab');
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            tabContents.forEach(content => {
                content.classList.add('hidden');
                if (content.id === target + "Content" || content.id === target + "TermsContent") {
                    content.classList.remove('hidden');
                }
            });
        });
    });

    // Existing Analysis Button Logic
    analyzeBtn.addEventListener('click', async () => {
        loading.classList.remove('hidden');
        summaryText.innerHTML = ""; 
        riskyTermsText.innerHTML = "";
        
        let progress = 0;
        const interval = setInterval(() => {
            if (progress < 90) {
                progress += Math.random() * 8;
                progressBar.style.width = progress + "%";
                progressPercent.innerText = Math.floor(progress) + "%";
            }
        }, 300);

        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            const injection = await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: () => document.body.innerText
            });

            const response = await fetch("http://127.0.0.1:5000/analyze-policy", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: injection[0].result })
            });

            cachedData = await response.json();
            clearInterval(interval);
            progressBar.style.width = "100%";
            progressPercent.innerText = "100%";
            
            setTimeout(() => {
                loading.classList.add('hidden');
                updateDisplay(); 
            }, 600);
        } catch (err) {
            clearInterval(interval);
            loading.classList.add('hidden');
            summaryText.innerText = "Server error. Is the Flask server running?";
        }
    });

    document.getElementById('closeButton').addEventListener('click', () => window.close());
});