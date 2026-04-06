/* ══════════════════════════════════════════════════════════════════════
   TRANSLATION SYSTEM — SECURE MODE (NETLIFY)
   
   Listens for text selections on any page. Sends the selected text to a
   Netlify Function which handles the API call server-side. Single-word
   selections automatically include their surrounding sentence so the
   model returns a contextually accurate translation, not a dictionary
   guess.
══════════════════════════════════════════════════════════════════════ */

console.log("✅ Translation system ready — Netlify secure mode active.");

/* ── MAIN SELECTION LISTENER ───────────────────────────────────────────
   Fires on every mouseup. Checks whether the user has selected text,
   then decides whether to request a simple translation (multiple words)
   or a context-aware one (single word).
──────────────────────────────────────────────────────────────────────── */
document.addEventListener('mouseup', async (e) => {
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();
    const overlay = document.getElementById('translation-overlay');

    // If nothing is selected and the user clicked outside the tooltip, hide it
    if (selectedText.length === 0) {
        if (overlay && !overlay.contains(e.target)) {
            overlay.style.display = 'none';
        }
        return;
    }

    // Ignore accidental micro-selections (single stray characters)
    if (selectedText.length <= 1) return;

    console.log("📌 Selection captured:", selectedText);

    /* ── PAYLOAD BUILDER ─────────────────────────────────────────────
       For a single word, we extract the full surrounding sentence and
       send it alongside the word as separate fields. The Netlify Function
       uses both to build a context-aware prompt for the model, so the
       translation reflects what the word actually means in that sentence
       rather than its generic dictionary definition.

       For multi-word selections, we just send the text as-is since the
       context is already self-contained within the selection itself.
    ──────────────────────────────────────────────────────────────────── */
    const isSingleWord = !selectedText.includes(' ');
    let payload;

    if (isSingleWord) {
        const surroundingSentence = getSurroundingSentence(selection);
        console.log("🔍 Single word — context sentence extracted:", surroundingSentence);

        payload = {
            isSingleWord: true,
            word: selectedText,
            context: surroundingSentence || selectedText  // fallback if extraction fails
        };
    } else {
        payload = {
            isSingleWord: false,
            text: selectedText
        };
    }

    // Show a loading state immediately so the user knows something is happening
    showTranslationTooltip(selection, "Translating...");

    /* ── SERVER CALL ─────────────────────────────────────────────────
       All translation requests go through our Netlify Function. We never
       call the translation API directly from the browser — this keeps API
       keys off the client and lets the server shape the prompt before it
       reaches the model.
    ──────────────────────────────────────────────────────────────────── */
    try {
        const response = await fetch("/.netlify/functions/translate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`Server responded with status ${response.status}`);
        }

        const result = await response.json();
        console.log("📦 Server response received:", result);

        /* ── RESPONSE HANDLER ──────────────────────────────────────
           We support two response shapes:
           - { translation: "..." }  → our own Netlify wrapper format
           - [{ translation_text: "..." }]  → raw Hugging Face format

           In both cases we display the clean translated string directly.
           No markers, no extra formatting — just the translation.
        ────────────────────────────────────────────────────────────── */
        if (result.translation) {
            showTranslationTooltip(selection, result.translation);

        } else if (Array.isArray(result) && result[0]?.translation_text) {
            showTranslationTooltip(selection, result[0].translation_text);

        } else if (result.error) {
            console.warn("⚠️ Server returned an error:", result.error);
            showTranslationTooltip(selection, "Translation unavailable — please try again.");

        } else {
            console.warn("⚠️ Unrecognised response shape:", result);
            showTranslationTooltip(selection, "Unexpected response from server.");
        }

    } catch (err) {
        /* ── NETWORK / RUNTIME FAILURE ───────────────────────────────
           Catches both failed fetches (offline, timeout, DNS) and
           unexpected runtime errors. We log the full error for debugging
           and show a clean human-readable message in the tooltip instead
           of exposing a raw exception to the user.
        ────────────────────────────────────────────────────────────── */
        console.error("❌ Request failed — network or server issue:", err);
        showTranslationTooltip(selection, "Connection error — please try again.");
    }
});

/* ── getSurroundingSentence ────────────────────────────────────────────
   Walks up the DOM from the selection's anchor node to find the nearest
   readable text block (paragraph, div, heading, etc.), then isolates the
   sentence that contains the selected word.

   Sentence boundaries are detected using . ! ? punctuation. If no clean
   boundary is found, the entire text block is returned as a fallback so
   the model always has some context to work with.
──────────────────────────────────────────────────────────────────────── */
function getSurroundingSentence(selection) {
    try {
        const anchorNode = selection.anchorNode;

        // If we're inside a raw text node, step up to its parent element
        const parentEl = anchorNode.nodeType === Node.TEXT_NODE
            ? anchorNode.parentElement
            : anchorNode;

        const fullText = (parentEl.innerText || parentEl.textContent || '').trim();
        if (!fullText) return null;

        const selectedWord = selection.toString().trim();

        // Split the block into sentences and return the one containing our word
        const sentences = fullText.match(/[^.!?]+[.!?]*/g) || [fullText];
        const targetSentence = sentences.find(s => s.includes(selectedWord));

        return targetSentence ? targetSentence.trim() : fullText;

    } catch (err) {
        console.warn("⚠️ Could not extract surrounding sentence:", err);
        return null;
    }
}

/* ── showTranslationTooltip ───────────────────────────────────────────
   Creates the tooltip element once on first call and reuses it on every
   subsequent call to avoid polluting the DOM with duplicate nodes.

   Positions the tooltip just below the selected text by reading the
   selection's bounding rectangle and accounting for the current scroll
   offset, so it stays anchored correctly even on long scrollable pages.
──────────────────────────────────────────────────────────────────────── */
function showTranslationTooltip(selection, text) {
    let display = document.getElementById('translation-overlay');

    // Create the tooltip element if it doesn't exist yet
    if (!display) {
        display = document.createElement('div');
        display.id = 'translation-overlay';
        document.body.appendChild(display);
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    display.textContent = text;
    display.style.display = 'block';

    // Pin the tooltip directly below the highlighted text
    display.style.left = (rect.left + window.scrollX) + "px";
    display.style.top  = (rect.bottom + window.scrollY + 10) + "px";
}