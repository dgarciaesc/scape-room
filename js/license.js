/* ============================================================
   Licencia de pago: habla con el backend (backend/worker.js) para
   validar un código y descargar el contenido real del juego (las 6
   pruebas), que ya no vive en este repositorio público.
   ============================================================ */

const License = (() => {
  /* ⚠️ AJUSTA ESTO tras desplegar el Worker en Cloudflare.
     La URL exacta aparece en el panel del Worker, algo como:
     https://testamento-licencias.tu-usuario.workers.dev */
  const WORKER_URL = "https://siglodeoro.supermoncho.workers.dev";

  const DEVICE_KEY = "testamento_device_id";
  const STAGES_CACHE_KEY = "testamento_stages_v1";
  const CODE_KEY = "testamento_license_code";

  /* Identificador estable de este móvil/navegador — es lo que ata un
     código a "un dispositivo" tal como se pidió. Sobrevive a cerrar la
     app; se pierde si el usuario borra datos del navegador. */
  function deviceId() {
    let id = localStorage.getItem(DEVICE_KEY);
    if (!id) {
      id = crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      localStorage.setItem(DEVICE_KEY, id);
    }
    return id;
  }

  function cachedStages() {
    try {
      const raw = localStorage.getItem(STAGES_CACHE_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      return Array.isArray(parsed) && parsed.length ? parsed : null;
    } catch (e) {
      return null;
    }
  }

  function isUnlocked() {
    return !!cachedStages();
  }

  function currentCode() {
    return localStorage.getItem(CODE_KEY) || "";
  }

  /* Valida el código contra el backend. Si es correcto, descarga y
     cachea las 6 pruebas — a partir de ahí el juego funciona offline
     igual que antes, ya no hace falta volver a llamar al servidor. */
  async function redeem(rawCode) {
    const code = (rawCode || "").trim().toUpperCase();
    if (!code) throw new Error("Escribe el código de tu licencia.");

    let res;
    try {
      res = await fetch(`${WORKER_URL}/api/redeem`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, deviceId: deviceId() }),
      });
    } catch (e) {
      throw new Error(
        "No hay conexión. Necesitas internet una sola vez, para desbloquear la aventura."
      );
    }

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || "Código no válido.");
    }

    localStorage.setItem(STAGES_CACHE_KEY, JSON.stringify(data.stages));
    localStorage.setItem(CODE_KEY, code);
    return data.stages;
  }

  /* Inicia el pago: pide al backend una sesión de Stripe Checkout y
     redirige al comprador allí. */
  async function startCheckout() {
    let res;
    try {
      res = await fetch(`${WORKER_URL}/api/checkout`, { method: "POST" });
    } catch (e) {
      throw new Error("No se pudo conectar con la pasarela de pago.");
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.url) {
      throw new Error(data.error || "No se pudo iniciar el pago.");
    }
    location.href = data.url;
  }

  return {
    WORKER_URL,
    deviceId,
    cachedStages,
    isUnlocked,
    currentCode,
    redeem,
    startCheckout,
  };
})();
