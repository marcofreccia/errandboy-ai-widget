// === WIDGET AI SONAR - EVENTI PRINCIPALI ===
document.getElementById('sonar-fab').onclick = function() {
  document.getElementById('sonar-chat').style.display = 'block';
  this.style.display = 'none';
  // ✅ TRACKING: Widget aperto
  trackWidgetEvent('widget_opened');
};

document.querySelector('#sonar-chat .close-chat').onclick = function() {
  document.getElementById('sonar-chat').style.display = 'none';
  document.getElementById('sonar-fab').style.display = 'flex';
  // ✅ TRACKING: Widget chiuso
  trackWidgetEvent('widget_closed');
};

async function askSonar(model = "sonar-pro") {
  const question = document.getElementById('sonar-q').value.trim();
  if (!question) return;
  
  // ✅ TRACKING: Messaggio inviato
  trackWidgetEvent('message_sent', { length: question.length });
  
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

// === TRACKING EVENTI WIDGET AI SONAR ===
function trackWidgetEvent(eventName, eventData = {}) {
    // Verifica se le funzioni di tracking sono disponibili (caricate da Ecwid)
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
    
    // Log per debug (visibile nella console del browser)
    console.log('🎯 Widget Event:', eventName, eventData);
}    });
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
// === TRACKING EVENTI WIDGET AI SONAR ===
// Funzioni di tracking per monitorare l'uso del widget

function trackWidgetEvent(eventName, eventData = {}) {
    // Verifica se le funzioni di tracking sono disponibili (caricate da Ecwid)
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
    
    // Log per debug (visibile nella console del browser)
    console.log('🎯 Widget Event:', eventName, eventData);
}

// Modifica la funzione che apre il widget (cerca la funzione esistente e aggiungi la riga di tracking)
// Esempio: quando il FAB viene cliccato
document.addEventListener('DOMContentLoaded', function() {
    const fabButton = document.getElementById('sonar-fab');
    if (fabButton) {
        fabButton.addEventListener('click', function() {
            trackWidgetEvent('widget_opened');
        });
    }
    
    // Tracking quando viene inviato un messaggio
    const sendButton = document.querySelector('[onclick*="askSonar"]');
    if (sendButton) {
        sendButton.addEventListener('click', function() {
            const question = document.getElementById('sonar-q').value;
            trackWidgetEvent('message_sent', { length: question.length });
        });
    }
});
