/* ============================================================
   EL TESTAMENTO DEL SIGLO DE ORO — Datos del juego
   Escape Room Urbano · Madrid de los Austrias (1561–1681)
   ============================================================ */

const GAME_DATA = {
  title: "El Testamento del Siglo de Oro",
  subtitle: "Escape Room Urbano · Madrid de los Austrias",
  city: "Madrid",
  period: "Siglo de Oro (1561–1681)",
  price: "19€ por equipo", // solo informativo: el precio real vive en Stripe

  /* El guía que acompaña a los jugadores durante toda la partida.
     Nombre ficticio con guiño a Jerónimo de Quintana, cronista real de
     Madrid y autor de su primera historia (1629). */
  narrator: {
    name: "Don Baltasar de Quintana",
    role: "Cronista Mayor de la Villa",
    avatar: "img/historiador.jpg",
    portrait: "img/historiador_retrato.jpg",
    portraitCaption:
      "«Retrato de un hombre», Diego Velázquez (c. 1630) · Apsley House, Londres",
    bio:
      "Nací en la Villa el año de 1601, bajo el reinado de Felipe III, y he " +
      "gastado la vida entera entre legajos, archivos y piedras con " +
      "inscripción. Serví de cronista a la Corte de los Austrias y conozco " +
      "cada esquina de este Madrid: quién la levantó, quién murió en ella y " +
      "qué secretos guarda. Hoy os necesito a vosotros, pues estos ojos " +
      "cansados ya no bastan para recuperar lo que se ha perdido.",
  },

  prologue: {
    title: "El encargo del Historiador",
    text:
      "Salud, investigadores. Me llamo Baltasar de Quintana, Cronista Mayor de " +
      "la Villa y guardián de los " +
      "archivos secretos del Madrid de los Austrias. Un documento perdido — el " +
      "Testamento del Siglo de Oro — fue sellado con seis claves ocultas en " +
      "piedra y bronce por las calles del viejo Madrid. Velázquez, Cervantes, " +
      "Lope de Vega, Calderón… todos dejaron su rastro. Vuestra misión: " +
      "recorrer la Villa, descifrar cada sello y recuperar el Testamento antes " +
      "de que sus secretos caigan en el olvido. La aventura comienza en la " +
      "Plaza de Oriente, frente al Palacio Real. ¡En marcha!",
    startLocation: "Plaza de Oriente",
    startCoords: { lat: 40.418, lng: -3.7126 },
    photo: "img/prologo.jpg",
    photoCaption:
      "Plano de Madrid de Pedro Texeira (1656) · Biblioteca Nacional de España",
    /* Georreferenciación del plano de Texeira: transformación afín que
       convierte lat/lng real en píxel (x,y) sobre img/prologo.jpg
       (960×770 px). Calibrada con 3 puntos identificables en el propio
       grabado y sus coordenadas reales: Plaza Mayor, Puerta del Sol y
       Plaza de la Villa. Al ser un mapa manuscrito del s. XVII (no una
       ortofoto), la posición resultante es aproximada, no exacta. */
    mapGeoref: {
      imageWidth: 960,
      imageHeight: 770,
      a: -5304.878048769218,
      b: 102896.34146342106,
      c: 596270.1951215196,
      d: -48231.70731729298,
      e: -14298.780487738779,
      f: 1896574.268301812,
    },
  },

  victory: {
    title: "¡ENHORABUENA, INVESTIGADORES DEL TIEMPO!",
    text:
      "Habéis descifrado el último sello del Testamento del Siglo de Oro en la " +
      "Plaza Mayor de Madrid. Gracias a vuestra perspicacia histórica y " +
      "capacidad de observación, los secretos mejor guardados de la Corte de " +
      "los Austrias quedan a salvo de las sombras del olvido.",
  },

  /* Las 6 pruebas (narrativa, enigmas, pistas y respuestas) NO viven
     aquí: se descargan del backend (backend/worker.js) solo tras validar
     un código de licencia de pago (ver js/license.js). Así el repo
     público no contiene ni las respuestas ni el guion de las pruebas —
     solo se sirven, por HTTPS, a quien ya ha pagado.
     Engine.state.stages sustituye a este array una vez desbloqueado. */
  stages: [],
};

/* Puntuación */
const SCORING = {
  stageBase: 1000,      // puntos por sello resuelto
  failPenalty: 100,     // por intento fallido
  revealPenalty: 250,   // adicional si se revela la respuesta
  googleBase: 500,      // por la prueba de Google
  speedBonus: 150,      // resolver a la primera en menos de 2 min
};
