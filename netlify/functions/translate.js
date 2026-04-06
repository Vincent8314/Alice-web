exports.handler = async (event) => {
  try {
    const { text } = JSON.parse(event.body);
    const apiToken = process.env.HF_TOKEN; // Netlify ira chercher ton token tout seul ici


    const response = await fetch("https://router.huggingface.co/hf-inference/models/Helsinki-NLP/opus-mt-en-fr", {
      headers: { 
        "Authorization": `Bearer ${apiToken}`,
        "Content-Type": "application/json" 
      },
      method: "POST",
      body: JSON.stringify({ inputs: text }),
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