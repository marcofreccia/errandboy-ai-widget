// === WIDGET AI SONAR MULTILINGUA - RISPOSTA COMPLETA E PROFESSIONALE ===

// Evento apertura
document.getElementById('sonar-fab').onclick = function() {
  document.getElementById('sonar-chat').style.display = 'block';
  this.style.display = 'none';
  trackWidgetEvent('widget_opened');
};

// Evento chiusura
document.querySelector('#sonar-chat .close-chat').onclick = function() {
  document.getElementById('sonar-chat').style.display = 'none';
  document.getElementById('sonar-fab').style.display = 'flex';
  trackWidgetEvent('widget_closed');
};

// === FUNZIONE AI PRINCIPALE ===
async function askSonar(model = "sonar-pro") {
  const question = document.getElementById('sonar-q').value.trim();
  if (!question) return;
  document.getElementById('sonar-reply').innerText = '⏳ Loading...';

  // Ricerca prodotti su Ecwid
  const storeId = '29517085';
  const token = 'public_AzqkPnjmEbKiDr3bSWKeC1YrrNh1BfBY';
  const apiURL = `https://app.ecwid.com/api/v3/${storeId}/products?keyword=${encodeURIComponent(question)}&token=${token}`;
  
  try {
    const res = await fetch(apiURL, { method: 'GET' });
    const data = await res.json();

    // UN solo prodotto: link diretto + risposta AI + info extra se vuoi
    if (data.total === 1) {
      const item = data.items[0];
      const productLink = item.url;
      const name = item.name;
      const prompt = `
Always answer in the same language as the user's question.
You are a professional shopping assistant for Errand Boy Malta.
You found exactly one matching product for the user's search.
Reply with: a clear confirmation, the clickable product link: <a href="${productLink}" target="_blank">${name}</a>, and, if helpful, online info about product compatibility or usage.
If you find trusted info online, append it after the link, but keep the message synthetic.
      `;
      return await callSonarAndShow(question, prompt);
    }

    // PIÙ prodotti: link search/categoria
    if (data.total > 1) {
      const searchUrl = `https://errandboy.store/search?q=${encodeURIComponent(question)}`;
      const prompt = `
Always answer in the same language as the user's question.
You are a professional shopping assistant for Errand Boy Malta.
There are multiple products matching the user's search.
Reply ONLY with: a concise confirmation, and a clickable link to see all results: <a href="${searchUrl}" target="_blank">See all results</a>.
If needed, encourage the user to use the search icon for more precise find.
      `;
      return await callSonarAndShow(question, prompt);
    }

    // NESSUN prodotto: invito AI a consigliare contatto WhatsApp/SMS
    const prompt = `
Always answer ONLY in the same language as the user's question.
You are a professional shopping assistant for Errand Boy Malta.
No products on our shop match the user's request.
Kindly inform them: 
- no product was found,
- suggest they try with another search,
- and invite them to contact support for quick help via WhatsApp or SMS.
Insert this phrase in your answer (adapting it to the user's language):
'Please contact us via WhatsApp or SMS at <a href="https://wa.me/35677082474" target="_blank">+35677082474</a> for fast support!'
      `;
    return await callSonarAndShow(question, prompt);
  
  } catch (e) {
    document.getElementById('sonar-reply').innerText = 'Chat temporarily unavailable. Try later.';
  }
}

// FUNZIONE: chiamata Sonar AI e risposta con HTML (link attivi)
async function callSonarAndShow(userQuestion, contextPrompt) {
  document.getElementById('sonar-reply').innerText = '⏳ AI is replying...';
  try {
    const res = await fetch("https://restless-salad-b1bf.wild-darkness-f8cd.workers.dev/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "sonar-pro",
        messages: [
          { role: "system", content: contextPrompt },
          { role: "user", content: userQuestion }
        ]
      })
    });
    if (res.ok) {
      const data = await res.json();
      let reply = data.choices?.[0]?.message?.content || '';
      document.getElementById('sonar-reply').innerHTML = reply;
      const chatBox = document.getElementById('sonar-chat');
      if (chatBox) chatBox.scrollTop = chatBox.scrollHeight;
      return;
    }
    throw new Error('AI error');
  } catch (e) {
    document.getElementById('sonar-reply').innerText = 'Chat temporarily unavailable. Try later.';
  }
}

document.getElementById('sonar-send-btn').onclick = function() {
  askSonar();
};

document.getElementById('sonar-q').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') askSonar();
});

// === TRACKING EVENTI WIDGET ===
function trackWidgetEvent(eventName, eventData = {}) {
  if (
    typeof window.trackWidgetOpen === 'function' ||
    typeof window.trackWidgetMessage === 'function' ||
    typeof window.trackWidgetClose === 'function'
  ) {
    switch (eventName) {
      case 'widget_opened':
        if (window.trackWidgetOpen) window.trackWidgetOpen();
        break;
      case 'message_sent':
        if (window.trackWidgetMessage) window.trackWidgetMessage(eventData.length || 0);
        break;
      case 'widget_closed':
        if (window.trackWidgetClose) window.trackWidgetClose();
        break;
    }
  }
  console.log('🎯 Widget Event:', eventName, eventData);
}
