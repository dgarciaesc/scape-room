/* ============================================================
   EL TESTAMENTO DEL SIGLO DE ORO — Datos del juego
   Escape Room Urbano · Madrid de los Austrias (1561–1681)
   ============================================================
   Los campos marcados {es,en,fr} son "nodos i18n": I18N.resolve()
   los sustituye por el texto del idioma elegido al arrancar la app
   (ver el final de este archivo). El resto de campos (coords, fotos,
   nombres de lugar) es el mismo en cualquier idioma. */

const GAME_DATA_I18N = {
  title: {
    es: "El Testamento del Siglo de Oro",
    en: "The Golden Age Testament",
    fr: "Le Testament du Siècle d'Or",
  },
  subtitle: {
    es: "Escape Room Urbano · Madrid de los Austrias",
    en: "Urban Escape Room · Habsburg Madrid",
    fr: "Escape Game Urbain · Madrid des Habsbourg",
  },
  city: "Madrid",
  price: { es: "19€ por equipo", en: "€19 per team", fr: "19 € par équipe" },

  /* El guía que acompaña a los jugadores durante toda la partida.
     Nombre ficticio con guiño a Jerónimo de Quintana, cronista real de
     Madrid y autor de su primera historia (1629). */
  narrator: {
    name: "Don Baltasar de Quintana",
    role: {
      es: "Cronista Mayor de la Villa",
      en: "Chief Chronicler of the Villa",
      fr: "Chroniqueur en chef de la Ville",
    },
    avatar: "img/historiador.jpg",
    portrait: "img/historiador_retrato.jpg",
    portraitCaption: {
      es: "«Retrato de un hombre», Diego Velázquez (c. 1630) · Apsley House, Londres",
      en: "\"Portrait of a Man,\" Diego Velázquez (c. 1630) · Apsley House, London",
      fr: "« Portrait d'un homme », Diego Velázquez (v. 1630) · Apsley House, Londres",
    },
    bio: {
      es:
        "Nací en la Villa el año de 1601, bajo el reinado de Felipe III, y he " +
        "gastado la vida entera entre legajos, archivos y piedras con " +
        "inscripción. Serví de cronista a la Corte de los Austrias y conozco " +
        "cada esquina de este Madrid: quién la levantó, quién murió en ella y " +
        "qué secretos guarda. Hoy os necesito a vosotros, pues estos ojos " +
        "cansados ya no bastan para recuperar lo que se ha perdido.",
      en:
        "I was born in the Villa in the year 1601, under the reign of Philip " +
        "III, and have spent my whole life among archives, records and " +
        "inscribed stones. I served as chronicler to the Court of the " +
        "Habsburgs and know every corner of this Madrid: who raised it, who " +
        "died in it, and what secrets it keeps. Today I need you, for these " +
        "tired eyes no longer suffice to recover what has been lost.",
      fr:
        "Je suis né dans la Ville en l'an 1601, sous le règne de Philippe " +
        "III, et j'ai passé toute ma vie parmi les archives, les registres et " +
        "les pierres gravées. J'ai servi comme chroniqueur à la Cour des " +
        "Habsbourg et connais chaque recoin de ce Madrid : qui l'a bâti, qui " +
        "y est mort et quels secrets il garde. Aujourd'hui j'ai besoin de " +
        "vous, car ces yeux fatigués ne suffisent plus à retrouver ce qui a " +
        "été perdu.",
    },
  },

  prologue: {
    title: {
      es: "El encargo del Historiador",
      en: "The Historian's Charge",
      fr: "La mission de l'Historien",
    },
    text: {
      es:
        "Salud, investigadores. Me llamo Baltasar de Quintana, Cronista Mayor de " +
        "la Villa y guardián de los " +
        "archivos secretos del Madrid de los Austrias. Un documento perdido — el " +
        "Testamento del Siglo de Oro — fue sellado con seis claves ocultas en " +
        "piedra y bronce por las calles del viejo Madrid. Velázquez, Cervantes, " +
        "Lope de Vega, Calderón… todos dejaron su rastro. Vuestra misión: " +
        "recorrer la Villa, descifrar cada sello y recuperar el Testamento antes " +
        "de que sus secretos caigan en el olvido. La aventura comienza en el " +
        "Barrio de las Letras, ante la casa de Lope de Vega. ¡En marcha!",
      en:
        "Greetings, investigators. My name is Baltasar de Quintana, Chief " +
        "Chronicler of the Villa and guardian of the secret archives of " +
        "Habsburg Madrid. A lost document — the Golden Age Testament — was " +
        "sealed with six clues hidden in stone and bronze throughout the " +
        "streets of old Madrid. Velázquez, Cervantes, Lope de Vega, " +
        "Calderón… all of them left their trace. Your mission: walk the " +
        "Villa, decipher each seal and recover the Testament before its " +
        "secrets fall into oblivion. The adventure begins in the Barrio " +
        "de las Letras, before the house of Lope de Vega. Onward!",
      fr:
        "Salut à vous, enquêteurs. Je m'appelle Baltasar de Quintana, " +
        "Chroniqueur en chef de la Ville et gardien des archives secrètes du " +
        "Madrid des Habsbourg. Un document perdu — le Testament du Siècle " +
        "d'Or — fut scellé par six indices cachés dans la pierre et le " +
        "bronze des rues du vieux Madrid. Velázquez, Cervantès, Lope de " +
        "Vega, Calderón… tous y ont laissé leur trace. Votre mission : " +
        "parcourir la Ville, déchiffrer chaque sceau et récupérer le " +
        "Testament avant que ses secrets ne sombrent dans l'oubli. " +
        "L'aventure commence dans le Barrio de las Letras, devant la " +
        "maison de Lope de Vega. En route !",
    },
    startLocation: "Calle de Cervantes, 11",
    startCoords: { lat: 40.414, lng: -3.6976 },
    photo: "img/prologo.jpg",
    photoCaption: {
      es: "Plano de Madrid de Pedro Texeira (1656) · Biblioteca Nacional de España",
      en: "Map of Madrid by Pedro Texeira (1656) · Biblioteca Nacional de España",
      fr: "Plan de Madrid par Pedro Texeira (1656) · Biblioteca Nacional de España",
    },
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
    title: {
      es: "¡ENHORABUENA, INVESTIGADORES DEL TIEMPO!",
      en: "CONGRATULATIONS, TIME INVESTIGATORS!",
      fr: "FÉLICITATIONS, ENQUÊTEURS DU TEMPS !",
    },
    text: {
      es:
        "Habéis descifrado el último sello del Testamento del Siglo de Oro en la " +
        "Plaza de Oriente, frente al Palacio Real de Madrid. Gracias a " +
        "vuestra perspicacia histórica y capacidad de observación, los " +
        "secretos mejor guardados de la Corte de los Austrias quedan a " +
        "salvo de las sombras del olvido.",
      en:
        "You have deciphered the last seal of the Golden Age Testament in " +
        "Plaza de Oriente, facing Madrid's Royal Palace. Thanks to your " +
        "historical insight and powers of observation, the best-kept " +
        "secrets of the Habsburg Court are safe from the shadows of " +
        "oblivion.",
      fr:
        "Vous avez déchiffré le dernier sceau du Testament du Siècle d'Or " +
        "Plaza de Oriente, face au Palais Royal de Madrid. Grâce à votre " +
        "perspicacité historique et à votre sens de l'observation, les " +
        "secrets les mieux gardés de la Cour des Habsbourg sont désormais " +
        "à l'abri de l'oubli.",
    },
  },

  /* Las 6 pruebas (narrativa, enigmas, pistas y respuestas) NO viven
     aquí: se descargan del backend (backend/worker.js) solo tras validar
     un código de licencia de pago (ver js/license.js). Así el repo
     público no contiene ni las respuestas ni el guion de las pruebas —
     solo se sirven, por HTTPS, a quien ya ha pagado.
     Engine.state.stages sustituye a este array una vez desbloqueado. */
  stages: [],
};

/* GAME_DATA es la versión "resuelta" para el idioma activo: el resto
   de la app (app.js, engine.js) sigue leyendo GAME_DATA.title,
   GAME_DATA.prologue.text, etc. como texto plano de siempre — la
   traducción es transparente para ellos. applyLanguage() se llama al
   arrancar y cada vez que el jugador cambia de idioma. */
const GAME_DATA = {};

function applyLanguage(lang) {
  const stagesBackup = GAME_DATA.stages; // no perder las etapas ya descargadas
  Object.assign(GAME_DATA, I18N.resolve(GAME_DATA_I18N, lang));
  if (stagesBackup && stagesBackup.length && !GAME_DATA_I18N.stages.length) {
    GAME_DATA.stages = stagesBackup;
  }
}
applyLanguage(I18N.getLang() || I18N.detectDefault() || "es");

/* Puntuación */
const SCORING = {
  stageBase: 1000,      // puntos por sello resuelto
  failPenalty: 100,     // por intento fallido
  revealPenalty: 250,   // adicional si se revela la respuesta
  googleBase: 500,      // por la prueba de Google
  speedBonus: 150,      // resolver a la primera en menos de 2 min
};
