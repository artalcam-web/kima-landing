# Guía para publicar landinmx.com (KLMA)

Esta carpeta ya contiene el sitio completo y listo (`index.html`, `styles.css`, `script.js`, `assets/`). No necesita build ni instalación: es HTML puro.

## 0. Antes de publicar — completa 2 datos en `script.js`

Abre `script.js` y en las primeras líneas (`KLMA_CONFIG`) reemplaza:

```js
whatsappNumber: "52XXXXXXXXXX",       // tu número real, solo dígitos, con código de país (52 + 10 dígitos)
facebookPageUsername: "TU_PAGINA_DE_FACEBOOK", // el usuario de tu página de Facebook (para Messenger)
instagramHandle: "TU_USUARIO_DE_INSTAGRAM"     // opcional
```

Sin esto, los botones de WhatsApp/Messenger no van a abrir el chat correcto.

---

## 1. Subir el código a GitHub

1. Entra a [github.com/new](https://github.com/new) y crea un repositorio nuevo, por ejemplo `klma-landing` (puede ser privado o público).
2. En tu computadora, abre la Terminal dentro de esta carpeta (`klma-landing-page`) y ejecuta:

```bash
git init
git add -A
git commit -m "Landing page KLMA"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/klma-landing.git
git push -u origin main
```

Sustituye `TU_USUARIO` por tu usuario de GitHub. Si te pide iniciar sesión, usa tu usuario y un [token de acceso personal](https://github.com/settings/tokens) (no tu contraseña).

---

## 2. Desplegar en Render

1. Entra a [render.com](https://dashboard.render.com/) e inicia sesión (o crea cuenta gratis).
2. Click en **New +** → **Static Site**.
3. Conecta tu cuenta de GitHub y selecciona el repositorio `klma-landing`.
4. Configuración:
   - **Build Command:** deja vacío (o `echo "static"`)
   - **Publish directory:** `.` (la raíz del repo)
5. Click **Create Static Site**. Render construye y te da una URL tipo `https://klma-landing.onrender.com`. Ábrela y confirma que todo se ve bien.

El archivo `render.yaml` que ya está en la carpeta deja esta configuración lista si usas "Blueprints" en Render (New + → Blueprint).

---

## 3. Conectar el dominio landinmx.com

### En Render
1. Dentro del Static Site, ve a **Settings → Custom Domains → Add Custom Domain**.
2. Escribe `landinmx.com` y también `www.landinmx.com`.
3. Render te va a mostrar un registro DNS tipo:
   - Para `landinmx.com` (raíz): un registro **CNAME** o **ANAME/ALIAS** apuntando a algo como `klma-landing.onrender.com`
   - Para `www`: **CNAME** → `klma-landing.onrender.com`

### En Cloudflare (tu dominio ya está ahí)
1. Entra a [dash.cloudflare.com](https://dash.cloudflare.com) → selecciona `landinmx.com`.
2. Ve a **DNS → Records**.
3. Agrega los registros que te dio Render:
   - Tipo `CNAME`, Nombre `@` (o `landinmx.com`), Destino `klma-landing.onrender.com`, Proxy: **DNS only** (nube gris) mientras validas — luego puedes activar el proxy naranja de Cloudflare.
   - Tipo `CNAME`, Nombre `www`, Destino `klma-landing.onrender.com`, mismo criterio de proxy.
4. Guarda. La propagación puede tardar de unos minutos a un par de horas.
5. Vuelve a Render y confirma que el dominio quedó verificado (aparece un check verde). Render emite el certificado SSL automáticamente.

---

## 4. Configurar el evento de conversión en Google Tag Manager (GA4)

El sitio ya envía este evento al `dataLayer` cada vez que alguien da clic en **cualquier** botón de WhatsApp o Messenger:

```js
{ event: "contact_click", contact_method: "whatsapp" | "messenger", click_location: "hero" | "floating" | "lote_220" | ... }
```

Para verlo en GA4:
1. Entra a [tagmanager.google.com](https://tagmanager.google.com/) con el contenedor **GTM-WP65JC87**.
2. Crea un **Trigger** tipo "Custom Event", nombre del evento: `contact_click`.
3. Crea una **Tag** de tipo "Google Analytics: GA4 Event", con el nombre de evento `generate_lead` (o el que prefieras), usando ese trigger. Si aún no tienes una Tag de "GA4 Configuration" con tu Measurement ID (`G-XXXXXXX`), créala primero.
4. Publica el contenedor (botón **Submit** en GTM).

## 5. Meta Pixel (ya activo)

El Pixel `6825715610853797` ya está instalado y dispara automáticamente:
- `PageView` al cargar la página.
- `Contact` + evento personalizado `WhatsAppMessengerClick` cada vez que alguien toca un botón de WhatsApp o Messenger.

Verifícalo con la extensión **Meta Pixel Helper** de Chrome, o en Meta Events Manager → tu pixel → pestaña "Test Events".

(Nota histórica: el sitio usaba antes el pixel `1415197632010498`, que pertenece al negocio "International Hair" y no a la cuenta de KLMA — por eso los eventos no aparecían en el Events Manager correcto. Ya se corrigió al ID `6825715610853797`.)
