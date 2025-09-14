// === WIDGET SONAR AI MULTILINGUA — LINK SEARCH SEMPRE PRESENTE ===

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
  document.getElementById('sonar-reply').innerText = '⏳ Loading...';

  // Chiamata API prodotti Ecwid
  const storeId = '29517085';
  const token = 'public_AzqkPnjmEbKiDr3bSWKeC1YrrNh1BfBY';
  const apiURL = `https://app.ecwid.com/api/v3/${storeId}/products?keyword=${encodeURIComponent(question)}&token=${token}`;
  
  let replyType = "";
  let productLink = "";
  let productName = "";
  let searchUrl = `https://errandboy.store/products/search?keyword=${encodeURIComponent(question)}`;

  try {
    const res = await fetch(apiURL, { method: 'GET' });
    const data = await res.json();

    if (data.total === 1) {
      productLink = data.items[0].url;
      productName = data.items[0].name;
      replyType = "product";
    } else if (data.total > 1) {
      replyType = "multi";
    }
  } catch (e) {
    // fallback: replyType resta ""
  }

  let prompt = "";

  if (replyType === "product") {
    prompt = `
You are Errand Boy Malta's shopping assistant. Always reply ONLY in the user's language.
The customer searched for: "${question}".
There is EXACTLY ONE matching product.
Give a clear confirmation and provide ONLY the clickable product link: <a href="${productLink}" target="_blank">${productName}</a>.
Optionally, if helpful, you may add info from the web after the link.
    `;
  } else {
    // MULTI or ZERO: mostra sempre il search link reale
    prompt = `
You are Errand Boy Malta's shopping assistant. Always reply ONLY in the user's language.
The customer searched for: "${question}".
Show a clear reply and ALWAYS include this clickable link: <a href="${searchUrl}" target="_blank">See all products for "${question}"</a>.
If nothing is found, invite them to contact support via <a href="https://wa.me/35677082474" target="_blank">WhatsApp</a> or <a href="tel:+35677082474">+35677082474</a>.
    `;
  }

  await callSonarAndShow(question, prompt);
}

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
};

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
