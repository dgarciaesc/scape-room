/* ============================================================
   EL TESTAMENTO DEL SIGLO DE ORO — Backend de licencias
   Cloudflare Worker · sin dependencias · desplegable copiando y
   pegando este archivo en el panel de Cloudflare (Quick Edit).
   ============================================================

   RUTAS :
     POST /api/checkout          → crea una sesión de pago (Stripe)
     POST /api/stripe-webhook    → Stripe notifica el pago; genera el código
     GET  /api/code-for-session  → la página de "gracias" recupera el código
     POST /api/redeem            → valida código + dispositivo, entrega el juego

   VARIABLES DE ENTORNO NECESARIAS (Settings → Variables del Worker):
     STRIPE_SECRET_KEY     (Encrypt) — clave secreta de Stripe (sk_live_...)
     STRIPE_WEBHOOK_SECRET (Encrypt) — firma del webhook (whsec_...)
     STRIPE_PRICE_ID                 — ID del precio creado en Stripe (price_...)
     SITE_URL                        — https://dgarciaesc.github.io/scape-room
     ALLOWED_ORIGIN                  — mismo valor que SITE_URL (para CORS)

   BINDING NECESARIO:
     DB → la base de datos D1 creada con schema.sql
   ============================================================ */

/* ---------- Contenido real del juego: las 6 pruebas ----------
   Esto es lo que antes vivía en js/data.js. Ahora solo se entrega
   tras validar una licencia — por eso el repo público ya no contiene
   ni los enigmas ni las respuestas. */
