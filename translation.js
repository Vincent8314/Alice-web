/* ══════════════════════════════════════════════════════════════
   TRANSLATION SYSTEM — SECURE MODE (NETLIFY)
   Intercepts text selections and returns context-aware translations
   powered by a server-side Netlify Function.
   ══════════════════════════════════════════════════════════════ */

console.log("✅ Translation system ready — Netlify secure mode active.");

document.addEventListener('mouseup', async (e) => {
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();

    // Dismiss the tooltip when the user clicks away or clears the selection
    const overlay = document.getElementById('translation-overlay');
    if (selectedText.length === 0) {
        if (overlay && !overlay.contains(e.target)) {
            overlay.style.display = 'none';
        }
        return;
    }

    // Only process selections of at least 2 characters to avoid accidental triggers
    if (selectedText.length > 1) {
        console.log("📌 Selection captured:", selectedText);

        /* ── CONTEXT-AWARE SINGLE WORD LOGIC ──────────────────────────
           If the user selects or clicks a single word, we don't translate
           it in isolation. Instead, we extract the full sentence it belongs
           to and send both to the server. This lets the model return the
           exact meaning of that word as used in context — not a dictionary
           guess. The selected word is flagged with [[ ]] so the server
           knows which word to focus on.
        ────────────────────────────────────────────────────────────── */
        const isSingleWord = !selectedText.includes(' ');
        let textToSend = selectedText;

        if (isSingleWord) {
            const fullSentence = getSurroundingSentence(selection);
            if (fullSentence) {
                // Wrap the target word so the model knows what to focus on
                const markedSentence = fullSentence.replace(
                    new RegExp(`\\b${selectedText}\\b`),
                    `[[${selectedText}]]`
                );
                textToSend = markedSentence;
                console.log("🔍 Single word detected — sending full sentence context:", textToSend);
            }
        }

        showTranslationTooltip(selection, "Translating...");

        try {
            /* ── SERVER CALL ───────────────────────────────────────────
               We never call the translation API directly from the browser.
               All requests are routed through our Netlify Function, which
               keeps API keys server-side and lets us shape the prompt
               before it reaches the model.
            ────────────────────────────────────────────────────────── */
            const response = await fetch("/.netlify/functions/translate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    text: textToSend,
                    isSingleWord: isSingleWord   // lets the server tailor its prompt
                })
            });

            const result = await response.json();
            console.log("📦 Server response received:", result);

            /* ── RESPONSE HANDLING ─────────────────────────────────────
               Hugging Face models typically return an array of objects.
               We surface the first result, fall back gracefully on errors,
               and always show something useful to the user.
            ────────────────────────────────────────────────────────── */
            if (Array.isArray(result) && result[0]?.translation_text) {
                showTranslationTooltip(selection, result[0].translation_text);
            } else if (result.translation) {
                // Friendly format returned by a custom Netlify Function wrapper
                showTranslationTooltip(selection, result.translation);
            } else if (result.error) {
                console.warn("⚠️ Server returned an error:", result.error);
                showTranslationTooltip(selection, "Almost there — retrying soon...");
            } else {
                showTranslationTooltip(selection, "Unexpected response format.");
            }

        } catch (err) {
            /* ── NETWORK FAILURE ───────────────────────────────────────
               Catch block fires if the fetch itself fails (offline, DNS,
               timeout). We log the full error for debugging and show a
               clean message to the user instead of a raw exception.
            ────────────────────────────────────────────────────────── */
            console.error("❌ Fetch failed — possible network or server issue:", err);
            showTranslationTooltip(selection, "Connection error — please try again.");
        }
    }
});

/* ── getSurroundingSentence ────────────────────────────────────────────
   Walks up the DOM from the selection anchor to find the nearest block
   of text (paragraph, div, heading, etc.), then extracts the sentence
   that contains the selected word. Falls back to the full block text
   if no clean sentence boundary is found.
──────────────────────────────────────────────────────────────────────── */
function getSurroundingSentence(selection) {
    try {
        const anchorNode = selection.anchorNode;

        // Climb to the nearest element node if we're inside a text node
        const parentEl = anchorNode.nodeType === Node.TEXT_NODE
            ? anchorNode.parentElement
            : anchorNode;

        const fullText = parentEl.innerText || parentEl.textContent || '';

        // Split into sentences on . ! ? and find the one containing our word
        const sentences = fullText.match(/[^.!?]+[.!?]*/g) || [fullText];
        const selectedWord = selection.toString().trim();
        const targetSentence = sentences.find(s => s.includes(selectedWord));

        return targetSentence ? targetSentence.trim() : fullText.trim();
    } catch (err) {
        console.warn("⚠️ Could not extract surrounding sentence:", err);
        return null;
    }
}

/* ── showTranslationTooltip ───────────────────────────────────────────
   Creates the tooltip element on first call and reuses it on subsequent
   ones. Positions it just below the selected text using the selection's
   bounding rectangle, accounting for page scroll offset.
──────────────────────────────────────────────────────────────────────── */
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

    // Anchor the tooltip directly below the highlighted text
    display.style.left = (rect.left + window.scrollX) + "px";
    display.style.top  = (rect.bottom + window.scrollY + 10) + "px";
}