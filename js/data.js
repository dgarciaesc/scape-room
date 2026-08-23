/* ============================================================
   EL TESTAMENTO DEL SIGLO DE ORO — Datos del juego
   Escape Room Urbano · Madrid de los Austrias (1561–1681)
   ============================================================ */

const GAME_DATA = {
  title: "El Testamento del Siglo de Oro",
  subtitle: "Escape Room Urbano · Madrid de los Austrias",
  city: "Madrid",
  period: "Siglo de Oro (1561–1681)",

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

  stages: [
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
  ],
};

/* Puntuación */
const SCORING = {
  stageBase: 1000,      // puntos por sello resuelto
  failPenalty: 100,     // por intento fallido
  revealPenalty: 250,   // adicional si se revela la respuesta
  googleBase: 500,      // por la prueba de Google
  speedBonus: 150,      // resolver a la primera en menos de 2 min
};
