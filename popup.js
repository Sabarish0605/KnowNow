let cachedData = null;

document.addEventListener('DOMContentLoaded', () => {
    const analyzeBtn = document.getElementById('analyzeButton');
    const langSelect = document.getElementById('languageSelect');
    const loading = document.getElementById('loading');
    const progressBar = document.getElementById('progressBar');
    const progressPercent = document.getElementById('progressPercent');
    const summaryText = document.getElementById('summaryText');
    const riskyTermsText = document.getElementById('riskyTermsText');

    const updateDisplay = () => {
        if (!cachedData) return;

        const lang = langSelect.value;
        const content = cachedData[lang];

        if (!content) {
            summaryText.innerHTML = "No data available for this language.";
            return;
        }

        // 1. Process Summary
        let rawSummary = String(content.summary || "");
        let cleanSummary = rawSummary.replace(/\*/g, ''); // Remove markdown italics/bold
        let formattedSummary = cleanSummary.replace(/### (.*)/g, '<span class="summary-header">$1</span>');
        formattedSummary = formattedSummary.replace(/\n/g, '<br>');

        summaryText.innerHTML = formattedSummary;

        // 2. Process Risky Terms
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
            const noRiskMsg = lang === 'ta' ? "அபாயங்கள் ஏதும் கண்டறியப்படவில்லை." : "Analysis complete: No risky clauses detected.";
            riskyTermsText.innerHTML = `<p style="text-align:center; padding-top:20px; color:#9aa0a6;">${noRiskMsg}</p>`;
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

    // Analysis Execution
    analyzeBtn.addEventListener('click', async () => {
        // Reset UI
        loading.classList.remove('hidden');
        summaryText.innerHTML = "";
        riskyTermsText.innerHTML = "";
        
        let progress = 0;
        progressBar.style.width = "0%";
        
        const interval = setInterval(() => {
            if (progress < 90) {
                progress += Math.random() * 8;
                progressBar.style.width = progress + "%";
                progressPercent.innerText = Math.floor(progress) + "%";
            }
        }, 300);

        try {
            // Get Tab and Content
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            // Check if it's a valid webpage (not chrome:// settings)
            if (tab.url.startsWith("chrome://")) {
                throw new Error("Cannot analyze browser settings pages.");
            }

            const injection = await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: () => document.body.innerText
            });

            const policyContent = injection[0].result;

            // Fetch request to Local Desktop App Server
            // IMPORTANT: Ensure this port matches your app.py (e.g., 5001)
            const response = await fetch('http://127.0.0.1:5001/analyze-policy', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: policyContent })
            });

            if (!response.ok) throw new Error("Server error: " + response.status);

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
            console.error("Extension Error:", err);
            summaryText.innerHTML = `<p style="color:#ff5252; padding:10px;">
                <strong>Connection Failed:</strong><br>
                1. Ensure your KnowNow Desktop App is open.<br>
                2. Check if the port (5001) is correct.<br>
                3. Check your firewall settings.
            </p>`;
        }
    });

    document.getElementById('closeButton').addEventListener('click', () => window.close());
});