const STAGES = [
    {
      id: "etapa_1_plaza_oriente",
      num: 1,
      title: "La Corte de Velázquez y el Alcázar",
      location: "Plaza de Oriente",
      landmark: "Estatua Ecuestre de Felipe IV",
      coords: { lat: 40.418, lng: -3.7126 },
      photo: "img/etapa1.jpg",
      photoCaption:
        "«Las Meninas», Diego Velázquez (1656), pintado en el Alcázar · Museo del Prado",
      narrative:
        "¡Atención, investigadores! Os halláis en el antiguo solar del Alcázar " +
        "Real de los Austrias, la fortaleza medieval donde Diego Velázquez " +
        "instaló su taller y pintó «Las Meninas». Ante vosotros se alza la " +
        "impresionante estatua de Felipe IV, la primera estatua ecuestre del " +
        "mundo sostenida únicamente sobre las patas traseras del caballo " +
        "gracias a los cálculos del mismísimo Galileo Galilei. Pero el rey no " +
        "estaba solo en la Corte: si miráis a vuestro alrededor, las estatuas " +
        "de piedra de los antiguos monarcas custodian los jardines. Para abrir " +
        "el primer archivo de la dinastía, debéis reconciliar la pintura de " +
        "Velázquez con el linaje de los reyes.",
      enigma:
        "El rey de bronce desafía la gravedad gracias al sabio de Pisa, pero a " +
        "los pies de su montura, el pintor de «Las Meninas» recibe su hábito " +
        "de nobleza. Inspecciona el relieve lateral: ¿qué sagrada cruz de " +
        "orden militar mancha el pecho del artista? Pasea después la mirada " +
        "por las efigies de piedra que custodian la plaza. Ignora a godos y " +
        "borbones: cuenta únicamente a los monarcas de la dinastía del águila " +
        "bicéfala (los Austrias) que reinaron en los siglos XVI y XVII. Une la " +
        "cruz de la orden con el número de reyes imperiales para descifrar la " +
        "clave.",
      answerFormat: "PALABRA-NÚMERO (ej.: ORDEN-0)",
      hintSubtle:
        "La orden militar es la misma que da nombre al Camino que peregrina " +
        "hasta Galicia… y los reyes que buscas empiezan en Felipe «el Hermoso» " +
        "y terminan en Carlos «el Hechizado».",
      directions: [
        "Acércate al pedestal de la estatua ecuestre de Felipe IV en el centro de la Plaza de Oriente.",
        "Localiza en el bajorrelieve lateral la escena donde el rey nombra caballero a Velázquez y observa la cruz grabada en su pecho.",
        "Cuenta las estatuas de piedra de los reyes Austrias en el paseo: Felipe I, Carlos I, Felipe II, Felipe III, Felipe IV y Carlos II.",
      ],
      answer: "SANTIAGO-6",
      acceptedAnswers: ["SANTIAGO-6", "SANTIAGO 6", "SANTIAGO6", "santiago-6", "santiago 6"],
      revealExplanation:
        "La respuesta era SANTIAGO-6. En el relieve, Felipe IV impone a " +
        "Velázquez la cruz de la Orden de Santiago — la que el propio pintor " +
        "lució en «Las Meninas». Y seis son los Austrias con efigie en la " +
        "plaza: Felipe I, Carlos I, Felipe II, Felipe III, Felipe IV y " +
        "Carlos II.",
      transition: {
        type: "walk",
        text:
          "Camina en dirección este por la Calle Mayor (dejando la catedral " +
          "de la Almudena y el palacio a tus espaldas). A unos 200 metros " +
          "encontraréis a mano derecha la apertura de la plaza medieval " +
          "presidida por la Torre de los Lujanes: la Plaza de la Villa.",
      },
    },
    {
      id: "etapa_2_plaza_villa",
      num: 2,
      title: "El Traslado de la Corte (1561)",
      location: "Plaza de la Villa",
      landmark: "Estatua de Álvaro de Bazán",
      coords: { lat: 40.4154, lng: -3.71 },
      photo: "img/etapa2.jpg",
      photoCaption:
        "«La batalla de Lepanto» (1571), anónimo · National Maritime Museum",
      narrative:
        "Habéis llegado al corazón del Madrid medieval. En mayo de 1561, el " +
        "rey Felipe II firmó el decreto que cambió para siempre el destino de " +
        "esta villa, convirtiéndola en la capital del Imperio Español. En el " +
        "centro de la plaza se yergue la estatua de don Álvaro de Bazán, el " +
        "almirante que jamás conoció la derrota en el mar y cuyo valor " +
        "fascinó a los mejores poetas del Siglo de Oro. Lope de Vega en " +
        "persona quiso rendirle tributo grabando en la piedra del pedestal " +
        "unos versos eternos. Ahí se oculta el salvoconducto de la Corte.",
      enigma:
        "El invicto marino da la espalda al secreto que el «Fénix de los " +
        "Ingenios» le dedicó en la piedra. Lee los versos tras el monumento y " +
        "descubre la célebre batalla naval donde la armada turca encontró su " +
        "espanto. Cuenta las letras que forman el nombre de esa mítica " +
        "batalla y antepón esa cifra a la palabra para sellar la cédula real " +
        "de 1561.",
      answerFormat: "NÚMERO-PALABRA (ej.: 0-BATALLA)",
      hintSubtle:
        "Rodea la estatua: el poema está grabado detrás. La batalla que " +
        "buscas se libró en 1571 en aguas griegas, y en ella también combatió " +
        "un tal Miguel de Cervantes, que perdió allí el uso de una mano.",
      directions: [
        "Ve detrás de la estatua de Álvaro de Bazán en el centro de la Plaza de la Villa.",
        "Lee el poema grabado en la piedra e identifica la batalla naval que menciona.",
        "Cuenta el número de letras que forman el nombre de esa batalla y antepón la cifra a la palabra.",
      ],
      answer: "7-LEPANTO",
      acceptedAnswers: ["7-LEPANTO", "7 LEPANTO", "7LEPANTO", "7-lepanto", "7 lepanto"],
      revealExplanation:
        "La respuesta era 7-LEPANTO. Los versos de Lope evocan Lepanto " +
        "(1571), «la más alta ocasión que vieron los siglos», donde la Santa " +
        "Liga aplastó a la armada otomana. Siete letras forman su nombre.",
      transition: {
        type: "google",
        text:
          "Para adentraros en el Barrio de las Letras hacia la casa del " +
          "dramaturgo más prolífico de la época, necesitaréis por única vez " +
          "la ayuda de vuestro buscador de internet.",
        question:
          "¿En qué calle y número exacto del centro de Madrid se halla la " +
          "Casa-Museo de Lope de Vega, situada en una vía dedicada " +
          "irónicamente a su archienemigo Cervantes?",
        answer: "Calle de Cervantes, 11",
        acceptedKeywords: ["cervantes", "11"],
        hintSubtle:
          "Busca en Google «Casa Museo Lope de Vega Madrid dirección». La " +
          "ironía: el Fénix vivió en la calle de su mayor rival literario.",
        directions: [
          "Abre Google y busca: «Casa Museo Lope de Vega Madrid dirección».",
          "Escribe la calle y el número que aparezcan (Calle de Cervantes, 11).",
        ],
        walkText:
          "Perfecto. Poned rumbo al Barrio de las Letras: la Casa-Museo de " +
          "Lope de Vega os espera en la Calle de Cervantes, 11 (unos 20 " +
          "minutos a pie hacia el este, cruzando la Puerta del Sol).",
      },
    },
    {
      id: "etapa_3_casa_lope_vega",
      num: 3,
      title: "El Duelo de las Plumas",
      location: "Calle de Cervantes, 11",
      landmark: "Dintel de la Casa-Museo de Lope de Vega",
      coords: { lat: 40.414, lng: -3.6976 },
      photo: "img/etapa3.jpg",
      photoCaption:
        "Lope de Vega, por Juan van der Hamen (c. 1620), con el hábito de San Juan",
      narrative:
        "Deteneos frente al portón de madera de la finca donde vivió y murió " +
        "Lope de Vega, el «Fénix de los Ingenios». Lope escribió más de 1.500 " +
        "obras teatrales, tuvo una vida llena de pasiones y amores " +
        "prohibidos, y mantuvo una enemistad encarnizada con su vecino Miguel " +
        "de Cervantes. Buscando la paz que su agitada vida le negaba, Lope " +
        "mandó esculpir en el dintel de piedra de su puerta una célebre " +
        "máxima latina que recuerda que la verdadera grandeza está en la " +
        "quietud del hogar.",
      enigma:
        "Ante el portón del poeta más prolijo del Imperio, alza la mirada " +
        "hacia el dintel tallado en piedra. Lope buscaba la calma que sus " +
        "romances le negaban y mandó labrar en la lengua de la antigua Roma " +
        "una sentencia que proclama: «Casa pequeña, pero de gran " +
        "tranquilidad». Transcribe las cinco palabras latinas en piedra que " +
        "custodian la entrada para cruzar el umbral del dramaturgo.",
      answerFormat: "CINCO PALABRAS EN LATÍN",
      hintSubtle:
        "Mira justo encima del portón de madera: la inscripción empieza por " +
        "«PARVA…» (pequeña) y termina en «…QUIES» (quietud). Transcríbela " +
        "completa, tal cual está tallada.",
      directions: [
        "Sitúate frente al portón de madera en la Calle de Cervantes, 11.",
        "Mira el dintel de piedra sobre la puerta.",
        "Transcribe las 5 palabras en latín grabadas en la piedra.",
      ],
      answer: "PARVA DOMUS SED MAGNA QUIES",
      acceptedAnswers: [
        "PARVA DOMUS SED MAGNA QUIES",
        "parva domus sed magna quies",
        "PARVA DOMUS SED MAGNA QUIES.",
      ],
      revealExplanation:
        "La inscripción reza PARVA DOMUS SED MAGNA QUIES: «casa pequeña, " +
        "pero de gran quietud». El refugio que Lope opuso a su tormentosa " +
        "vida de amores, pleitos y rivalidades literarias.",
      transition: {
        type: "walk",
        text:
          "Avanza por la Calle de Cervantes hasta el cruce con la Calle del " +
          "León. Gira a la derecha y camina una manzana hasta encontrar la " +
          "placa de azulejos que indica Calle de Lope de Vega. En esa misma " +
          "esquina se erige el muro de ladrillo del Convento de las " +
          "Trinitarias Descalzas.",
      },
    },
    {
      id: "etapa_4_convento_trinitarias",
      num: 4,
      title: "La Sepultura Oculta de Cervantes",
      location: "Calle de Lope de Vega, 18",
      landmark: "Placa de la RAE · Convento de las Trinitarias",
      coords: { lat: 40.4136, lng: -3.697 },
      photo: "img/etapa4.jpg",
      photoCaption:
        "Miguel de Cervantes, atribuido a Juan de Jáuregui (1600) · RAE",
      narrative:
        "Estáis ante los muros de ladrillo del Convento de las Trinitarias " +
        "Descalzas. Bajo este suelo descansa en paz Miguel de Cervantes desde " +
        "abril de 1616. Cervantes pidió ser enterrado aquí por pura gratitud: " +
        "la Orden de los Trinitarios fue la que pagó su rescate tras pasar " +
        "cinco años encarcelado por corsarios en Argel. Aunque durante siglos " +
        "la ubicación exacta de su fosa fue un misterio, la Real Academia " +
        "Española colocó una placa conmemorativa en la fachada exterior que " +
        "guarda la fecha clave para resolver este enigma.",
      enigma:
        "En la morada sagrada que rescató de Argel al autor de «El Quijote», " +
        "la lápida de la Academia guarda el año de su homenaje en la pared. " +
        "Pero los eruditos no escribieron el año con números comunes, sino " +
        "con el lenguaje del César: MDCCCLXVIII. Desentraña el valor de " +
        "estas letras romanas y conviértelas en la cifra de cuatro dígitos de " +
        "nuestro calendario.",
      answerFormat: "AÑO DE 4 DÍGITOS",
      hintSubtle:
        "Recuerda el valor de cada letra romana: M=1000, D=500, C=100, L=50, " +
        "X=10, V=5, I=1. Ve sumando de izquierda a derecha.",
      directions: [
        "Acércate a la fachada exterior del convento en la Calle de Lope de Vega, 18.",
        "Localiza la placa de la Real Academia Española (RAE).",
        "Convierte los números romanos MDCCCLXVIII: M(1000) + DCCC(800) + LX(60) + VIII(8).",
      ],
      answer: "1868",
      acceptedAnswers: ["1868"],
      revealExplanation:
        "MDCCCLXVIII = 1868: M(1000) + DCCC(800) + LX(60) + VIII(8). Ese año " +
        "la RAE rindió homenaje a Cervantes en el convento donde reposa desde " +
        "1616.",
      transition: {
        type: "walk",
        text:
          "Sigue caminando en sentido ascendente por la Calle de Lope de " +
          "Vega. En pocos minutos desembocarás directamente en la animada " +
          "Plaza de Santa Ana, presidida por el Teatro Español.",
      },
    },
    {
      id: "etapa_5_plaza_santa_ana",
      num: 5,
      title: "El Corral del Príncipe y la Comedia",
      location: "Plaza de Santa Ana",
      landmark: "Estatua de Calderón de la Barca",
      coords: { lat: 40.4149, lng: -3.7008 },
      photo: "img/etapa5.jpg",
      photoCaption:
        "Calderón de la Barca, grabado de Pedro de Villafranca (1676)",
      narrative:
        "¡Bienvenidos a la cuna del teatro español! En este mismo lugar se " +
        "levantaba el famoso Corral del Príncipe, el espacio donde el pueblo " +
        "llano, los nobles y las mujeres hacinadas en «la cazuela» aclamaban " +
        "o abucheaban las comedias de la época. Presidiendo la plaza se " +
        "encuentra la estatua de don Pedro Calderón de la Barca. En los " +
        "bajorrelieves de bronce de su pedestal están inmortalizadas las " +
        "escenas de sus dramas más universales. Una de ellas es «La vida es " +
        "sueño», donde el príncipe Segismundo reflexiona sobre la libertad y " +
        "el destino.",
      enigma:
        "El gran dramaturgo en bronce contempla la plaza rodeado por sus " +
        "cuatro obras maestras esculpidas en metal. Busca el cuadro donde el " +
        "príncipe Segismundo yace encadenado descubriendo que toda la " +
        "existencia es una ilusión. Cuenta las figuras humanas de bronce " +
        "atrapadas en esa escena concreta. Junta la cantidad de figuras con " +
        "la palabra clave que da título a la ficción dramática.",
      answerFormat: "NÚMERO-PALABRA (ej.: 0-DRAMA)",
      hintSubtle:
        "Rodea el pedestal: son cuatro relieves, uno por obra. El que buscas " +
        "muestra a un hombre encadenado. «¿Qué es la vida? Un frenesí. ¿Qué " +
        "es la vida? Una ilusión…» — la última palabra del título es la " +
        "clave.",
      directions: [
        "Inspecciona las cuatro caras del pedestal de la estatua de Calderón de la Barca.",
        "Encuentra el relieve de «La vida es sueño» y cuenta las figuras humanas esculpidas.",
        "Une esa cifra con la palabra clave del título de la obra.",
      ],
      answer: "3-SUEÑO",
      acceptedAnswers: ["3-SUEÑO", "3 SUEÑO", "3SUEÑO", "3-sueno", "3 sueno"],
      revealExplanation:
        "La respuesta era 3-SUEÑO: tres figuras habitan el relieve de «La " +
        "vida es sueño», el drama donde Segismundo descubre que «los sueños, " +
        "sueños son».",
      transition: {
        type: "walk",
        text:
          "Sal de la plaza por la Calle del Príncipe hacia el norte, gira a " +
          "la izquierda por la Calle de la Cruz y continúa recto atravesando " +
          "la Calle de Gerona. El gran arco de piedra al final de la calle os " +
          "introducirá de lleno en el recinto porticado de la Plaza Mayor.",
      },
    },
    {
      id: "etapa_6_plaza_mayor",
      num: 6,
      title: "El Gran Teatro del Imperio — Clímax final",
      location: "Plaza Mayor",
      landmark: "Estatua Ecuestre de Felipe III",
      coords: { lat: 40.4155, lng: -3.7074 },
      photo: "img/etapa6.jpg",
      photoCaption:
        "«Fiesta real en la Plaza Mayor» (s. XVII) · Museo de Historia de Madrid",
      narrative:
        "¡Lo habéis conseguido! Habéis llegado al corazón palpitante del " +
        "Madrid de los Austrias: la Plaza Mayor. Inaugurada por Felipe III en " +
        "1619, esta gran plaza porticada fue el escenario imperial donde la " +
        "Corona mostraba su poder en corridas de toros, grandes mascaradas y " +
        "solemnes ceremonias. En el centro de la plaza se alza la estatua " +
        "ecuestre de Felipe III, moldeada en Florencia por los grandes " +
        "maestros del bronce Giambologna y Pietro Tacca. Para certificar " +
        "vuestra victoria y desbloquear el testamento real, debéis examinar " +
        "los símbolos y fechas grabados a los pies del caballo del rey.",
      enigma:
        "En el foro de la villa, el rey de bronce cabalga desde Florencia. " +
        "Mira las placas a los pies de la montura: encuentra el año de " +
        "cuatro dígitos en que los maestros toscanos concluyeron la estatua. " +
        "Cuenta después los escudos con castillos y leones que vigilan las " +
        "cuatro esquinas de la base del monumento. Une el año de fundición " +
        "florentina con el número de escudos esquineros para sellar la " +
        "victoria final.",
      answerFormat: "AÑO-NÚMERO (ej.: 1500-0)",
      hintSubtle:
        "El año que buscas coincide, curiosamente, con el de la muerte de " +
        "Cervantes… y los escudos son tantos como esquinas tiene la base.",
      directions: [
        "Colócate junto a la estatua ecuestre de Felipe III en el centro de la plaza.",
        "Encuentra en las placas del pedestal el año de fundición en Florencia.",
        "Cuenta los escudos heráldicos tallados en las esquinas de la base.",
      ],
      answer: "1616-4",
      acceptedAnswers: ["1616-4", "1616 4", "16164"],
      revealExplanation:
        "La clave final era 1616-4: la estatua se concluyó en Florencia en " +
        "1616 — el mismo año en que murieron Cervantes y Shakespeare — y " +
        "cuatro escudos custodian las esquinas de su base.",
      transition: { type: "victory" },
    },
  ];

