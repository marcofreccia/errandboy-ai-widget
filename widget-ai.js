document.getElementById('sonar-fab').onclick = function() {
  document.getElementById('sonar-chat').style.display = 'block';
  this.style.display = 'none';
};
document.querySelector('#sonar-chat .close-chat').onclick = function() {
  document.getElementById('sonar-chat').style.display = 'none';
  document.getElementById('sonar-fab').style.display = 'flex';
};

async function askSonar(model = "sonar-pro") {
  const question = document.getElementById('sonar-q').value.trim();
  if (!question) return;
  document.getElementById('sonar-reply').innerText = '⏳ The AI is responding... Please wait.';

  const prompt = `
You are Errand Boy Malta's official shopping assistant.
Always respond in the same language as the customer's question using "we", "our", "us".
If the customer mentions a specific product name, do NOT provide a link; instead, politely say:
"Please use the search icon located at the top right of the page to type your product name."
For questions about how a product works, or about our store location, opening hours, and contact info, answer directly and clearly.
Do not provide links that open in new windows.
Answer ONLY questions related to Errand Boy Malta products and services.
If the question is outside this scope, politely say: "Sorry, I can only help you with Errand Boy Malta products and info."
Never use references or citations like [1],[1].
`;

  const userPrompt = `${prompt}\nUser question: ${question}`;

  try {
    const res = await fetch("https://restless-salad-b1bf.wild-darkness-f8cd.workers.dev/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: model,
        messages: [{ role: "user", content: userPrompt }]
      })
    });
    if (!res.ok) {
      if (model === 'sonar-pro') return askSonar('sonar');
      throw new Error('API error: ' + res.status);
    }
    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content || 'No reply or error.';
    document.getElementById('sonar-reply').innerText = reply;

    // Scroll chat in basso per vedere nuova risposta e input
    const chatBox = document.getElementById('sonar-chat');
    chatBox.scrollTop = chatBox.scrollHeight;
  } catch (e) {
    document.getElementById('sonar-reply').innerText = 'Chat temporarily unavailable (' + e.message + '). Try later.';
  }
}

document.getElementById('sonar-send-btn').onclick = function() {
  askSonar();
};
document.getElementById('sonar-q').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') askSonar();
});

