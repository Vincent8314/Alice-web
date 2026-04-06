/* ══════════════════════════════════════════════
   TRANSLATION SYSTEM - SECURE MODE (NETLIFY)
   ══════════════════════════════════════════════ */

console.log("Translation system via Netlify Functions ready.");

document.addEventListener('mouseup', async (e) => {
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();

    // Hide the tooltip if the user clicks away or clears the selection
    const overlay = document.getElementById('translation-overlay');
    if (selectedText.length === 0) {
        if (overlay && !overlay.contains(e.target)) {
            overlay.style.display = 'none';
        }
        return;
    }

    // Trigger translation if the selection is long enough
    if (selectedText.length > 5) {
        console.log("Selection detected:", selectedText);
        showTranslationTooltip(selection, "Translating...");

        // For a single word, grab its surrounding sentence for context
        const isSingleWord = !selectedText.includes(' ');
        const surroundingSentence = isSingleWord ? getSurroundingSentence(selection) : null;

        const payload = isSingleWord && surroundingSentence
            ? { word: selectedText, context: surroundingSentence }
            : { text: selectedText };

        try {
            // PRO CALL: We contact the Netlify function, not Hugging Face directly
            const response = await fetch("/.netlify/functions/translate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const result = await response.json();
            console.log("Netlify server response:", result);

            // Handle response (Hugging Face often returns an array)
            if (Array.isArray(result) && result[0].translation_text) {
                showTranslationTooltip(selection, result[0].translation_text);
            } else if (result.translation) {
                showTranslationTooltip(selection, result.translation);
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

// Walks up the DOM to find the sentence containing the selected word
function getSurroundingSentence(selection) {
    try {
        const anchorNode = selection.anchorNode;
        const parentEl = anchorNode.nodeType === Node.TEXT_NODE
            ? anchorNode.parentElement
            : anchorNode;

        const fullText = (parentEl.innerText || parentEl.textContent || '').trim();
        const sentences = fullText.match(/[^.!?]+[.!?]*/g) || [fullText];
        const target = sentences.find(s => s.includes(selection.toString().trim()));

        return target ? target.trim() : fullText;
    } catch {
        return null;
    }
}

// Tooltip display function — unchanged
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