/* ============================================================
   Utilidades
   ============================================================ */

function corsHeaders(env) {
  return {
    "Access-Control-Allow-Origin": env.ALLOWED_ORIGIN || "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function json(data, status, env) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders(env) },
  });
}

/* Código legible sin caracteres ambiguos (0/O, 1/I/L) */
function generateCode() {
  const alphabet = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
  let code = "";
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  for (const b of bytes) code += alphabet[b % alphabet.length];
  return `MADRID-${code}`;
}

/* Verificación de la firma del webhook de Stripe (esquema HMAC-SHA256
   documentado por Stripe), implementada con Web Crypto — sin SDK. */
async function verifyStripeSignature(rawBody, sigHeader, secret) {
  if (!sigHeader) return false;
  const parts = Object.fromEntries(
    sigHeader.split(",").map((p) => p.split("="))
  );
  const timestamp = parts.t;
  const signature = parts.v1;
  if (!timestamp || !signature) return false;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signedPayload = `${timestamp}.${rawBody}`;
  const mac = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(signedPayload)
  );
  const expected = [...new Uint8Array(mac)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return expected === signature;
}

async function stripeFetch(env, path, params) {
  const res = await fetch(`https://api.stripe.com/v1/${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(params).toString(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || "Error de Stripe");
  return data;
}

/* ============================================================
   Rutas
   ============================================================ */

/* POST /api/checkout — crea una sesión de pago y devuelve la URL
   a la que redirigir al comprador. */
async function handleCheckout(request, env) {
  const session = await stripeFetch(env, "checkout/sessions", {
    mode: "payment",
    "line_items[0][price]": env.STRIPE_PRICE_ID,
    "line_items[0][quantity]": "1",
    success_url: `${env.SITE_URL}/gracias.html?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${env.SITE_URL}/`,
  });
  return json({ url: session.url }, 200, env);
}

/* POST /api/stripe-webhook — Stripe notifica el pago confirmado.
   Genera el código de licencia y lo guarda en D1. */
async function handleWebhook(request, env) {
  const rawBody = await request.text();
  const sig = request.headers.get("Stripe-Signature");
  const valid = await verifyStripeSignature(rawBody, sig, env.STRIPE_WEBHOOK_SECRET);
  if (!valid) return new Response("firma inválida", { status: 400 });

  const event = JSON.parse(rawBody);
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const code = generateCode();
    await env.DB.prepare(
      `INSERT INTO licenses (code, stripe_session_id, email, status, created_at)
       VALUES (?, ?, ?, 'unused', ?)`
    )
      .bind(code, session.id, session.customer_details?.email || null, Date.now())
      .run();
  }
  return new Response("ok", { status: 200 });
}

/* GET /api/code-for-session?session_id=... — la página de "gracias"
   recupera el código recién generado para mostrarlo al comprador. */
async function handleCodeForSession(request, env) {
  const url = new URL(request.url);
  const sessionId = url.searchParams.get("session_id");
  if (!sessionId) return json({ error: "falta session_id" }, 400, env);

  const row = await env.DB.prepare(
    "SELECT code FROM licenses WHERE stripe_session_id = ?"
  )
    .bind(sessionId)
    .first();

  if (!row) {
    // el webhook de Stripe puede tardar unos segundos en llegar
    return json({ pending: true }, 202, env);
  }
  return json({ code: row.code }, 200, env);
}

/* POST /api/redeem — valida código + dispositivo y, si es correcto,
   entrega el contenido real del juego (las 6 pruebas). */
async function handleRedeem(request, env) {
  const { code, deviceId } = await request.json();
  if (!code || !deviceId) return json({ error: "faltan datos" }, 400, env);

  const normalized = code.trim().toUpperCase();
  const row = await env.DB.prepare("SELECT * FROM licenses WHERE code = ?")
    .bind(normalized)
    .first();

  if (!row) return json({ error: "Código no reconocido." }, 404, env);

  if (row.status === "unused") {
    await env.DB.prepare(
      "UPDATE licenses SET status='active', device_id=?, activated_at=? WHERE code=?"
    )
      .bind(deviceId, Date.now(), normalized)
      .run();
    return json({ stages: STAGES }, 200, env);
  }

  if (row.status === "active" && row.device_id === deviceId) {
    // reinstalación / reapertura del mismo dispositivo: se permite
    return json({ stages: STAGES }, 200, env);
  }

  return json(
    { error: "Este código ya está activado en otro dispositivo." },
    403,
    env
  );
}

/* ============================================================
   Entrada
   ============================================================ */
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders(env) });
    }

    try {
      if (url.pathname === "/api/checkout" && request.method === "POST")
        return await handleCheckout(request, env);

      if (url.pathname === "/api/stripe-webhook" && request.method === "POST")
        return await handleWebhook(request, env);

      if (url.pathname === "/api/code-for-session" && request.method === "GET")
        return await handleCodeForSession(request, env);

      if (url.pathname === "/api/redeem" && request.method === "POST")
        return await handleRedeem(request, env);

      return json({ error: "not found" }, 404, env);
    } catch (err) {
      return json({ error: err.message || "error interno" }, 500, env);
    }
  },
};
