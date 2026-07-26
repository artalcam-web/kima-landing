/* =========================================================
   KLMA — script.js
   Config única + tracking de GA4 (dataLayer/GTM) y Meta Pixel
   en TODOS los botones de WhatsApp / Messenger del sitio.
   ========================================================= */

/* ============ 1. CONFIGURACIÓN — edita solo aquí ============ */
const KLMA_CONFIG = {
  // Número de WhatsApp con código de país, SOLO dígitos. Ej: 5216641234567
  whatsappNumber: "526642784339",
  whatsappDefaultMessage: "Hola, me interesa información sobre los lotes de KLMA.",
  // Usuario/página de Facebook para el botón de Messenger (sin @, sin URL)
  facebookPageUsername: "TU_PAGINA_DE_FACEBOOK", // TODO: reemplazar
  instagramHandle: "TU_USUARIO_DE_INSTAGRAM" // TODO: reemplazar (opcional, solo para el footer)
};

/* ============ 2. Helpers de enlaces ============ */
function buildWhatsAppLink(message) {
  const msg = encodeURIComponent(message || KLMA_CONFIG.whatsappDefaultMessage);
  return `https://wa.me/${KLMA_CONFIG.whatsappNumber}?text=${msg}`;
}
function buildMessengerLink() {
  return `https://m.me/${KLMA_CONFIG.facebookPageUsername}`;
}

/* ============ 3. Tracking: GA4 (dataLayer) + Meta Pixel ============ */
window.dataLayer = window.dataLayer || [];

function trackContactClick(method, location, extra) {
  const payload = {
    event: "contact_click",
    contact_method: method, // 'whatsapp' | 'messenger'
    click_location: location, // dónde vive el botón: 'hero', 'floating', 'lote_220', etc.
    page_path: window.location.pathname,
    ...extra
  };

  // --- Google Analytics 4 (a través de Google Tag Manager) ---
  // En GTM crea un Trigger "Custom Event" -> nombre "contact_click" y una
  // Tag de GA4 Event con el nombre "generate_lead" (o el que prefieras)
  // usando estos parámetros del dataLayer.
  try {
    window.dataLayer.push(payload);
  } catch (e) {
    console.warn("dataLayer push failed", e);
  }

  // --- Meta Pixel ---
  // 'Contact' es un evento estándar de Meta, ideal para optimizar campañas
  // de mensajes/leads. Se añade también un evento personalizado con detalle.
  if (typeof fbq === "function") {
    try {
      fbq("track", "Contact", {
        content_name: location,
        content_category: method
      });
      fbq("trackCustom", "WhatsAppMessengerClick", {
        method: method,
        location: location
      });
    } catch (e) {
      console.warn("fbq track failed", e);
    }
  }
}

/* ============ 4. Wiring de botones ============ */
function initContactButtons() {
  // Todos los botones/enlaces con data-contact="whatsapp" o "messenger"
  document.querySelectorAll("[data-contact]").forEach((el) => {
    const method = el.getAttribute("data-contact");
    const location = el.getAttribute("data-location") || "unknown";
    const customMsg = el.getAttribute("data-message");

    // Aseguramos el href correcto siempre (por si el HTML lo dejó vacío)
    if (method === "whatsapp") {
      el.setAttribute("href", buildWhatsAppLink(customMsg));
      el.setAttribute("target", "_blank");
      el.setAttribute("rel", "noopener");
    } else if (method === "messenger") {
      el.setAttribute("href", buildMessengerLink());
      el.setAttribute("target", "_blank");
      el.setAttribute("rel", "noopener");
    }

    el.addEventListener("click", function () {
      trackContactClick(method, location);
      // No se previene la navegación: target=_blank permite que el
      // evento se dispare y el usuario salte a WhatsApp/Messenger sin fricción.
    });
  });

  // Instagram / redes sociales (footer) — opcional, solo completa el usuario
  document.querySelectorAll("[data-social='instagram']").forEach((el) => {
    if (KLMA_CONFIG.instagramHandle && KLMA_CONFIG.instagramHandle !== "TU_USUARIO_DE_INSTAGRAM") {
      el.setAttribute("href", `https://instagram.com/${KLMA_CONFIG.instagramHandle}`);
    }
  });
  document.querySelectorAll("[data-social='facebook']").forEach((el) => {
    if (KLMA_CONFIG.facebookPageUsername && KLMA_CONFIG.facebookPageUsername !== "TU_PAGINA_DE_FACEBOOK") {
      el.setAttribute("href", `https://facebook.com/${KLMA_CONFIG.facebookPageUsername}`);
    }
  });
}

/* ============ 5. Header al hacer scroll ============ */
function initHeaderScroll() {
  const header = document.getElementById("siteHeader");
  if (!header) return;
  window.addEventListener("scroll", () => {
    header.classList.toggle("scrolled", window.scrollY > 40);
  });
}

/* ============ 6. Menú móvil ============ */
function initMobileMenu() {
  const burger = document.getElementById("burger");
  const menu = document.getElementById("mainMenu");
  if (!burger || !menu) return;
  burger.addEventListener("click", () => menu.classList.toggle("open"));
  menu.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => menu.classList.remove("open"))
  );
}

/* ============ 7. FAQ accordion ============ */
function initFaq() {
  document.querySelectorAll(".faq-item").forEach((item) => {
    const q = item.querySelector(".faq-q");
    const a = item.querySelector(".faq-a");
    q.addEventListener("click", () => {
      const isOpen = item.classList.contains("open");
      document.querySelectorAll(".faq-item.open").forEach((other) => {
        if (other !== item) {
          other.classList.remove("open");
          other.querySelector(".faq-a").style.maxHeight = null;
        }
      });
      item.classList.toggle("open", !isOpen);
      a.style.maxHeight = !isOpen ? a.scrollHeight + "px" : null;
    });
  });
}

/* ============ 8. Reveal on scroll ============ */
function initReveal() {
  const els = document.querySelectorAll(".reveal");
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  els.forEach((el) => io.observe(el));
}

/* ============ 9. Cookie notice ============ */
function initCookieNotice() {
  const note = document.getElementById("cookieNote");
  if (!note) return;
  if (localStorage.getItem("klma_cookie_ack")) {
    note.remove();
    return;
  }
  document.getElementById("cookieAccept").addEventListener("click", () => {
    localStorage.setItem("klma_cookie_ack", "1");
    note.remove();
  });
}

/* ============ 10. Lote CTA -> mensaje personalizado de WhatsApp ============ */
function initLoteMessages() {
  document.querySelectorAll("[data-lote-msg]").forEach((el) => {
    el.setAttribute("data-message", el.getAttribute("data-lote-msg"));
  });
}

/* ============ Init ============ */
document.addEventListener("DOMContentLoaded", () => {
  initLoteMessages();
  initContactButtons();
  initHeaderScroll();
  initMobileMenu();
  initFaq();
  initReveal();
  initCookieNotice();
});
