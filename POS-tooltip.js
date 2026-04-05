 /* ══════════════════════════════════════════════
       POS TOOLTIP — single floating div, zero reflow
    ══════════════════════════════════════════════ */

    // Maps each CSS class name to a human readable label shown in the tooltip
    const posLabels = {
      NOUN: 'Noun',
      PROPN: 'Proper Noun',
      VERB: 'Verb',
      AUX: 'Auxiliary Verb',
      ADJ: 'Adjective',
      ADV: 'Adverb',
      PRON: 'Pronoun',
      DET: 'Determiner',
      ADP: 'Adposition',
      CCONJ: 'Coord. Conjunction',
      SCONJ: 'Sub. Conjunction',
      PART: 'Particle',
      INTJ: 'Interjection',
      NUM: 'Number',
      PUNCT: '',        // No tooltip for punctuation
      SYM: 'Symbol',
      X: 'Other / Unknown',
      LINK: 'link',
    };

    const tooltip = document.getElementById('pos-tooltip');
    const posClasses = Object.keys(posLabels);

    document.addEventListener('mouseover', e => {
      // Find the closest parent span in case the mouse is on a child element
      const span = e.target.closest('span');
      if (!span) { tooltip.style.display = 'none'; return; }

      // Check if this span has one of our POS classes
      const cls = posClasses.find(c => span.classList.contains(c));
      if (!cls) { tooltip.style.display = 'none'; return; }

      // Update the tooltip text and make it visible
      tooltip.textContent = posLabels[cls];
      tooltip.style.display = 'block';

      // Position the tooltip centered above the hovered word
      // getBoundingClientRect gives us the word's position relative to the viewport
      const rect = span.getBoundingClientRect();
      const tipW = tooltip.offsetWidth;
      const centeredLeft = rect.left + rect.width / 2 - tipW / 2;
      // Math.max(4) prevents the tooltip from going off the left edge of the screen
      tooltip.style.left = Math.max(4, centeredLeft) + 'px';
      tooltip.style.top = (rect.top - 13) + 'px';
    });

    document.addEventListener('mouseout', e => {
      const span = e.target.closest('span');
      if (!span) return;
      // Hide the tooltip when the mouse leaves a POS span
      const cls = posClasses.find(c => span.classList.contains(c));
      if (cls) tooltip.style.display = 'none';
    });