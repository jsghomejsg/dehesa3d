document.addEventListener('DOMContentLoaded', () => {
  // 1. Lógica de Pestañas (Soluciones por Sector)
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-tab');
      
      // Quitar clase activa de todos
      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanels.forEach(p => p.classList.remove('active'));
      
      // Añadir clase activa al seleccionado
      btn.classList.add('active');
      const panel = document.getElementById(target);
      if (panel) panel.classList.add('active');
    });
  });

  // 2. Calculadora B2B (Llaveros e Imanes)
  const pricingData = {
    25:   { nfc: 3.50, noNfc: 2.90 },
    50:   { nfc: 2.45, noNfc: 1.95 },
    100:  { nfc: 1.95, noNfc: 1.50 },
    250:  { nfc: 1.60, noNfc: 1.20 },
    500:  { nfc: 1.35, noNfc: 0.98 },
    1000: { nfc: 1.15, noNfc: 0.82 }
  };

  let state = {
    format: 'Llavero', // o 'Imán de Neodimio'
    hasNfc: true,
    qty: 100
  };

  const formatBtns = document.querySelectorAll('[data-format]');
  const nfcBtns = document.querySelectorAll('[data-nfc]');
  const tierCards = document.querySelectorAll('[data-qty]');

  const elUnitPrice = document.getElementById('calc-unit-price');
  const elTotalPrice = document.getElementById('calc-total-price');
  const elDepositPrice = document.getElementById('calc-deposit-price');
  const elSummarySpec = document.getElementById('calc-summary-spec');
  const elWhatsappBtn = document.getElementById('calc-whatsapp-btn');

  function updateCalculator() {
    if (!elUnitPrice) return; // Si no está la calculadora en la página, no hace nada

    const magnetSupplement = state.format === 'Imán de Neodimio' ? 0.15 : 0.00;

    // Actualizar tarjetas de precio unitario dinámicamente
    tierCards.forEach(card => {
      const q = parseInt(card.getAttribute('data-qty'), 10);
      const base = state.hasNfc ? pricingData[q].nfc : pricingData[q].noNfc;
      const finalUnit = (base + magnetSupplement).toFixed(2).replace('.', ',');
      const priceSpan = card.querySelector('.tier-unit');
      if (priceSpan) priceSpan.textContent = `${finalUnit} € / ud`;
    });

    // Calcular totales para la selección actual
    const baseSelected = state.hasNfc ? pricingData[state.qty].nfc : pricingData[state.qty].noNfc;
    const unitPrice = baseSelected + magnetSupplement;
    const totalOrder = unitPrice * state.qty;
    const deposit = totalOrder * 0.5;

    // Pintar en pantalla los resultados
    elUnitPrice.textContent = `${unitPrice.toFixed(2).replace('.', ',')} € / ud`;
    elTotalPrice.textContent = `${totalOrder.toFixed(2).replace('.', ',')} €`;
    elDepositPrice.textContent = `${deposit.toFixed(2).replace('.', ',')} € (50%)`;
    elSummarySpec.textContent = `${state.qty} uds · ${state.format} · ${state.hasNfc ? 'Con Chip NFC' : 'Sin Chip NFC'}`;

    // Generar enlace de WhatsApp con todos los datos
    const nfcText = state.hasNfc ? 'Con NFC programado' : 'Sin NFC';
    const text = `Hola Julio, he calculado un presupuesto en dehesa3d.es para *${state.qty} unidades* de *${state.format}* (${nfcText}) a ${unitPrice.toFixed(2).replace('.', ',')} €/ud (Total: ${totalOrder.toFixed(2).replace('.', ',')} € + IVA). Te envío mi logo para ver el diseño 3D y pedir la muestra física.`;
    elWhatsappBtn.href = `https://wa.me/34611801528?text=${encodeURIComponent(text)}`;
  }

  // Detectar clics en opciones de formato
  formatBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      formatBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.format = btn.getAttribute('data-format');
      updateCalculator();
    });
  });

  // Detectar clics en opciones de NFC
  nfcBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      nfcBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.hasNfc = btn.getAttribute('data-nfc') === 'true';
      updateCalculator();
    });
  });

  // Detectar clics en tramos de cantidad
  tierCards.forEach(card => {
    card.addEventListener('click', () => {
      tierCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      state.qty = parseInt(card.getAttribute('data-qty'), 10);
      updateCalculator();
    });
  });

  // Arrancar la calculadora al cargar la web
  updateCalculator();

  // 3. Rastreador (Pixel) de Meta Ads para botones de WhatsApp
  const wsButtons = document.querySelectorAll('a[href^="https://wa.me"]');
  wsButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      if (typeof fbq === 'function') {
        fbq('track', 'Lead'); // Avisa a Facebook de que hay un posible cliente
      }
    });
  });
});
