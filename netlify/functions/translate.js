exports.handler = async (event) => {
  try {
    const { text, word, context } = JSON.parse(event.body);
    const apiToken = process.env.HF_TOKEN;

    // If a single word was clicked, translate it in context — otherwise translate the selection as-is
    const inputText = word && context
      ? `Translate the word "${word}" as used in this sentence: "${context}"`
      : text;

    const response = await fetch("https://router.huggingface.co/hf-inference/models/Helsinki-NLP/opus-mt-en-fr", {
      headers: { 
        "Authorization": `Bearer ${apiToken}`,
        "Content-Type": "application/json" 
      },
      method: "POST",
      body: JSON.stringify({ inputs: inputText }),
    });

    const result = await response.json();
    
    return {
      statusCode: 200,
      body: JSON.stringify(result),
    };
  } catch (error) {
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: "Erreur serveur", message: error.message }) 
    };
  }
};