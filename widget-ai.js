// === WIDGET AI SONAR - EVENTI PRINCIPALI ===
document.addEventListener('DOMContentLoaded', function() {

  document.getElementById('sonar-fab').onclick = function() {
    document.getElementById('sonar-chat').style.display = 'block';
    this.style.display = 'none';
    trackWidgetEvent('widget_opened');
  };

  document.querySelector('#sonar-chat .close-chat').onclick = function() {
    document.getElementById('sonar-chat').style.display = 'none';
    document.getElementById('sonar-fab').style.display = 'flex';
    trackWidgetEvent('widget_closed');
  };

  async function askSonar(model = "sonar-pro") {
    const question = document.getElementById('sonar-q').value.trim();
    if (!question) return;
    trackWidgetEvent('message_sent', { length: question.length });
    document.getElementById('sonar-reply').innerText = '⏳ The AI is responding... Please wait.';

    // Ricerca correlata: wine bottle -> wine cooler
    let relatedLink = '';
    let relatedPhrase = '';
    const normalizedQuestion = question.trim().toLowerCase();

    if(normalizedQuestion.includes('wine bottle')) {
      relatedLink = '<a href="https://errandboy.store/products/search?keyword=wine%20cooler" target="_blank" style="color:#1a0dab; text-decoration:underline;">Vedi tutti i wine cooler</a>';
      relatedPhrase = 'Stai forse cercando un wine cooler? Questo è il link dei wine cooler:';
    }

    const searchUrl = "https://errandboy.store/products/search?keyword=" + encodeURIComponent(question);

    const customPrompt = `
You are Errand Boy Malta's official shopping assistant.
Never include any references, citations, or brackets like [1], [2], etc.
If a user searches for "wine bottle" or another product that is NOT sold on our shop, but we offer a related item (for example: "wine cooler"), do NOT describe the wine bottle—just respond:
"Stai forse cercando un wine cooler? Questo è il link dei wine cooler:"
and provide this clickable link:
<a href="https://errandboy.store/products/search?keyword=wine%20cooler" target="_blank" style="color:#1a0dab; text-decoration:underline;">Vedi tutti i wine cooler</a>
If the user searches for a product or category you actually have, give a very brief description (no more than 2 sentences) and always show the product link for their query:
<a href="${searchUrl}" target="_blank" style="color:#1a0dab; text-decoration:underline;">Vedi tutti i prodotti per "${question}"</a>
Never write long technical paragraphs about products the shop does NOT sell; just recommend related items from Errand Boy Malta, with a concise, shop-focused style.
If the search is unrelated, reply: "Sorry, I can only help with Errand Boy Malta products and info."
If there are no matching or related products, reply politely and invite the user to contact via <a href="https://wa.me/35677082474" target="_blank" style="color:#1a0dab; text-decoration:underline;">WhatsApp</a> or <a href="tel:+35677082474" style="color:#1a0dab; text-decoration:underline;">+35677082474</a>.
Never say or suggest "use the search icon"; always offer the clickable link.
`;

    try {
      var res = await fetch("https://restless-salad-b1bf.wild-darkness-f8cd.workers.dev/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: "system", content: customPrompt },
            { role: "user", content: question }
          ]
        })
      });

      if (!res.ok) {
        if (model === 'sonar-pro') return askSonar('sonar');
        throw new Error('API error: ' + res.status);
      }
      var data = await res.json();

      // VERSIONE COMPATIBILE (NO '?.' MODERNO)
      var reply = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content)
        ? data.choices[0].message.content
        : 'No reply or error.';

      // Se domanda "wine bottle", forziamo output sintetico e correlato
      if (normalizedQuestion.includes('wine bottle')) {
        document.getElementById('sonar-reply').innerHTML = relatedPhrase + "<br>" + relatedLink;
      } else {
        document.getElementById('sonar-reply').innerHTML = reply;
      }

      var chatBox = document.getElementById('sonar-chat');
      if (chatBox) chatBox.scrollTop = chatBox.scrollHeight;

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

  // === TRACKING EVENTI WIDGET AI SONAR ===
  function trackWidgetEvent(eventName, eventData) {
    eventData = eventData || {};
    if (typeof window.trackWidgetOpen === 'function' ||
        typeof window.trackWidgetMessage === 'function' ||
        typeof window.trackWidgetClose === 'function') {
      switch(eventName) {
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

});
