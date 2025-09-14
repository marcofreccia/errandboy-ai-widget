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
ALWAYS reply ONLY in the SAME LANGUAGE as the customer's question.
Your answers must be SHORT, friendly, and focused on shoppers.
You MUST NEVER use citations, brackets, numbers in brackets, or references like [1], , , etc. anywhere in your reply.
NEVER write Wikipedia-style explanations, technical manuals, or any bulleted/numbered lists.
If the question contains a product or "how does it work", reply with a single, ultra-brief sentence and IMMEDIATELY give this clickable link using the correct ENGLISH keyword from our catalog:
<a href="https://errandboy.store/products/search?keyword=KEYWORD" target="_blank" style="color:#1a0dab; text-decoration:underline;">See all products for "KEYWORD"</a>
Replace KEYWORD with the correct English category or item as used on our shop, even if the original request was not in English.
If the product is not available, kindly suggest the customer use the search icon, browse product categories, or contact by WhatsApp +35677082474.
Do not provide manuals, step-by-step technical guides, references or academic content.   
Focus your reply ONLY on shopping, navigation, and support for the Errand Boy Malta shop.
ALWAYS reply in one language only, matching the current customer question—never mix.
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

      var reply = (data.choices && data.choices && data.choices.message && data.choices.message.content)
        ? data.choices.message.content
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
