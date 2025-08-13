// popup.js
console.log("Popup script loaded");

document.addEventListener("DOMContentLoaded", () => {
    const analyzeBtn = document.getElementById("analyzeButton");
    const loadingEl = document.getElementById("loading");
    const errorEl = document.getElementById("error");
    const summaryText = document.getElementById("summaryText");
    const riskyText = document.getElementById("riskyTermsText");
    const tabs = document.querySelectorAll(".tab");

    // Ensure initial state: summary tab active
    tabs.forEach(t => t.classList.remove("active"));
    document.querySelector('.tab[data-tab="summary"]').classList.add("active");
    document.getElementById("summaryContent").classList.remove("hidden");
    document.getElementById("riskyContent").classList.add("hidden");
    errorEl.classList.add("hidden");

    // Tab switching
    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            tabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");

            // hide all content sections then show chosen one
            document.querySelectorAll(".tab-content").forEach(c => c.classList.add("hidden"));
            document.getElementById(tab.dataset.tab + "Content").classList.remove("hidden");
        });
    });

    analyzeBtn.addEventListener("click", () => {
        console.log("Analyze clicked");
        loadingEl.classList.remove("hidden");
        errorEl.classList.add("hidden");

        // Clear previous contents
        summaryText.innerHTML = `<p class="placeholder">Analyzing...</p>`;
        riskyText.innerHTML = `<p class="placeholder">Analyzing...</p>`;

        // Get active tab text
        chrome.tabs.query({ active: true, currentWindow: true }, (tabsArr) => {
            if (!tabsArr || !tabsArr[0]) {
                console.error("No active tab");
                loadingEl.classList.add("hidden");
                errorEl.classList.remove("hidden");
                return;
            }

            const tabId = tabsArr[0].id;
            chrome.scripting.executeScript(
                {
                    target: { tabId: tabId },
                    func: () => {
                        // Try to pick main/article first for cleaner text
                        const sel = document.querySelector("main") || document.querySelector("article");
                        return (sel ? sel.innerText : document.body.innerText).trim();
                    }
                },
                (results) => {
                    if (!results || !results[0] || !results[0].result) {
                        console.error("Could not extract page text", results);
                        loadingEl.classList.add("hidden");
                        errorEl.classList.remove("hidden");
                        return;
                    }

                    const pageText = results[0].result;
                    if (!pageText || pageText.length < 10) {
                        loadingEl.classList.add("hidden");
                        summaryText.innerHTML = `<p class="placeholder">No policy text found on this page.</p>`;
                        riskyText.innerHTML = `<p class="placeholder">No risky terms found.</p>`;
                        return;
                    }

                    // Post to backend
                    fetch("http://127.0.0.1:5000/analyze-policy", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ text: pageText })
                    })
                    .then(response => response.json())
                    .then(data => {
                        console.log("Backend response:", data);
                        loadingEl.classList.add("hidden");

                        if (data.error) {
                            console.error("Server error:", data.error);
                            errorEl.classList.remove("hidden");
                            summaryText.innerHTML = `<p class="placeholder">Could not analyze policy.</p>`;
                            riskyText.innerHTML = `<p class="placeholder">No risky terms found.</p>`;
                            return;
                        }

                        summaryText.innerHTML = data.summary ? `<p>${data.summary}</p>` : `<p class="placeholder">No summary generated.</p>`;
                        if (Array.isArray(data.riskyTerms) && data.riskyTerms.length) {
                            riskyText.innerHTML = `<ul>${data.riskyTerms.map(t => `<li>${t}</li>`).join("")}</ul>`;
                        } else {
                            riskyText.innerHTML = `<p class="placeholder">No risky terms found.</p>`;
                        }
                    })
                    .catch(err => {
                        console.error("Fetch error:", err);
                        loadingEl.classList.add("hidden");
                        errorEl.classList.remove("hidden");
                    });
                }
            );
        });
    });
});
