let cachedData = null; // Stores { en: {...}, ta: {...} }

document.addEventListener('DOMContentLoaded', () => {
    const analyzeBtn = document.getElementById('analyzeButton');
    const langSelect = document.getElementById('languageSelect');
    const loading = document.getElementById('loading');
    const progressBar = document.getElementById('progressBar');
    const progressPercent = document.getElementById('progressPercent');
    const summaryText = document.getElementById('summaryText');
    const riskyTermsText = document.getElementById('riskyTermsText');

    // --- Seamless Switcher: Now refreshes BOTH sections ---
    const updateDisplay = () => {
        if (!cachedData) return;

        const lang = langSelect.value; // 'en' or 'ta'
        const content = cachedData[lang];

        // 1. Update Summary (with formatting)
        const formattedSummary = String(content.summary || "").replace(/\n/g, '<br>');
        summaryText.innerHTML = formattedSummary;

        // 2. Update Risky Terms (clears old language and adds new)
        riskyTermsText.innerHTML = ""; 
        if (content.riskyTerms && content.riskyTerms.length > 0) {
            const ul = document.createElement('ul');
            ul.style.listStyleType = "none";
            ul.style.padding = "0";

            content.riskyTerms.forEach((term, index) => {
                const li = document.createElement('li');
                // Clean symbols and add numbered points
                const cleanTerm = String(term).replace(/[^\x20-\x7E\u0B80-\u0BFF]/g, '').trim();
                li.innerText = `${index + 1}. ${cleanTerm}`;
                ul.appendChild(li);
            });
            riskyTermsText.appendChild(ul);
        } else {
            riskyTermsText.innerText = lang === 'ta' ? "அபாயங்கள் ஏதும் கண்டறியப்படவில்லை." : "No risks detected.";
        }
    };

    // Trigger update whenever the dropdown changes
    langSelect.addEventListener('change', updateDisplay);

    // --- Tab Logic ---
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

    // --- Analyze Logic ---
    analyzeBtn.addEventListener('click', async () => {
        loading.classList.remove('hidden');
        summaryText.innerText = "";
        riskyTermsText.innerText = "";
        
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

            if (!response.ok) throw new Error("Server Error");

            cachedData = await response.json();
            
            clearInterval(interval);
            progressBar.style.width = "100%";
            progressPercent.innerText = "100%";
            
            setTimeout(() => {
                loading.classList.add('hidden');
                updateDisplay(); // This now updates both Summary and Risky Terms
            }, 600);

        } catch (err) {
            clearInterval(interval);
            loading.classList.add('hidden');
            summaryText.innerText = "Error: " + err.message;
        }
    });

    document.getElementById('closeButton').addEventListener('click', () => window.close());
});