/* ══════════════════════════════════════════════
   TRANSLATION SYSTEM - SECURE MODE (NETLIFY)
   ══════════════════════════════════════════════ */

console.log("Translation system via Netlify Functions ready.");

document.addEventListener('mouseup', async (e) => {
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();

    // Hide the bubble if the user clicks elsewhere or if the selection is empty
    const overlay = document.getElementById('translation-overlay');
    if (selectedText.length === 0) {
        if (overlay && !overlay.contains(e.target)) {
            overlay.style.display = 'none';
        }
        return;
    }

    // Trigger translation only if the selected text is long enough
    if (selectedText.length > 5) {
        console.log("Selection detected:", selectedText);
        showTranslationTooltip(selection, "Translation...");
        
        try {
            // PRO CALL: We contact YOUR Netlify function, not Hugging Face directly
            const response = await fetch("/.netlify/functions/translate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: selectedText })
            });

            const result = await response.json();
            console.log("Response from Netlify server:", result);

            // Handle the response (Hugging Face often returns an array)
            if (Array.isArray(result) && result[0].translation_text) {
                showTranslationTooltip(selection, result[0].translation_text);
            } else if (result.error) {
                showTranslationTooltip(selection, "Almost there...");
            } else {
                showTranslationTooltip(selection, "Response format error.");
            }
        } catch (err) {
            console.error("Fetch error:", err);
            showTranslationTooltip(selection, "Server connection error.");
        }
    }
});

// Tooltip display function — unchanged but cleaned up
function showTranslationTooltip(selection, text) {
    let display = document.getElementById('translation-overlay');
    if (!display) {
        display = document.createElement('div');
        display.id = 'translation-overlay';
        document.body.appendChild(display);
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    display.textContent = text;
    display.style.display = 'block';
    
    // Precise positioning
    display.style.left = (rect.left + window.scrollX) + "px";
    display.style.top = (rect.bottom + window.scrollY + 10) + "px";
}