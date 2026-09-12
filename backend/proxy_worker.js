/* ============================================================
   PUENTE /goldenage — Cloudflare Worker
   ============================================================
   Sirve el juego (alojado en GitHub Pages) bajo la ruta
   hiddenmadrid.com/goldenage, mientras el resto del dominio
   (la raíz) sigue sirviendo la web de Lovable sin verse afectado.

   Este Worker NO toca el backend de licencias (siglodeoro.supermoncho
   .workers.dev) — es un Worker aparte, solo para servir los ficheros
   estáticos del juego bajo esa ruta. El frontend sigue llamando
   directamente a la URL del Worker de licencias, como hasta ahora.

   DESPLIEGUE:
     1. Cloudflare → Workers & Pages → Create → Create Worker.
     2. Nombre sugerido: "goldenage-proxy" → Deploy (con el código de
        ejemplo; luego lo sustituyes).
     3. Edit code → borra todo, pega este archivo entero → Save and deploy.
     4. En el propio Worker → Settings → Domains & Routes → Add →
        "Route": introduce   hiddenmadrid.com/goldenage*
        (con el asterisco al final, sin espacios) y selecciona la zona
        hiddenmadrid.com. Guarda.

   IMPORTANTE — requisito de DNS:
     Esta ruta SOLO intercepta el tráfico si el registro DNS de
     hiddenmadrid.com en Cloudflare está "Proxied" (nube naranja), no
     "DNS only" (nube gris). Si al conectar el dominio en Lovable te
     piden dejarlo en modo "DNS only" para su verificación, esta ruta
     de Worker no funcionará — en ese caso, la alternativa es servir
     el juego en un subdominio aparte (p.ej. goldenage.hiddenmadrid.com)
     en vez de una subruta; avisa y lo preparamos así.
   ============================================================ */

const UPSTREAM_ORIGIN = "https://dgarciaesc.github.io";
const UPSTREAM_BASE_PATH = "/scape-room"; // ruta real del juego en GitHub Pages
const PUBLIC_PREFIX = "/goldenage"; // ruta pública bajo hiddenmadrid.com

export default {
  async fetch(request) {
    const url = new URL(request.url);

    // Redirección con barra final: /goldenage -> /goldenage/
    // (necesario para que las rutas relativas del juego, tipo
    // "js/app.js", resuelvan bien contra /goldenage/js/app.js).
    if (url.pathname === PUBLIC_PREFIX) {
      const redirectUrl = new URL(url);
      redirectUrl.pathname = PUBLIC_PREFIX + "/";
      return Response.redirect(redirectUrl.toString(), 301);
    }

    const rest = url.pathname.startsWith(PUBLIC_PREFIX)
      ? url.pathname.slice(PUBLIC_PREFIX.length)
      : url.pathname;

    const upstreamUrl = UPSTREAM_ORIGIN + UPSTREAM_BASE_PATH + rest + url.search;

    const upstreamRequest = new Request(upstreamUrl, {
      method: request.method,
      headers: request.headers,
      body: request.method === "GET" || request.method === "HEAD" ? undefined : request.body,
      redirect: "follow",
    });

    const response = await fetch(upstreamRequest);

    // Se copia la respuesta para poder añadir/tocar cabeceras si hiciera
    // falta más adelante; de momento se devuelve tal cual llega de GitHub.
    const headers = new Headers(response.headers);
    headers.delete("content-security-policy"); // por si GitHub Pages la fija y choca con el dominio nuevo

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  },
};
