Voici le contenu intégral et structuré pour ton fichier `GUIDE.md`. Il est conçu comme une "carte grise" de ton projet, de la philosophie à la réalisation technique.

---

# 📜 GUIDE PROJET : Système de Lecture "Souveraine"

> **Philosophie :** Souveraineté de retrait. L'outil doit être invisible et n'intervenir que sur demande (survol ou sélection). Pas de distraction, juste l'accès direct au sens par paliers.

---

## 1. L'État des Lieux (Ce que nous avons)

### 🏗️ L'Architecture Actuelle
* **Structure HTML5 :** Un site statique propre avec une navigation par sidebar (`#sidebar`) et un contenu principal (`#content`).
* **Design Système :** Une palette de couleurs "Gemmes" (Péridot, Quartz Rose, etc.) mappée sur les classes grammaticales (POS).
* **Moteur de Rendu :** Un script JavaScript natif ("Vanilla JS") qui gère l'affichage d'une bulle (`#pos-tooltip`) au survol.

### 🛠️ La "Stack" Installée
* **Langage :** Python 3.12.
* **NLP (Natural Language Processing) :** `spaCy 3.8` (pour la structure) et `Transformers 5.4` (pour l'intelligence sémantique).
* **Automatisation :** Un script de base (`Magic++7.py`) capable de segmenter le texte brut en `<span>` catégorisés.

---

## 2. Ce qui a été accompli (Les fondations)

* **Nettoyage du Flux :** Élimination des dépendances lourdes (type Popper.js) au profit d'un positionnement JS calculé (`getBoundingClientRect`).
* **Validation des Piliers :** Confirmation de la méthode "Pré-taggage" : le sens doit être injecté *avant* la lecture pour garantir le flux.
* **Souveraineté des Données :** Décision de traiter la grammaire et le vocabulaire en local (Python) et de ne solliciter les API externes (DeepL/Google) que pour les phrases complexes.

---

## 3. La Trajectoire (Où nous allons)

### Étape A : Mutation du Script de Taggage (`Magic++7.py`)
* **Objectif :** Passer de la "forme" (Grammaire) au "fond" (Sens).
* **Action :** Le script ne doit plus seulement mettre une couleur, il doit injecter l'attribut `data-val-context`.
* **Exemple :** Transformer `<span class="ADJ">tired</span>` en `<span class="ADJ" data-val-context="Fatigué(e)">tired</span>`.

### Étape B : L'Interprétation Globale (Le Snap-to-Point)
* **Objectif :** Garantir une traduction de qualité lors d'une sélection manuelle.
* **Action :** Coder une fonction JS qui "aimante" la sélection de l'utilisateur jusqu'au point final de la phrase pour éviter de traduire des segments tronqués.

### Étape C : L'Interface de Contrôle (Onboarding)
* **Objectif :** Éduquer sans polluer l'espace visuel.
* **Action :** Intégrer une zone vidéo (50s) expliquant les deux gestes :
    1.  **Survol :** Accès au sens immédiat du mot.
    2.  **Sélection :** Accès à l'interprétation de la pensée complète.

---

## 4. Maintenance & Commandes Utiles

* **Vérifier la santé du système :**
    ```powershell
    python --version
    python -m spacy info
    python -c "import transformers; print(transformers.__version__)"
    ```
* **Lancer la transformation d'un texte :**
    ```powershell
    python Magic++7.py
    ```

---
**Note pour la session suivante :** Priorité à la modification de la fonction de génération HTML dans le script Python pour inclure le dictionnaire de sens contextuel.