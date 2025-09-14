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

    const customPrompt = `
You are Errand Boy Malta's shopping assistant.
Your main goal is to help customers find products from our online shop as efficiently as possible.
When the customer asks for any item in ANY language (for example Urdu, Italian, French...), you must:
- Always TRANSLATE the customer's product keyword(s) into the closest English category or product name as used on our website (example: "tostapane" or "محافظ گرمی" = "toaster").
- ALWAYS generate the product search link using the ENGLISH keyword, even if the question was asked in another language.
- Present your answer BRIEFLY in the language of the question, but the blue clickable link must search for the English keyword.
For example, if the user asks [translate:tostapane], answer (in Italian): "Ecco i nostri toaster:" with this link: <a href="https://errandboy.store/products/search?keyword=toaster" target="_blank" style="color:#1a0dab; text-decoration:underline;">See all products for "toaster"</a>
If there are no matching products in the shop, say (in the user's language): "Sorry, we do not have this product. Please try the search icon above, browse categories, or contact us at WhatsApp +35677082474"
Never explain technical details, never use bulleted or numbered lists, never translate the customer’s keywords in the answer—just provide the correct English link and a brief phrase.
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

      var reply = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content)
        ? data.choices[0].message.content
        : 'No reply or error.';

      document.getElementById('sonar-reply').innerHTML = reply;

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
