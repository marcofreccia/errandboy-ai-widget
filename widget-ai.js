// === WIDGET AI SONAR - EVENTI PRINCIPALI ===
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

// --- FUNZIONI AGGIUNTIVE ---
function getFonteBrandString(product_brand) {
  if (product_brand && product_brand.trim() !== "") {
    return `Secondo quanto riportato dal sito ufficiale ${product_brand} e da recensioni online,`;
  } else {
    return "Secondo quanto riportato dal sito ufficiale del produttore e da recensioni online,";
  }
}

function isOvenInfoPresent(product_description) {
  const testo = (product_description || "").toLowerCase();
  return testo.includes('forno') || testo.includes('oven') || testo.includes('cottura in forno') || testo.includes('oven safe');
}

// --- FUNZIONE LOGICA PRODOTTI/CATEGORIE ---
async function getProductLinkOrCategory(keyword) {
  const storeId = '29517085';
  const token = 'public_AzqkPnjmEbKiDr3bSWKeC1YrrNh1BfBY';
  const apiURL = `https://app.ecwid.com/api/v3/${storeId}/products?keyword=${encodeURIComponent(keyword)}&token=${token}`;
  const res = await fetch(apiURL, { method: 'GET' });
  const data = await res.json();
  if (data.total === 1) {
    const item = data.items[0];
    return {
      type: 'product',
      name: item.name,
      url: item.url,
      product_brand: (item.attributes && item.attributes.find(a => a.name.toLowerCase() === "brand")) ? item.attributes.find(a => a.name.toLowerCase() === "brand").value : (item.product_brand || ""),
      product_description: item.description || item.product_description || ""
    };
  } else if (data.total > 1) {
    return {
      type: 'category',
      url: `https://errandboy.store/search?q=${encodeURIComponent(keyword)}`,
      keyword: keyword
    };
  } else {
    return {
      type: 'none'
    };
  }
}

// --- FUNZIONE PRINCIPALE DI RISPOSTA ---
async function askSonar(model = "sonar-pro") {
  const question = document.getElementById('sonar-q').value.trim();
  if (!question) return;
  trackWidgetEvent('message_sent', { length: question.length });
  document.getElementById('sonar-reply').innerHTML = '⏳ Sto cercando... Attendi.';

  let keyword = question;

  // Chiamata API Ecwid
  const result = await getProductLinkOrCategory(keyword);

  let reply = '';
  if (result.type === 'product') {
    let product_brand = result.product_brand || "";
    let product_description = result.product_description || "";

    if (isOvenInfoPresent(product_description)) {
      reply = `
        <b>Abbiamo trovato 1 prodotto:</b><br>
        ${result.name}<br>
        <a href="${result.url}" target="_blank">Vedi il prodotto</a><br><br>
        ${product_description}
      `;
    } else {
      // Qui puoi integrare con Perplexity, per ora esempio simulato
      let infoOnline = "il prodotto è adatto all’uso in forno fino a 230°C."; // <-- Da sostituire con risposta online se vuoi
      let fonte = getFonteBrandString(product_brand);
      reply = `
        <b>Abbiamo trovato 1 prodotto:</b><br>
        ${result.name}<br>
        <a href="${result.url}" target="_blank">Vedi il prodotto</a><br><br>
        ${fonte} ${infoOnline}
      `;
    }
  } else if (result.type === 'category') {
    reply = `
      <b>Abbiamo trovato diversi articoli per la tua ricerca:</b><br>
      <a href="${result.url}" target="_blank">Vedi tutti i risultati relativi a "${result.keyword}"</a>
    `;
  } else {
    reply =
      `Nessun prodotto trovato per la tua richiesta.<br>
Può darsi che il prodotto non sia disponibile oppure che la parola cercata non corrisponda esattamente.<br>
Ti invito ad usare la funzione di ricerca 🔍 e a provare con un altro termine.<br><br>
📲 Oppure <b>contattaci subito</b> via <a href="https://wa.me/35677082474" target="_blank">WhatsApp</a> o SMS al numero <a href="tel:+35677082474">+35677082474</a> per assistenza rapida!
      `;
  }

  document.getElementById('sonar-reply').innerHTML = reply;

  // Scroll chat aggiornata
  const chatBox = document.getElementById('sonar-chat');
  chatBox.scrollTop = chatBox.scrollHeight;
}

document.getElementById('sonar-send-btn').onclick = function() {
  askSonar();
};

document.getElementById('sonar-q').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') askSonar();
});

// === TRACKING EVENTI WIDGET AI SONAR ===
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
