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

  /* Prólogo histórico: pantalla previa al encargo de Don Baltasar, con
     el contexto general (la dinastía de los Austrias, el Siglo de Oro)
     antes de que el cronista pida ayuda para su misión concreta. */
  historicalContext: {
    title: {
      es: "El Siglo de Oro español",
      en: "The Spanish Golden Age",
      fr: "Le Siècle d'Or espagnol",
    },
    text: {
      es:
        "En 1516 subió al trono de España un joven de dieciséis años criado " +
        "en Flandes: Carlos I, nieto por parte de madre de los Reyes " +
        "Católicos y, por parte de padre, de la Casa de Austria, la " +
        "dinastía de los Habsburgo. Con él se unieron bajo una misma " +
        "corona los reinos de Castilla y Aragón, los territorios de los " +
        "Habsburgo en Centroeuropa y un imperio americano en plena " +
        "expansión. Así nació la dinastía de los Austrias, que gobernaría " +
        "España durante casi dos siglos, a través de cinco reyes: Carlos " +
        "I, Felipe II, Felipe III, Felipe IV y Carlos II." +
        "\n\n" +
        "Bajo su gobierno, España se convirtió en el primer imperio de la " +
        "historia sobre el que, se decía, nunca se ponía el sol: dominaba " +
        "territorios en Europa, América y Asia como ninguna otra potencia " +
        "de su tiempo. Y, paradójicamente, mientras el poder político del " +
        "imperio empezaba a resquebrajarse en el siglo XVII, las artes y " +
        "las letras españolas vivían su momento más brillante: es el " +
        "llamado Siglo de Oro, la época de Cervantes, Lope de Vega, " +
        "Calderón de la Barca, Velázquez o Quevedo, cuyas obras siguen " +
        "leyéndose y admirándose siglos después." +
        "\n\n" +
        "En esta aventura recorreréis algunos de los lugares donde se " +
        "escribió esa historia, cuando España dominaba el mundo: calles, " +
        "plazas y edificios que vieron pasar a reyes, escritores y " +
        "pintores, y que hoy siguen en pie, en el corazón de Madrid, " +
        "esperando a que alguien redescubra sus secretos.",
      en:
        "In 1516, a sixteen-year-old raised in Flanders climbed onto the " +
        "throne of Spain: Charles I, grandson of the Catholic Monarchs on " +
        "his mother's side and, on his father's side, of the House of " +
        "Austria, the Habsburg dynasty. With him, the kingdoms of Castile " +
        "and Aragon, the Habsburg territories in Central Europe, and a " +
        "rapidly expanding American empire were united under a single " +
        "crown. This was the birth of the House of Austria, which would " +
        "rule Spain for almost two centuries, through five kings: Charles " +
        "I, Philip II, Philip III, Philip IV and Charles II." +
        "\n\n" +
        "Under their rule, Spain became the first empire in history on " +
        "which, it was said, the sun never set: it held territories " +
        "across Europe, America and Asia like no other power of its " +
        "time. And, paradoxically, just as the empire's political power " +
        "began to crack in the 17th century, Spanish arts and letters " +
        "were living their brightest moment: the so-called Golden Age, " +
        "the era of Cervantes, Lope de Vega, Calderón de la Barca, " +
        "Velázquez and Quevedo, whose works are still read and admired " +
        "centuries later." +
        "\n\n" +
        "In this adventure you will walk through some of the places " +
        "where that history was written, when Spain ruled the world: " +
        "streets, squares and buildings that once saw kings, writers and " +
        "painters pass by, and that still stand today, in the heart of " +
        "Madrid, waiting for someone to rediscover their secrets.",
      fr:
        "En 1516, un jeune homme de seize ans élevé en Flandre monta sur " +
        "le trône d'Espagne : Charles Ier, petit-fils des Rois " +
        "Catholiques du côté maternel et, du côté paternel, de la maison " +
        "d'Autriche, la dynastie des Habsbourg. Avec lui s'unirent sous " +
        "une même couronne les royaumes de Castille et d'Aragon, les " +
        "territoires des Habsbourg en Europe centrale et un empire " +
        "américain en pleine expansion. Ainsi naquit la dynastie des " +
        "Habsbourg d'Espagne, qui gouvernerait le pays pendant près de " +
        "deux siècles, à travers cinq rois : Charles Ier, Philippe II, " +
        "Philippe III, Philippe IV et Charles II." +
        "\n\n" +
        "Sous leur règne, l'Espagne devint le premier empire de " +
        "l'histoire sur lequel, disait-on, le soleil ne se couchait " +
        "jamais : elle dominait des territoires en Europe, en Amérique et " +
        "en Asie comme aucune autre puissance de son temps. Et, " +
        "paradoxalement, tandis que le pouvoir politique de l'empire " +
        "commençait à se fissurer au XVIIe siècle, les arts et les " +
        "lettres espagnols vivaient leur moment le plus brillant : c'est " +
        "le fameux Siècle d'Or, l'époque de Cervantès, Lope de Vega, " +
        "Calderón de la Barca, Vélasquez ou Quevedo, dont les œuvres se " +
        "lisent et s'admirent encore des siècles plus tard." +
        "\n\n" +
        "Dans cette aventure, vous parcourrez certains des lieux où " +
        "s'est écrite cette histoire, quand l'Espagne dominait le monde : " +
        "des rues, des places et des bâtiments qui ont vu passer rois, " +
        "écrivains et peintres, et qui restent debout aujourd'hui, au " +
        "cœur de Madrid, attendant que quelqu'un redécouvre leurs " +
        "secrets.",
    },
    photo: "img/carlos_v.jpg",
    photoCaption: {
      es: "«Carlos V en la batalla de Mühlberg», Tiziano (1548) · Museo del Prado, Madrid",
      en: "\"Charles V at the Battle of Mühlberg,\" Titian (1548) · Museo del Prado, Madrid",
      fr: "« Charles Quint à la bataille de Mühlberg », Titien (1548) · Museo del Prado, Madrid",
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
