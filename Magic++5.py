import spacy
import re
from bs4 import BeautifulSoup

# -------------------------------
# 1️⃣ STEP 1: Cleaning (Creates Alice_cleaned.txt)
# -------------------------------
nlp_clean = spacy.load("en_core_web_sm", disable=["parser", "ner", "lemmatizer"])
nlp_clean.add_pipe("sentencizer")

with open("Alice-test.txt", "r", encoding="utf-8") as f:
    raw_text = f.read()
    
# --- TARGETED MODIFICATION ---
# Isolate double quotes and em dashes to ensure perfect segmentation 
# and avoid "glued" blocks like (word—another) or (”whispered)
raw_text = re.sub(r"([\"”—])", r" \1 ", raw_text)

doc_spacy_clean = nlp_clean(raw_text)

cleaned_text = ""
for sent in doc_spacy_clean.sents:
    words = []
    for word in sent:
        w = re.sub(r"[_*]", "", word.text)
        w = w.strip()
        if w:
            words.append(w)
    cleaned_text += " ".join(words) + " "

cleaned_file_path = "Alice_cleaned.txt"
with open(cleaned_file_path, "w", encoding="utf-8") as f:
    f.write(cleaned_text.strip())

print(f"✅ Step 1: {cleaned_file_path} created.")

# -------------------------------
# 2️⃣ STEP 2: POS tagging (Creates Alice_structured.html)
# -------------------------------
nlp_spacy = spacy.load("en_core_web_sm")

with open(cleaned_file_path, "r", encoding="utf-8") as f:
    text_to_tag = f.read()

doc_spacy = nlp_spacy(text_to_tag)

html_output = "<html lang='en'><head><meta charset='UTF-8'></head><body>\n<p>"
for token in doc_spacy:
    if token.text.strip():
        html_output += f'<span class="{token.pos_}">{token.text}</span> '
html_output += "</p>\n</body></html>"

html_file_path = "Alice_structured.html"
with open(html_file_path, "w", encoding="utf-8") as f:
    f.write(html_output)

print(f"✅ Step 2: {html_file_path} created.")

# -------------------------------
# 3️⃣ STEP 3: Typography & Strict Overrides (Creates Alice_FINAL.html)
# -------------------------------
with open(html_file_path, "r", encoding="utf-8") as f:
    html_input = f.read()

soup = BeautifulSoup(html_input, "html.parser")
spans = soup.find_all("span")

FORCE_PUNCT = {
    ".", ",", ";", ":", "!", "?", "(", ")", "[", "]", "{", "}",
    "-", "—", "–", '"', "'", "“", "”", "‘", "’", "«", "»", "…"
}

strict_rules = {
    "sha": (["n't", "n’t"], "AUX", "ADV"), "wo": (["n't", "n’t"], "AUX", "ADV"),
    "ca": (["n't", "n’t"], "AUX", "ADV"), "do": (["n't", "n’t"], "AUX", "ADV"),
    "does": (["n't", "n’t"], "AUX", "ADV"), "did": (["n't", "n’t"], "AUX", "ADV"),
    "would": (["n't", "n’t"], "AUX", "ADV"), "could": (["n't", "n’t"], "AUX", "ADV"),
    "should": (["n't", "n’t"], "AUX", "ADV"), "is": (["n't", "n’t"], "AUX", "ADV"),
    "are": (["n't", "n’t"], "AUX", "ADV"), "was": (["n't", "n’t"], "AUX", "ADV"),
    "were": (["n't", "n’t"], "AUX", "ADV"), "has": (["n't", "n’t"], "AUX", "ADV"),
    "have": (["n't", "n’t"], "AUX", "ADV"), "had": (["n't", "n’t"], "AUX", "ADV"),
    "i": (["'m", "’m", "'ve", "’ve", "'ll", "’ll", "'d", "’d"], "PRON", "AUX"),
    "he": (["'s", "’s"], "PRON", "AUX"), "she": (["'s", "’s"], "PRON", "AUX"),
    "it": (["'s", "’s"], "PRON", "AUX"), "that": (["'s", "’s"], "PRON", "AUX"),
    "there": (["'s", "’s"], "PRON", "AUX"),
    "they": (["'re", "’re", "'ve", "’ve", "'ll", "’ll", "'d", "’d"], "PRON", "AUX"),
    "we": (["'re", "’re", "'ve", "’ve", "'ll", "’ll", "'d", "’d"], "PRON", "AUX"),
    "you": (["'re", "’re", "'ve", "’ve", "'ll", "’ll", "'d", "’d"], "PRON", "AUX")
}

# --- THE FIX IS HERE ---
# We list everything that should NOT have a space before it.
# Added suffixes m, s, re, ve, ll, d, t to glue things like I + ’ + m
no_space_before = {
    ".", ",", ";", ":", "!", ")", "]", "?", "-", "—", "”", "’", "'", 
    "n't", "n’t", "m", "s", "re", "ve", "ll", "d", "t",
    "'m", "'s", "'re", "'ve", "'ll", "'d", "’m", "’s", "’re", "’ve", "’ll", "’d"
}
no_space_after = {"(", "[", "“", "«", "‘", "’", "'", "—", "-"}

formatted_parts = []
for i, span in enumerate(spans):
    tag_class = span["class"][0]
    content = span.get_text().strip()
    clean_content = content.lower()

    if content in FORCE_PUNCT:
        tag_class = "PUNCT"

    if clean_content in strict_rules:
        if i + 1 < len(spans):
            next_span = spans[i+1]
            next_content = next_span.get_text().strip().lower()
            allowed_followers, first_tag, second_tag = strict_rules[clean_content]
            if next_content in allowed_followers:
                tag_class = first_tag
                next_span['force_tag'] = second_tag

    if span.has_attr('force_tag'):
        tag_class = span['force_tag']

    # --- SPACING LOGIC ---
    space = " "
    if i + 1 < len(spans):
        next_val = spans[i+1].get_text().strip()
        next_val_lower = next_val.lower()
        
        # 1. Glues suffixes and punctuation
        if (next_val in no_space_before or 
            content in no_space_after or
            next_val_lower in ["n't", "n’t"]):
            space = ""
        # 2. Forced space for dialogue (” cried)
        elif content in ["”", "»", "!", "?", ".", ";"] and next_val and next_val[0].isalnum():
            space = " "

    if i == len(spans) - 1: space = ""
    formatted_parts.append(f'<span class="{tag_class}">{content}</span>{space}')

with open("Alice_FINAL.html", "w", encoding="utf-8") as f:
    f.write(f"<html><head><meta charset='UTF-8'></head><body><p>{''.join(formatted_parts)}</p></body></html>")

print("✅ Step 3: Alice_FINAL.html created (I'm issue fixed).")