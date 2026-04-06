/* ══════════════════════════════════════════════
   SYSTEME DE TRADUCTION - MODE SECURISE (NETLIFY)
   ══════════════════════════════════════════════ */

console.log("Système de traduction via Netlify Functions prêt.");

document.addEventListener('mouseup', async (e) => {
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();

    // Cache la bulle si on clique ailleurs ou si la sélection est vide
    const overlay = document.getElementById('translation-overlay');
    if (selectedText.length === 0) {
        if (overlay && !overlay.contains(e.target)) {
            overlay.style.display = 'none';
        }
        return;
    }

    // On lance la traduction si le texte est assez long
    if (selectedText.length > 5) {
        console.log("Sélection détectée :", selectedText);
        showTranslationTooltip(selection, "Translation...");
        
        try {
            // APPEL PRO : On contacte TA fonction Netlify, pas Hugging Face en direct
            const response = await fetch("/.netlify/functions/translate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: selectedText })
            });

            const result = await response.json();
            console.log("Retour du serveur Netlify :", result);

            // Gestion de la réponse (Hugging Face renvoie souvent un tableau)
            if (Array.isArray(result) && result[0].translation_text) {
                showTranslationTooltip(selection, result[0].translation_text);
            } else if (result.error) {
                showTranslationTooltip(selection, "Almost there...");
            } else {
                showTranslationTooltip(selection, "Erreur format réponse.");
            }
        } catch (err) {
            console.error("Erreur Fetch :", err);
            showTranslationTooltip(selection, "Erreur de connexion serveur.");
        }
    }
});

// Ta fonction d'affichage (Tooltip) reste identique mais nettoyée
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