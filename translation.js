  /* ══════════════════════════════════════════════
   SYSTEME DE TRADUCTION - DEBUG MODE
   ══════════════════════════════════════════════ */

// Ton token (à garder secret après test)

const MODEL_ID = "facebook/mbart-large-50-many-to-many-mmt";

console.log("Système de traduction chargé et prêt.");

document.addEventListener('mouseup', async (e) => {
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();

    // Vérification dans la console dès que tu relâches la souris
    if (selectedText.length > 0) {
        console.log("Sélection détectée :", selectedText);
    }

    if (selectedText.length > 5) {
        showTranslationTooltip(selection, "Réveil de l'IA...");
        
        try {
            const response = await fetch(
                `https://api-inference.huggingface.co/models/${MODEL_ID}`,
                {
                    headers: {
                        Authorization: `Bearer ${HF_TOKEN}`,
                        "Content-Type": "application/json"
                    },
                    method: "POST",
                    body: JSON.stringify({
                        inputs: selectedText,
                        parameters: { src_lang: "en_XX", tgt_lang: "fr_XX" },
                        options: { wait_for_model: true }
                    }),
                }
            );

            const result = await response.json();
            console.log("Retour API :", result);

            if (Array.isArray(result) && result[0].translation_text) {
                showTranslationTooltip(selection, result[0].translation_text);
            } else if (result.error) {
                showTranslationTooltip(selection, "L'IA charge... réessayez.");
            }
        } catch (err) {
            console.error("Erreur Fetch :", err);
            showTranslationTooltip(selection, "Erreur de connexion.");
        }
    } else {
        // Cache la bulle si on clique ailleurs
        const overlay = document.getElementById('translation-overlay');
        if (overlay && !overlay.contains(e.target)) {
            overlay.style.display = 'none';
        }
    }
});

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
    
    // Positionnement précis
    display.style.left = (rect.left + window.scrollX) + "px";
    display.style.top = (rect.bottom + window.scrollY + 10) + "px";
}