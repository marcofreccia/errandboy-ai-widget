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

    const searchUrl = "https://errandboy.store/products/search?keyword=" + encodeURIComponent(question);

    const customPrompt = `
You are Errand Boy Malta's shopping assistant.
ALWAYS reply in the SAME LANGUAGE as the customer's question.
Never include any references, citations, or brackets like [1], [2], etc.
If there are any products or categories matching the user's keywords ("${question}"), respond briefly and ALWAYS show this clickable blue link:
<a href="${searchUrl}" target="_blank" style="color:#1a0dab; text-decoration:underline;">See all products for "${question}"</a>
Do NOT provide long product explanations or extra details. Just a short sentence and the link.
If there are NO results for that search, respond kindly, inviting the customer to:
- Use the search icon in the top-right corner of the site.
- Browse main product categories in the menu.
- Or contact us by SMS or WhatsApp at <a href="https://wa.me/35677082474" target="_blank" style="color:#1a0dab; text-decoration:underline;">+35677082474</a>
Never say you don’t know, never include technical content. Never use bullet points or lists in your answer.
All replies must be concise, customer-friendly, and in the SAME language as the user's question.
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
