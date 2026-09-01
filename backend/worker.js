/* ============================================================
   EL TESTAMENTO DEL SIGLO DE ORO — Backend de licencias
   Cloudflare Worker · sin dependencias · desplegable copiando y
   pegando este archivo en el panel de Cloudflare (Quick Edit).
   ============================================================

   RUTAS:
     POST /api/checkout          → crea una sesión de pago (Stripe)
     POST /api/stripe-webhook    → Stripe notifica el pago; genera el código
     GET  /api/code-for-session  → la página de "gracias" recupera el código
     POST /api/redeem            → valida código + dispositivo, entrega el
                                    juego en el idioma pedido (es/en/fr)

   VARIABLES DE ENTORNO NECESARIAS (Settings → Variables del Worker):
     STRIPE_SECRET_KEY     (Encrypt) — clave secreta de Stripe (sk_live_...)
     STRIPE_WEBHOOK_SECRET (Encrypt) — firma del webhook (whsec_...)
     STRIPE_PRICE_ID                 — ID del precio creado en Stripe (price_...)
     SITE_URL                        — https://dgarciaesc.github.io/scape-room (con ruta)
     ALLOWED_ORIGIN                  — https://dgarciaesc.github.io (SIN ruta: el navegador
                                        nunca incluye la ruta en la cabecera Origin)

   BINDING NECESARIO:
     DB → la base de datos D1 creada con schema.sql
   ============================================================ */

/* ---------- i18n: mismo motor que js/i18n.js del frontend ----------
   Un "nodo i18n" es un objeto con únicamente claves es/en/fr. resolve()
   recorre las 6 pruebas y sustituye cada nodo por el texto del idioma
   pedido (con español de red de seguridad si falta una traducción). */
const LANGS = ["es", "en", "fr"];

function isI18nNode(node) {
  if (!node || typeof node !== "object" || Array.isArray(node)) return false;
  const keys = Object.keys(node);
  return keys.length > 0 && keys.every((k) => LANGS.includes(k)) && "es" in node;
}

function resolveI18n(node, lang) {
  if (Array.isArray(node)) return node.map((x) => resolveI18n(x, lang));
  if (node && typeof node === "object") {
    if (isI18nNode(node)) {
      const val = node[lang] !== undefined ? node[lang] : node.es;
      return resolveI18n(val, lang);
    }
    const out = {};
    for (const k in node) out[k] = resolveI18n(node[k], lang);
    return out;
  }
  return node;
}

/* ---------- Contenido real del juego: las 6 pruebas ----------
   Esto es lo que antes vivía en js/data.js. Ahora solo se entrega
   tras validar una licencia — por eso el repo público ya no contiene
   ni los enigmas ni las respuestas.
   Los campos {es,en,fr} se traducen; el resto (coords, fotos,
   respuestas) es igual en cualquier idioma, porque son transcripción
   literal de piedra, latín o cifras — no cambian con el idioma de la
   interfaz. */
const STAGES_I18N = [
  {
    id: "etapa_1_plaza_oriente",
    num: 1,
    title: {
      es: "La Corte de Velázquez y el Alcázar",
      en: "The Court of Velázquez and the Alcázar",
      fr: "La Cour de Velázquez et l'Alcázar",
    },
    location: "Plaza de Oriente",
    landmark: {
      es: "Estatua Ecuestre de Felipe IV",
      en: "Equestrian Statue of Philip IV",
      fr: "Statue équestre de Philippe IV",
    },
    coords: { lat: 40.418, lng: -3.7126 },
    photo: "img/etapa1.jpg",
    photoCaption: {
      es: "«Las Meninas», Diego Velázquez (1656), pintado en el Alcázar · Museo del Prado",
      en: "\"Las Meninas,\" Diego Velázquez (1656), painted in the Alcázar · Museo del Prado",
      fr: "« Les Ménines », Diego Velázquez (1656), peint dans l'Alcázar · Museo del Prado",
    },
    narrative: {
      es:
        "¡Atención, investigadores! Os halláis en el antiguo solar del Alcázar " +
        "Real de los Austrias, la fortaleza medieval donde Diego Velázquez " +
        "instaló su taller y pintó «Las Meninas». Ante vosotros se alza la " +
        "impresionante estatua de Felipe IV, la primera estatua ecuestre del " +
        "mundo sostenida únicamente sobre las patas traseras del caballo " +
        "gracias a los cálculos del mismísimo Galileo Galilei. Pero el rey no " +
        "está solo: a los pies de su montura, otros guardianes vigilan en " +
        "silencio. Para abrir el primer archivo de la dinastía, fijaos bien " +
        "en quién custodia el pedestal.",
      en:
        "Attention, investigators! You stand on the ancient site of the " +
        "Habsburgs' Royal Alcázar, the medieval fortress where Diego " +
        "Velázquez set up his workshop and painted \"Las Meninas.\" Before " +
        "you rises the imposing statue of Philip IV, the first equestrian " +
        "statue in the world held up solely on the horse's hind legs, thanks " +
        "to the calculations of Galileo Galilei himself. But the king is " +
        "not alone: at his mount's feet, other guardians keep silent watch. " +
        "To open the dynasty's first file, look closely at who guards the " +
        "pedestal.",
      fr:
        "Attention, enquêteurs ! Vous vous trouvez sur l'ancien emplacement " +
        "de l'Alcázar Royal des Habsbourg, la forteresse médiévale où Diego " +
        "Velázquez installa son atelier et peignit « Les Ménines ». Devant " +
        "vous se dresse l'imposante statue de Philippe IV, la première " +
        "statue équestre au monde tenue uniquement sur les pattes arrière du " +
        "cheval, grâce aux calculs de Galilée lui-même. Mais le roi n'est " +
        "pas seul : aux pieds de sa monture, d'autres gardiens veillent en " +
        "silence. Pour ouvrir le premier dossier de la dynastie, observez " +
        "bien qui garde le piédestal.",
    },
    enigma: {
      es:
        "El rey de bronce desafía la gravedad gracias al sabio de Pisa. Pero " +
        "no miréis arriba, sino abajo: rodead la base de piedra del pedestal " +
        "a ras de suelo. En cada una de sus cuatro esquinas descansa, " +
        "tumbado y silencioso, el mismo animal heráldico — el símbolo de la " +
        "Corona que Felipe IV encarnaba. Identificad qué animal es y contad " +
        "cuántos hay. Alzad después la vista hacia el remate del tejado del " +
        "gran palacio que cierra la plaza: allí se iba a esculpir en piedra " +
        "toda la dinastía de los reyes de España —los mismos veinte que hoy " +
        "custodian los jardines a vuestro alrededor—, pero un rey de gustos " +
        "más sobrios ordenó cambiar el proyecto por algo más discreto. ¿Qué " +
        "pequeños objetos de piedra, repetidos uno tras otro, coronan hoy la " +
        "balaustrada en su lugar? Unid esa palabra al número de guardianes " +
        "para sellar la clave.",
      en:
        "The bronze king defies gravity thanks to the sage of Pisa. But " +
        "don't look up — look down: walk around the stone base of the " +
        "pedestal at ground level. On each of its four corners lies the " +
        "same heraldic animal, silent and resting — the symbol of the Crown " +
        "Philip IV embodied. Identify the animal and count how many there " +
        "are. Then raise your eyes to the roofline of the great palace " +
        "closing off the square: it was meant to be crowned in stone by " +
        "the entire dynasty of Spanish kings — the same twenty that now " +
        "stand guard in the gardens around you — but a king with more " +
        "sober tastes had the plan changed for something plainer. What " +
        "small stone objects, repeated one after another, crown the " +
        "balustrade there today? Join that word with the number of " +
        "guardians to seal the key.",
      fr:
        "Le roi de bronze défie la gravité grâce au sage de Pise. Mais ne " +
        "regardez pas en haut, regardez en bas : faites le tour de la base " +
        "en pierre du piédestal, au ras du sol. À chacun de ses quatre " +
        "angles repose, couché et silencieux, le même animal héraldique — " +
        "le symbole de la Couronne que Philippe IV incarnait. Identifiez cet " +
        "animal et comptez combien il y en a. Levez ensuite les yeux vers " +
        "le couronnement du toit du grand palais qui ferme la place : on " +
        "prévoyait d'y sculpter en pierre toute la dynastie des rois " +
        "d'Espagne — les vingt mêmes qui montent aujourd'hui la garde dans " +
        "les jardins autour de vous —, mais un roi aux goûts plus sobres " +
        "fit remplacer le projet par quelque chose de plus discret. Quels " +
        "petits objets de pierre, répétés les uns après les autres, " +
        "couronnent aujourd'hui la balustrade à leur place ? Associez ce " +
        "mot au nombre de gardiens pour sceller la clé.",
    },
    answerFormat: {
      es: "PALABRA-NÚMERO (ej.: EJEMPLO-3)",
      en: "WORD-NUMBER (e.g.: EXAMPLE-3)",
      fr: "MOT-NOMBRE (ex. : EXEMPLE-3)",
    },
    hintSubtle: {
      es:
        "Los cuatro guardianes son felinos, a pie de calle en las esquinas " +
        "del pedestal. En cuanto a la balaustrada del tejado: no busquéis " +
        "figuras humanas, sino objetos redondeados, como pequeñas vasijas " +
        "de piedra, repetidos a lo largo de todo el remate.",
      en:
        "The four guardians are felines, right at street level on the " +
        "pedestal's corners. As for the roofline balustrade: don't look " +
        "for human figures — look for rounded objects, like small stone " +
        "vases, repeated all along the top.",
      fr:
        "Les quatre gardiens sont des félins, au niveau de la rue, aux " +
        "angles du piédestal. Quant à la balustrade du toit : ne cherchez " +
        "pas de silhouettes humaines, mais des objets arrondis, comme de " +
        "petits vases de pierre, répétés tout le long du couronnement.",
    },
    directions: {
      es: [
        "Acércate al pedestal de la estatua ecuestre de Felipe IV en el centro de la Plaza de Oriente.",
        "Rodea la base de piedra, a ras de suelo, y cuenta el animal de bronce que vigila cada una de las cuatro esquinas.",
        "Alza la vista hacia el remate del tejado del Palacio Real: fíjate en los pequeños objetos de piedra que coronan la balaustrada, uno tras otro.",
      ],
      en: [
        "Go to the pedestal of the equestrian statue of Philip IV in the centre of Plaza de Oriente.",
        "Walk around the stone base at ground level and count the bronze animal watching over each of the four corners.",
        "Raise your eyes to the roofline of the Royal Palace: look for the small stone objects crowning the balustrade, one after another.",
      ],
      fr: [
        "Approchez-vous du piédestal de la statue équestre de Philippe IV, au centre de la Plaza de Oriente.",
        "Faites le tour de la base en pierre, au ras du sol, et comptez l'animal de bronze qui veille à chacun des quatre angles.",
        "Levez les yeux vers le couronnement du toit du Palais Royal : repérez les petits objets de pierre qui couronnent la balustrade, les uns après les autres.",
      ],
    },
    answer: "JARRONES-4",
    acceptedAnswers: [
      "JARRONES-4", "JARRONES 4", "JARRONES4", "jarrones-4",
      "JARRON-4", "jarron-4",
      "VASIJAS-4", "vasijas-4",
      "URNAS-4", "urnas-4",
      "VASES-4", "vases-4", "VASE-4", "vase-4",
      "URNS-4", "urns-4", "URN-4", "urn-4",
      "URNES-4", "urnes-4", "URNE-4", "urne-4",
    ],
    revealExplanation: {
      es:
        "La respuesta era JARRONES-4. La balaustrada del Palacio Real iba a " +
        "coronarse con las estatuas de todos los reyes de España —las " +
        "mismas veinte que hoy descansan en los jardines de la plaza—, " +
        "pero Carlos III, de gustos más sobrios, las sustituyó por una " +
        "hilera de jarrones de piedra. Y cuatro son los leones de bronce " +
        "que custodian las esquinas del pedestal.",
      en:
        "The answer was JARRONES-4 (Spanish for \"vases\"). The Royal " +
        "Palace's balustrade was meant to be crowned with statues of " +
        "every king of Spain — the same twenty that now rest in the " +
        "square's gardens — but Charles III, with more sober tastes, " +
        "replaced them with a row of stone vases. And four bronze lions " +
        "guard the corners of the pedestal.",
      fr:
        "La réponse était JARRONES-4 (« vases » en espagnol). La " +
        "balustrade du Palais Royal devait être couronnée des statues de " +
        "tous les rois d'Espagne — les vingt mêmes qui reposent aujourd'hui " +
        "dans les jardins de la place —, mais Charles III, aux goûts plus " +
        "sobres, les remplaça par une rangée de vases de pierre. Et quatre " +
        "lions de bronze gardent les angles du piédestal.",
    },
    transition: {
      type: "walk",
      text: {
        es:
          "Camina en dirección este por la Calle Mayor (dejando la catedral " +
          "de la Almudena y el palacio a tus espaldas). A unos 200 metros " +
          "encontraréis a mano derecha la apertura de la plaza medieval " +
          "presidida por la Torre de los Lujanes: la Plaza de la Villa.",
        en:
          "Walk east along Calle Mayor (leaving the Almudena Cathedral and " +
          "the palace behind you). After about 200 metres you'll find, on " +
          "your right, the opening of the medieval square presided over by " +
          "the Torre de los Lujanes: Plaza de la Villa.",
        fr:
          "Marchez vers l'est le long de la Calle Mayor (en laissant la " +
          "cathédrale de l'Almudena et le palais derrière vous). Après " +
          "environ 200 mètres, vous trouverez sur votre droite l'ouverture " +
          "de la place médiévale dominée par la Torre de los Lujanes : la " +
          "Plaza de la Villa.",
      },
    },
  },

  {
    id: "etapa_2_plaza_villa",
    num: 2,
    title: {
      es: "El Traslado de la Corte (1561)",
      en: "The Transfer of the Court (1561)",
      fr: "Le Transfert de la Cour (1561)",
    },
    location: "Plaza de la Villa",
    landmark: {
      es: "Estatua de Álvaro de Bazán",
      en: "Statue of Álvaro de Bazán",
      fr: "Statue d'Álvaro de Bazán",
    },
    freeTourIntro: {
      es: "Mientras camináis hacia la Plaza de la Villa, dejadme contaros su historia. Es una de las plazas más antiguas de Madrid, corazón político de la villa ya en la Edad Media. Fijaos, al llegar, en la torre almenada de ladrillo y piedra: es la Torre de los Lujanes, el edificio civil más antiguo de Madrid, del siglo XV. Cuenta la leyenda que allí estuvo preso el rey Francisco I de Francia, capturado por las tropas de Carlos V en la batalla de Pavía de 1525 — aunque, a decir verdad, solo pasó allí unos pocos días mientras le preparaban aposentos más cómodos en el Alcázar. Su cautiverio en Madrid, entre la Torre, el Alcázar y otros palacios, se prolongó casi once meses, hasta que en enero de 1526 firmó el Tratado de Madrid, renunciando a sus derechos sobre Nápoles, Milán, Flandes y Borgoña — un tratado que, por cierto, rompió en cuanto puso un pie fuera de España. Justo al lado, la Casa de Cisneros, un palacio plateresco de 1537 mandado construir por el sobrino del cardenal Cisneros, también guarda fama de haber servido de prisión, esta vez para Antonio Pérez, el todopoderoso secretario de Felipe II caído en desgracia. Frente a la torre, el antiguo Ayuntamiento, que Juan Gómez de Mora empezó a construir en 1644. Hoy la plaza vive tranquila, a menudo escenario de bodas civiles y pequeños conciertos al aire libre.",
      en: "As you walk toward Plaza de la Villa, let me tell you its story. It's one of Madrid's oldest squares, the town's political heart already in the Middle Ages. When you arrive, look for the battlemented brick-and-stone tower: that's the Torre de los Lujanes, Madrid's oldest civil building, dating to the 15th century. Legend has it that King Francis I of France was held prisoner there, captured by Charles V's troops at the Battle of Pavia in 1525 — though, in truth, he only spent a few days there while more comfortable quarters were prepared for him at the Alcázar. His captivity in Madrid, split between the Tower, the Alcázar and other palaces, dragged on for nearly eleven months, until in January 1526 he signed the Treaty of Madrid, renouncing his claims to Naples, Milan, Flanders and Burgundy — a treaty he broke, incidentally, the moment he set foot outside Spain. Right next door, the Casa de Cisneros, a Plateresque palace from 1537 built for the nephew of Cardinal Cisneros, is also said to have served as a prison — this time for Antonio Pérez, Philip II's once all-powerful secretary who fell from grace. Facing the tower, the old City Hall, which Juan Gómez de Mora began building in 1644. Today the square lives quietly, often hosting civil weddings and small open-air concerts.",
      fr: "En marchant vers la Plaza de la Villa, laissez-moi vous raconter son histoire. C'est l'une des plus anciennes places de Madrid, cœur politique de la ville dès le Moyen Âge. En arrivant, repérez la tour crénelée de brique et de pierre : c'est la Torre de los Lujanes, le plus ancien bâtiment civil de Madrid, datant du XVe siècle. La légende raconte que le roi François Ier de France y fut retenu prisonnier, capturé par les troupes de Charles Quint à la bataille de Pavie en 1525 — bien qu'en réalité, il n'y passa que quelques jours, le temps qu'on lui prépare des appartements plus confortables à l'Alcázar. Sa captivité à Madrid, répartie entre la Tour, l'Alcázar et d'autres palais, dura près de onze mois, jusqu'à ce qu'en janvier 1526 il signe le traité de Madrid, renonçant à ses droits sur Naples, Milan, la Flandre et la Bourgogne — un traité qu'il rompit d'ailleurs dès qu'il eut posé le pied hors d'Espagne. Juste à côté, la Casa de Cisneros, un palais plateresque de 1537 construit pour le neveu du cardinal Cisneros, aurait elle aussi servi de prison — cette fois pour Antonio Pérez, le tout-puissant secrétaire de Philippe II tombé en disgrâce. Face à la tour, l'ancien hôtel de ville, dont Juan Gómez de Mora commença la construction en 1644. Aujourd'hui, la place vit paisiblement, accueillant souvent des mariages civils et de petits concerts en plein air.",
    },
    freeTourPhoto: "img/freetour2.jpg",
    freeTourPhotoCaption: {
      es: "Francisco I de Francia, por Jean Clouet (h. 1530) · Museo del Louvre",
      en: "Francis I of France, by Jean Clouet (c. 1530) · Louvre Museum",
      fr: "François Ier de France, par Jean Clouet (v. 1530) · Musée du Louvre",
    },
    coords: { lat: 40.4154, lng: -3.71 },
    photo: "img/etapa2.jpg",
    photoCaption: {
      es: "«La batalla de Lepanto» (1571), anónimo · National Maritime Museum",
      en: "\"The Battle of Lepanto\" (1571), anonymous · National Maritime Museum",
      fr: "« La bataille de Lépante » (1571), anonyme · National Maritime Museum",
    },
    narrative: {
      es:
        "Habéis llegado al corazón del Madrid medieval. En mayo de 1561, el " +
        "rey Felipe II firmó el decreto que cambió para siempre el destino de " +
        "esta villa, convirtiéndola en la capital del Imperio Español. En el " +
        "centro de la plaza se yergue la estatua de don Álvaro de Bazán, el " +
        "almirante que jamás conoció la derrota en el mar y cuyo valor " +
        "fascinó a los mejores poetas del Siglo de Oro. Lope de Vega en " +
        "persona quiso rendirle tributo grabando en la piedra del pedestal " +
        "unos versos eternos. Ahí se oculta el salvoconducto de la Corte.",
      en:
        "You have reached the heart of medieval Madrid. In May 1561, King " +
        "Philip II signed the decree that changed this town's destiny " +
        "forever, turning it into the capital of the Spanish Empire. In the " +
        "centre of the square stands the statue of Don Álvaro de Bazán, the " +
        "admiral who never knew defeat at sea and whose courage captivated " +
        "the finest poets of the Golden Age. Lope de Vega himself wished to " +
        "pay him tribute by carving eternal verses into the stone of his " +
        "pedestal. That is where the Court's safe-conduct lies hidden.",
      fr:
        "Vous voici au cœur du Madrid médiéval. En mai 1561, le roi " +
        "Philippe II signa le décret qui allait à jamais changer le destin " +
        "de cette ville, en faisant la capitale de l'Empire espagnol. Au " +
        "centre de la place se dresse la statue de don Álvaro de Bazán, " +
        "l'amiral qui ne connut jamais la défaite en mer et dont le courage " +
        "fascina les plus grands poètes du Siècle d'Or. Lope de Vega " +
        "lui-même voulut lui rendre hommage en gravant des vers éternels " +
        "dans la pierre de son piédestal. C'est là que se cache le " +
        "laissez-passer de la Cour.",
    },
    enigma: {
      es:
        "El invicto marino da la espalda al secreto que el «Fénix de los " +
        "Ingenios» le dedicó en la piedra. Lee los versos tras el monumento y " +
        "descubre la célebre batalla naval donde la armada turca encontró su " +
        "espanto. Cuenta las letras que forman el nombre de esa mítica " +
        "batalla y antepón esa cifra a la palabra para sellar la cédula real " +
        "de 1561.",
      en:
        "The undefeated sailor turns his back on the secret that the " +
        "'Phoenix of Wits' dedicated to him in stone. Read the verses behind " +
        "the monument and discover the famous naval battle where the " +
        "Turkish fleet met its terror. Count the letters that spell the " +
        "name of that legendary battle and place that number before the " +
        "word to seal the royal decree of 1561.",
      fr:
        "L'invaincu marin tourne le dos au secret que le « Phénix des " +
        "Esprits » lui a dédié dans la pierre. Lisez les vers gravés " +
        "derrière le monument et découvrez la célèbre bataille navale où la " +
        "flotte turque connut l'épouvante. Comptez les lettres qui composent " +
        "le nom de cette bataille légendaire et placez ce chiffre devant le " +
        "mot pour sceller la cédule royale de 1561.",
    },
    answerFormat: {
      es: "NÚMERO-PALABRA (ej.: 0-BATALLA)",
      en: "NUMBER-WORD (e.g.: 0-BATTLE)",
      fr: "NOMBRE-MOT (ex. : 0-BATAILLE)",
    },
    hintSubtle: {
      es:
        "Rodea la estatua: el poema está grabado detrás. La batalla que " +
        "buscas se libró en 1571 en aguas griegas, y en ella también combatió " +
        "un tal Miguel de Cervantes, que perdió allí el uso de una mano.",
      en:
        "Walk around the statue: the poem is carved on the back. The battle " +
        "you seek was fought in 1571 in Greek waters, and a certain Miguel " +
        "de Cervantes fought in it too, losing the use of one hand there.",
      fr:
        "Faites le tour de la statue : le poème est gravé au dos. La " +
        "bataille que vous cherchez fut livrée en 1571 dans les eaux " +
        "grecques, et un certain Miguel de Cervantès y combattit aussi, y " +
        "perdant l'usage d'une main.",
    },
    directions: {
      es: [
        "Ve detrás de la estatua de Álvaro de Bazán en el centro de la Plaza de la Villa.",
        "Lee el poema grabado en la piedra e identifica la batalla naval que menciona.",
        "Cuenta el número de letras que forman el nombre de esa batalla y antepón la cifra a la palabra.",
      ],
      en: [
        "Go behind the statue of Álvaro de Bazán in the centre of Plaza de la Villa.",
        "Read the poem carved in the stone and identify the naval battle it mentions.",
        "Count how many letters spell the name of that battle and put the number before the word.",
      ],
      fr: [
        "Passez derrière la statue d'Álvaro de Bazán, au centre de la Plaza de la Villa.",
        "Lisez le poème gravé dans la pierre et identifiez la bataille navale qu'il mentionne.",
        "Comptez le nombre de lettres du nom de cette bataille et placez le chiffre devant le mot.",
      ],
    },
    answer: "7-LEPANTO",
    acceptedAnswers: [
      "7-LEPANTO", "7 LEPANTO", "7LEPANTO", "7-lepanto", "7 lepanto",
      "7-LEPANTE", "7 LEPANTE", "7-lepante", "7 lepante", // grafía francesa
    ],
    revealExplanation: {
      es:
        "La respuesta era 7-LEPANTO. Los versos de Lope evocan Lepanto " +
        "(1571), «la más alta ocasión que vieron los siglos», donde la Santa " +
        "Liga aplastó a la armada otomana. Siete letras forman su nombre.",
      en:
        "The answer was 7-LEPANTO. Lope's verses evoke Lepanto (1571), " +
        "'the loftiest hour the centuries beheld,' where the Holy League " +
        "crushed the Ottoman fleet. Seven letters spell its name.",
      fr:
        "La réponse était 7-LEPANTO. Les vers de Lope évoquent Lépante " +
        "(1571), « la plus haute heure que virent les siècles », où la " +
        "Sainte Ligue écrasa la flotte ottomane. Sept lettres composent son " +
        "nom.",
    },
    transition: {
      type: "google",
      text: {
        es:
          "Para adentraros en el Barrio de las Letras hacia la casa del " +
          "dramaturgo más prolífico de la época, necesitaréis por única vez " +
          "la ayuda de vuestro buscador de internet.",
        en:
          "To make your way into the Barrio de las Letras, toward the house " +
          "of the era's most prolific playwright, you will need — just this " +
          "once — the help of your internet search engine.",
        fr:
          "Pour vous rendre dans le Barrio de las Letras, jusqu'à la maison " +
          "du dramaturge le plus prolifique de l'époque, vous aurez besoin " +
          "— une seule fois — de l'aide de votre moteur de recherche.",
      },
      question: {
        es:
          "¿En qué calle y número exacto del centro de Madrid se halla la " +
          "Casa-Museo de Lope de Vega, situada en una vía dedicada " +
          "irónicamente a su archienemigo Cervantes?",
        en:
          "On which street and exact number in central Madrid is the Lope " +
          "de Vega House-Museum located, on a street ironically dedicated to " +
          "his arch-rival Cervantes?",
        fr:
          "Dans quelle rue et à quel numéro exact du centre de Madrid se " +
          "trouve la Maison-Musée de Lope de Vega, située — ironie du sort " +
          "— dans une rue dédiée à son grand rival Cervantès ?",
      },
      answer: "Calle de Cervantes, 11",
      acceptedKeywords: ["cervantes", "11"],
      hintSubtle: {
        es:
          "Busca en Google «Casa Museo Lope de Vega Madrid dirección». La " +
          "ironía: el Fénix vivió en la calle de su mayor rival literario.",
        en:
          "Search Google for 'Lope de Vega House Museum Madrid address.' " +
          "The irony: the Phoenix lived on the street of his greatest " +
          "literary rival.",
        fr:
          "Cherchez sur Google « Maison Musée Lope de Vega Madrid adresse ». " +
          "L'ironie : le Phénix vécut dans la rue de son plus grand rival " +
          "littéraire.",
      },
      directions: {
        es: [
          "Abre Google y busca: «Casa Museo Lope de Vega Madrid dirección».",
          "Escribe la calle y el número que aparezcan (Calle de Cervantes, 11).",
        ],
        en: [
          "Open Google and search: 'Lope de Vega House Museum Madrid address.'",
          "Write down the street and number that appear (Calle de Cervantes, 11).",
        ],
        fr: [
          "Ouvrez Google et cherchez : « Maison Musée Lope de Vega Madrid adresse ».",
          "Notez la rue et le numéro qui apparaissent (Calle de Cervantes, 11).",
        ],
      },
      walkText: {
        es:
          "Perfecto. Poned rumbo al Barrio de las Letras: la Casa-Museo de " +
          "Lope de Vega os espera en la Calle de Cervantes, 11 (unos 20 " +
          "minutos a pie hacia el este, cruzando la Puerta del Sol).",
        en:
          "Perfect. Head for the Barrio de las Letras: the Lope de Vega " +
          "House-Museum awaits you at Calle de Cervantes, 11 (about 20 " +
          "minutes on foot heading east, crossing Puerta del Sol).",
        fr:
          "Parfait. Direction le Barrio de las Letras : la Maison-Musée de " +
          "Lope de Vega vous attend au Calle de Cervantes, 11 (environ 20 " +
          "minutes à pied vers l'est, en traversant la Puerta del Sol).",
      },
    },
  },

  {
    id: "etapa_3_casa_lope_vega",
    num: 3,
    title: {
      es: "El Duelo de las Plumas",
      en: "The Duel of the Quills",
      fr: "Le Duel des Plumes",
    },
    location: "Calle de Cervantes, 11",
    landmark: {
      es: "Dintel de la Casa-Museo de Lope de Vega",
      en: "Lintel of the Lope de Vega House-Museum",
      fr: "Linteau de la Maison-Musée de Lope de Vega",
    },
    freeTourIntro: {
      es: "De camino a la Casa de Lope de Vega, un poco de contexto. El propio Fénix de los Ingenios mandó construir esta casa hacia 1610, tras años de vivir de alquiler en alquiler, y vivió en ella hasta su muerte en 1635. Cultivaba con sus propias manos un pequeño huerto que llamaba cariñosamente «mi güertecillo» y menciona con ternura en sus cartas — todavía hoy se puede visitar, recreado con las plantas de la época. Escribió, según él mismo alardeaba, más de 1.500 comedias — una cifra tan desmesurada que su rival Cervantes, medio en broma medio en serio, lo llamó «monstruo de la naturaleza». Pero tras esa fachada prolífica se escondía una vida sentimental turbulenta: aquí, ya viudo y sacerdote (se ordenó tras la muerte de su segunda esposa), vivió su última gran pasión, Marta de Nevares, a la que llamaba Amarilis en sus versos. La relación, escandalosa para la época, terminó en tragedia: Marta se quedó ciega y, hacia el final, perdió la razón, muriendo en 1628 sin que Lope dejara nunca de cuidarla. Con el tiempo la casa cayó en el olvido, hasta que la Real Academia Española la recuperó y restauró, abriéndola como museo en 1935. Dentro descubriréis los muebles, libros y objetos cotidianos de un hombre que, además de escribir más obras que nadie en la historia del teatro, vivió tantas pasiones como sus propias comedias.",
      en: "On your way to the Lope de Vega House, a bit of context. The Phoenix of Wits himself had this house built around 1610, after years of moving from rental to rental, and lived in it until his death in 1635. He tended a small garden with his own hands that he fondly called 'my little orchard' and mentions tenderly in his letters — you can still visit it today, recreated with period plants. He wrote, by his own boast, more than 1,500 plays — such an outrageous figure that his rival Cervantes, half in jest, half in earnest, called him a 'monster of nature.' But behind that prolific façade lay a turbulent love life: here, already widowed and ordained a priest (he took orders after his second wife's death), he lived out his last great passion, Marta de Nevares, whom he called Amarilis in his verses. The relationship, scandalous for its time, ended in tragedy: Marta went blind and, toward the end, lost her mind, dying in 1628 with Lope never once ceasing to care for her. Over time the house fell into obscurity, until the Real Academia Española recovered and restored it, opening it as a museum in 1935. Inside you'll find the furniture, books and everyday objects of a man who, besides writing more plays than anyone else in the history of theatre, lived as many passions as his own comedies.",
      fr: "En chemin vers la Maison de Lope de Vega, un peu de contexte. Le Phénix des Esprits lui-même fit construire cette maison vers 1610, après des années de location en location, et y vécut jusqu'à sa mort en 1635. Il cultivait de ses propres mains un petit jardin qu'il appelait affectueusement « mon petit potager » et évoque avec tendresse dans ses lettres — on peut encore le visiter aujourd'hui, recréé avec des plantes d'époque. Il écrivit, à l'en croire, plus de 1 500 pièces — un chiffre si démesuré que son rival Cervantès, mi-plaisantant mi-sérieux, le surnomma « monstre de la nature ». Mais derrière cette façade prolifique se cachait une vie sentimentale tourmentée : ici, déjà veuf et devenu prêtre (il fut ordonné après la mort de sa seconde épouse), il vécut sa dernière grande passion, Marta de Nevares, qu'il appelait Amarilis dans ses vers. La relation, scandaleuse pour l'époque, se termina en tragédie : Marta devint aveugle et, vers la fin, perdit la raison, mourant en 1628 sans que Lope cesse jamais de veiller sur elle. Avec le temps, la maison tomba dans l'oubli, jusqu'à ce que la Real Academia Española la récupère et la restaure, l'ouvrant comme musée en 1935. À l'intérieur, vous découvrirez les meubles, livres et objets du quotidien d'un homme qui, en plus d'avoir écrit plus de pièces que quiconque dans l'histoire du théâtre, vécut autant de passions que ses propres comédies.",
    },
    freeTourPhoto: "img/freetour3.jpg",
    freeTourPhotoCaption: {
      es: "El huerto de la Casa-Museo de Lope de Vega, recreado con plantas de su época",
      en: "The garden of the Lope de Vega House-Museum, recreated with plants from his time",
      fr: "Le jardin de la Maison-Musée de Lope de Vega, recréé avec des plantes de son époque",
    },
    coords: { lat: 40.414, lng: -3.6976 },
    photo: "img/etapa3.jpg",
    photoCaption: {
      es: "Lope de Vega, por Juan van der Hamen (c. 1620), con el hábito de San Juan",
      en: "Lope de Vega, by Juan van der Hamen (c. 1620), wearing the habit of the Order of St John",
      fr: "Lope de Vega, par Juan van der Hamen (v. 1620), portant l'habit de l'ordre de Saint-Jean",
    },
    narrative: {
      es:
        "Deteneos frente al portón de madera de la finca donde vivió y murió " +
        "Lope de Vega, el «Fénix de los Ingenios». Lope escribió más de 1.500 " +
        "obras teatrales, tuvo una vida llena de pasiones y amores " +
        "prohibidos, y mantuvo una enemistad encarnizada con su vecino Miguel " +
        "de Cervantes. Tras años de vivir de alquiler en alquiler, Lope pudo " +
        "por fin comprar esta casa en 1610, y tan orgulloso estaba de ser " +
        "dueño de su propio tejado que mandó esculpirlo en el dintel de " +
        "piedra de su puerta, en latín.",
      en:
        "Stop before the wooden gate of the house where Lope de Vega, the " +
        "'Phoenix of Wits,' lived and died. Lope wrote more than 1,500 " +
        "plays, led a life full of passions and forbidden loves, and kept " +
        "up a bitter feud with his neighbour Miguel de Cervantes. After " +
        "years of moving from rental to rental, Lope was finally able to " +
        "buy this house in 1610, and was so proud of owning his own roof " +
        "that he had it carved, in Latin, into his door's stone lintel.",
      fr:
        "Arrêtez-vous devant le portail de bois de la maison où vécut et " +
        "mourut Lope de Vega, le « Phénix des Esprits ». Lope écrivit plus " +
        "de 1 500 pièces de théâtre, mena une vie pleine de passions et " +
        "d'amours interdites, et entretint une inimitié féroce avec son " +
        "voisin Miguel de Cervantès. Après des années de location en " +
        "location, Lope put enfin acheter cette maison en 1610, et il était " +
        "si fier d'avoir enfin un toit à lui qu'il le fit graver, en latin, " +
        "sur le linteau de pierre de sa porte.",
    },
    enigma: {
      es:
        "Ante el portón del poeta más prolijo del Imperio, alza la mirada " +
        "hacia el dintel tallado en piedra. Bajo las siglas D.O.M., Lope " +
        "mandó labrar en la lengua de la antigua Roma una sentencia en dos " +
        "líneas sobre el valor de lo propio frente a lo ajeno. Transcribe " +
        "las seis palabras latinas en piedra que custodian la entrada para " +
        "cruzar el umbral del dramaturgo.",
      en:
        "Before the gate of the Empire's most prolific poet, raise your " +
        "eyes to the stone-carved lintel. Beneath the letters D.O.M., Lope " +
        "had carved, in the tongue of ancient Rome, a two-line sentence " +
        "about the worth of what is one's own versus what belongs to " +
        "another. Transcribe the six Latin words in stone that guard the " +
        "entrance to cross the playwright's threshold.",
      fr:
        "Devant le portail du poète le plus prolifique de l'Empire, levez " +
        "les yeux vers le linteau taillé dans la pierre. Sous les lettres " +
        "D.O.M., Lope fit graver, dans la langue de la Rome antique, une " +
        "phrase en deux lignes sur la valeur de ce qui nous appartient face " +
        "à ce qui appartient à autrui. Transcrivez les six mots latins " +
        "gravés dans la pierre qui gardent l'entrée, pour franchir le " +
        "seuil du dramaturge.",
    },
    answerFormat: {
      es: "SEIS PALABRAS EN LATÍN",
      en: "SIX WORDS IN LATIN",
      fr: "SIX MOTS EN LATIN",
    },
    hintSubtle: {
      es:
        "Mira justo encima del portón de madera: bajo las letras D.O.M., la " +
        "inscripción dice «PARVA PROPIA MAGNA» en la primera línea y " +
        "«MAGNA ALIENA PARVA» en la segunda. Transcribe las seis palabras, " +
        "tal cual están talladas.",
      en:
        "Look just above the wooden gate: beneath the letters D.O.M., the " +
        "inscription reads 'PARVA PROPIA MAGNA' on the first line and " +
        "'MAGNA ALIENA PARVA' on the second. Transcribe all six words, " +
        "exactly as carved.",
      fr:
        "Regardez juste au-dessus du portail de bois : sous les lettres " +
        "D.O.M., l'inscription indique « PARVA PROPIA MAGNA » sur la " +
        "première ligne et « MAGNA ALIENA PARVA » sur la seconde. " +
        "Transcrivez les six mots, tels qu'ils sont gravés.",
    },
    directions: {
      es: [
        "Sitúate frente al portón de madera en la Calle de Cervantes, 11.",
        "Mira el dintel de piedra sobre la puerta, bajo las siglas D.O.M.",
        "Transcribe las 6 palabras en latín grabadas en dos líneas.",
      ],
      en: [
        "Stand in front of the wooden gate at Calle de Cervantes, 11.",
        "Look at the stone lintel above the door, beneath the letters D.O.M.",
        "Transcribe the 6 Latin words carved in two lines.",
      ],
      fr: [
        "Placez-vous devant le portail de bois au Calle de Cervantes, 11.",
        "Regardez le linteau de pierre au-dessus de la porte, sous les lettres D.O.M.",
        "Transcrivez les 6 mots latins gravés sur deux lignes.",
      ],
    },
    answer: "PARVA PROPIA MAGNA MAGNA ALIENA PARVA",
    acceptedAnswers: [
      "PARVA PROPIA MAGNA MAGNA ALIENA PARVA",
      "parva propia magna magna aliena parva",
      "PARVA PROPIA MAGNA, MAGNA ALIENA PARVA",
      "parva propia magna, magna aliena parva",
      "PARVA PROPIA MAGNA. MAGNA ALIENA PARVA.",
    ],
    revealExplanation: {
      es:
        "La inscripción reza PARVA PROPIA MAGNA, MAGNA ALIENA PARVA: «lo " +
        "pequeño, siendo propio, es grande; lo grande, siendo ajeno, es " +
        "pequeño». Orgulloso de ser, por primera vez, dueño de su propia " +
        "casa, Lope mandó grabar esta máxima sobre la puerta de la vivienda " +
        "que compró en 1610 por 9.000 reales.",
      en:
        "The inscription reads PARVA PROPIA MAGNA, MAGNA ALIENA PARVA: " +
        "'what is small, being one's own, is great; what is great, being " +
        "another's, is small.' Proud to finally own his own house after " +
        "years of renting, Lope had this maxim carved above the door of " +
        "the house he bought in 1610 for 9,000 reales.",
      fr:
        "L'inscription dit PARVA PROPIA MAGNA, MAGNA ALIENA PARVA : « ce " +
        "qui est petit, étant nôtre, est grand ; ce qui est grand, étant à " +
        "autrui, est petit ». Fier de posséder enfin sa propre maison après " +
        "des années de location, Lope fit graver cette maxime au-dessus de " +
        "la porte de la maison qu'il acheta en 1610 pour 9 000 réaux.",
    },
    transition: {
      type: "walk",
      text: {
        es:
          "Avanza por la Calle de Cervantes hasta el cruce con la Calle del " +
          "León. Gira a la derecha y camina una manzana hasta encontrar la " +
          "placa de azulejos que indica Calle de Lope de Vega. En esa misma " +
          "esquina se erige el muro de ladrillo del Convento de las " +
          "Trinitarias Descalzas.",
        en:
          "Continue along Calle de Cervantes to the corner with Calle del " +
          "León. Turn right and walk one block until you find the tiled " +
          "sign reading Calle de Lope de Vega. On that same corner stands " +
          "the brick wall of the Convent of the Barefoot Trinitarian Nuns.",
        fr:
          "Continuez le long de la Calle de Cervantes jusqu'au croisement " +
          "avec la Calle del León. Tournez à droite et marchez un pâté de " +
          "maisons jusqu'à trouver la plaque en céramique indiquant Calle " +
          "de Lope de Vega. Au même coin de rue se dresse le mur de brique " +
          "du couvent des Trinitaires déchaussées.",
      },
    },
  },

  {
    id: "etapa_4_convento_trinitarias",
    num: 4,
    title: {
      es: "La Sepultura Oculta de Cervantes",
      en: "Cervantes' Hidden Grave",
      fr: "La Sépulture Cachée de Cervantès",
    },
    location: "Calle de Lope de Vega, 18",
    landmark: {
      es: "Placa de la RAE · Convento de las Trinitarias",
      en: "RAE plaque · Convent of the Trinitarian Nuns",
      fr: "Plaque de la RAE · Couvent des Trinitaires",
    },
    freeTourIntro: {
      es: "Antes de llegar al convento, escuchad esto. Lo fundó en 1612 doña Beatriz Ramírez de Mendoza, condesa de Castellar, y sigue siendo hoy un convento de clausura en activo — las monjas trinitarias descalzas viven allí exactamente igual que hace cuatro siglos, por lo que no se puede visitar el interior libremente. Entre sus muros tomó los hábitos, años más tarde, Sor Marcela de San Félix — hija de otro gigante del Siglo de Oro, Lope de Vega, fruto de su relación con la actriz Micaela de Luján. En 2015, un equipo de treinta especialistas dirigido por el forense Francisco Etxeberria pasó 35 días excavando la cripta, buscando los restos exactos de Cervantes entre huesos mezclados de al menos quince personas distintas. No fue posible hacer una prueba de ADN —la única pariente directa de Cervantes, su hermana, está enterrada en una fosa común en Alcalá de Henares— así que los investigadores concluyeron, tras cruzar todos los datos históricos y forenses disponibles, que existía «una suma de coincidencias y ninguna discrepancia»: es muy probable, aunque nunca del todo seguro, que entre esos fragmentos estén los huesos del propio Cervantes. Hoy descansan en un monumento dentro de la iglesia, repartidos en tres urnas junto a los de otras personas.",
      en: "Before reaching the convent, listen to this. It was founded in 1612 by Doña Beatriz Ramírez de Mendoza, Countess of Castellar, and remains an active cloistered convent to this day — the Barefoot Trinitarian nuns live there exactly as they did four centuries ago, which is why you can't freely visit the inside. Within its walls, years later, Sor Marcela de San Félix took her vows — daughter of another giant of the Golden Age, Lope de Vega, born of his relationship with the actress Micaela de Luján. In 2015, a team of thirty specialists led by forensic scientist Francisco Etxeberria spent 35 days excavating the crypt, searching for Cervantes' exact remains among bones mixed together from at least fifteen different people. A DNA test wasn't possible — Cervantes' only living direct relative, his sister, is buried in a common grave in Alcalá de Henares — so, after cross-checking every available historical and forensic clue, the researchers concluded there was 'an accumulation of coincidences and not a single discrepancy': it's highly likely, though never entirely certain, that Cervantes' own bones are among those fragments. Today they rest in a monument inside the church, divided among three urns alongside those of other people.",
      fr: "Avant d'arriver au couvent, écoutez ceci. Il fut fondé en 1612 par doña Beatriz Ramírez de Mendoza, comtesse de Castellar, et reste aujourd'hui un couvent de clôture actif — les religieuses trinitaires déchaussées y vivent exactement comme il y a quatre siècles, raison pour laquelle on ne peut pas visiter librement l'intérieur. Entre ces murs, des années plus tard, Sœur Marcela de San Félix prononça ses vœux — fille d'un autre géant du Siècle d'Or, Lope de Vega, née de sa relation avec l'actrice Micaela de Luján. En 2015, une équipe de trente spécialistes dirigée par le médecin légiste Francisco Etxeberria passa 35 jours à fouiller la crypte, à la recherche des restes exacts de Cervantès parmi des ossements mêlés d'au moins quinze personnes différentes. Un test ADN fut impossible —la seule parente directe vivante de Cervantès, sa sœur, est enterrée dans une fosse commune à Alcalá de Henares— si bien que les chercheurs conclurent, après avoir recoupé toutes les données historiques et médico-légales disponibles, qu'il existait « une somme de coïncidences et aucune divergence » : il est très probable, sans jamais être tout à fait certain, que les os de Cervantès lui-même se trouvent parmi ces fragments. Aujourd'hui, ils reposent dans un monument à l'intérieur de l'église, répartis en trois urnes aux côtés de ceux d'autres personnes.",
    },
    freeTourPhoto: "img/freetour4.jpg",
    freeTourPhotoCaption: {
      es: "Fachada del Convento de las Trinitarias Descalzas, Calle de Lope de Vega",
      en: "Façade of the Convent of the Barefoot Trinitarian Nuns, Calle de Lope de Vega",
      fr: "Façade du couvent des Trinitaires déchaussées, Calle de Lope de Vega",
    },
    coords: { lat: 40.4136, lng: -3.697 },
    photo: "img/etapa4.jpg",
    photoCaption: {
      es: "Miguel de Cervantes, atribuido a Juan de Jáuregui (1600) · RAE",
      en: "Miguel de Cervantes, attributed to Juan de Jáuregui (1600) · RAE",
      fr: "Miguel de Cervantès, attribué à Juan de Jáuregui (1600) · RAE",
    },
    narrative: {
      es:
        "Estáis ante los muros de ladrillo del Convento de las Trinitarias " +
        "Descalzas. Bajo este suelo descansa en paz Miguel de Cervantes desde " +
        "abril de 1616. Cervantes pidió ser enterrado aquí por pura gratitud: " +
        "la Orden de los Trinitarios fue la que pagó su rescate tras pasar " +
        "cinco años encarcelado por corsarios en Argel. Aunque durante siglos " +
        "la ubicación exacta de su fosa fue un misterio, la Real Academia " +
        "Española colocó una placa conmemorativa en la fachada exterior que " +
        "guarda la fecha clave para resolver este enigma.",
      en:
        "You stand before the brick walls of the Convent of the Barefoot " +
        "Trinitarian Nuns. Beneath this ground, Miguel de Cervantes has " +
        "rested in peace since April 1616. Cervantes asked to be buried " +
        "here out of pure gratitude: the Trinitarian Order was the one that " +
        "paid his ransom after five years of captivity by corsairs in " +
        "Algiers. Although for centuries the exact location of his grave " +
        "was a mystery, the Real Academia Española placed a commemorative " +
        "plaque on the outer façade that holds the key date to solve this " +
        "riddle.",
      fr:
        "Vous voici devant les murs de brique du couvent des Trinitaires " +
        "déchaussées. Sous ce sol repose en paix Miguel de Cervantès depuis " +
        "avril 1616. Cervantès demanda à y être enterré par pure gratitude " +
        ": c'est l'ordre des Trinitaires qui paya sa rançon après cinq " +
        "années de captivité chez les corsaires à Alger. Bien que, pendant " +
        "des siècles, l'emplacement exact de sa tombe soit resté un " +
        "mystère, la Real Academia Española apposa sur la façade extérieure " +
        "une plaque commémorative qui garde la date clé pour résoudre cette " +
        "énigme.",
    },
    enigma: {
      es:
        "En la morada sagrada que rescató de Argel al autor de «El Quijote», " +
        "la lápida de mármol de la Academia guarda dos fechas talladas en " +
        "números normales: el año de su nacimiento y el de su muerte. " +
        "Buscad el segundo —el mismo que ya conocéis por este relato— y " +
        "convertidlo al lenguaje del César: los números romanos. Esa " +
        "conversión, escrita por vosotros mismos, es la clave.",
      en:
        "In the sacred dwelling that ransomed the author of 'Don Quixote' " +
        "from Algiers, the Academy's marble plaque holds two dates carved " +
        "in ordinary numerals: the year of his birth and the year of his " +
        "death. Find the second one — the same one you already know from " +
        "this story — and convert it into the language of Caesar: Roman " +
        "numerals. That conversion, written by you, is the key.",
      fr:
        "Dans la demeure sacrée qui racheta d'Alger l'auteur de « Don " +
        "Quichotte », la plaque de marbre de l'Académie porte deux dates " +
        "gravées en chiffres ordinaires : l'année de sa naissance et celle " +
        "de sa mort. Cherchez la seconde — celle que vous connaissez déjà " +
        "grâce à ce récit — et convertissez-la dans la langue de César : " +
        "les chiffres romains. Cette conversion, écrite par vous, est la " +
        "clé.",
    },
    answerFormat: {
      es: "NÚMEROS ROMANOS (ej.: MCMXCIX)",
      en: "ROMAN NUMERALS (e.g.: MCMXCIX)",
      fr: "CHIFFRES ROMAINS (ex. : MCMXCIX)",
    },
    hintSubtle: {
      es:
        "La placa dice, con toda claridad: «Cervantes nació en 1547 y " +
        "falleció en 1616». Es el segundo año el que buscáis. Recordad: " +
        "M=1000, D=500, C=100, X=10, V=5, I=1.",
      en:
        "The plaque plainly reads: 'Cervantes nació en 1547 y falleció en " +
        "1616' ('Cervantes was born in 1547 and died in 1616'). It's the " +
        "second year you need. Remember: M=1000, D=500, C=100, X=10, V=5, " +
        "I=1.",
      fr:
        "La plaque indique clairement : « Cervantes nació en 1547 y " +
        "falleció en 1616 » (« Cervantès est né en 1547 et mort en 1616 »). " +
        "C'est la seconde année qu'il vous faut. Rappelez-vous : M=1000, " +
        "D=500, C=100, X=10, V=5, I=1.",
    },
    directions: {
      es: [
        "Acércate a la fachada exterior del convento en la Calle de Lope de Vega, 18.",
        "Localiza la placa de mármol de la Real Academia Española (RAE): indica en qué año nació y en qué año murió Cervantes.",
        "Toma su año de muerte (1616) y conviértelo a números romanos.",
      ],
      en: [
        "Go to the outer façade of the convent at Calle de Lope de Vega, 18.",
        "Find the marble plaque of the Real Academia Española (RAE): it states the years Cervantes was born and died.",
        "Take his death year (1616) and convert it into Roman numerals.",
      ],
      fr: [
        "Rendez-vous à la façade extérieure du couvent, Calle de Lope de Vega, 18.",
        "Repérez la plaque de marbre de la Real Academia Española (RAE) : elle indique les années de naissance et de mort de Cervantès.",
        "Prenez son année de décès (1616) et convertissez-la en chiffres romains.",
      ],
    },
    answer: "MDCXVI",
    acceptedAnswers: ["MDCXVI", "mdcxvi"],
    revealExplanation: {
      es:
        "La respuesta era MDCXVI (=1616 en números romanos: M=1000, " +
        "D=500, C=100, X=10, V=5, I=1). La placa de mármol, obra del " +
        "escultor Ponciano Ponzano e instalada por la RAE en 1869, dice: " +
        "«Cervantes nació en 1547 y falleció en 1616» — el mismo año en que " +
        "fue enterrado en este convento.",
      en:
        "The answer was MDCXVI (1616 in Roman numerals: M=1000, D=500, " +
        "C=100, X=10, V=5, I=1). The marble plaque, the work of sculptor " +
        "Ponciano Ponzano and installed by the RAE in 1869, reads: " +
        "'Cervantes nació en 1547 y falleció en 1616' — the same year he " +
        "was buried in this convent.",
      fr:
        "La réponse était MDCXVI (1616 en chiffres romains : M=1000, " +
        "D=500, C=100, X=10, V=5, I=1). La plaque de marbre, œuvre du " +
        "sculpteur Ponciano Ponzano et installée par la RAE en 1869, " +
        "indique : « Cervantes nació en 1547 y falleció en 1616 » — la " +
        "même année où il fut enterré dans ce couvent.",
    },
    transition: {
      type: "walk",
      text: {
        es:
          "Sigue caminando en sentido ascendente por la Calle de Lope de " +
          "Vega. En pocos minutos desembocarás directamente en la animada " +
          "Plaza de Santa Ana, presidida por el Teatro Español.",
        en:
          "Keep walking uphill along Calle de Lope de Vega. Within a few " +
          "minutes you'll emerge directly onto the lively Plaza de Santa " +
          "Ana, presided over by the Teatro Español.",
        fr:
          "Continuez à monter le long de la Calle de Lope de Vega. En " +
          "quelques minutes, vous déboucherez directement sur l'animée " +
          "Plaza de Santa Ana, dominée par le Teatro Español.",
      },
    },
  },

  {
    id: "etapa_5_plaza_santa_ana",
    num: 5,
    title: {
      es: "El Corral del Príncipe y la Comedia",
      en: "The Corral del Príncipe and the Comedy",
      fr: "Le Corral del Príncipe et la Comédie",
    },
    location: "Plaza de Santa Ana",
    landmark: {
      es: "Estatua de Calderón de la Barca",
      en: "Statue of Calderón de la Barca",
      fr: "Statue de Calderón de la Barca",
    },
    freeTourIntro: {
      es: "Un dato curioso antes de llegar a la Plaza de Santa Ana: esta plaza tal como la veis no es del Siglo de Oro, sino de principios del XIX. La mandó abrir José Bonaparte, el hermano de Napoleón que reinó brevemente en España entre 1808 y 1813, derribando el convento que ocupaba el solar. Los madrileños, poco contentos con un rey impuesto por los franceses y aficionado, según cuentan, a la bebida, le pusieron dos motes burlones: «Pepe Botella» y «Pepe Plazuelas», este último por su manía de abrir plazas y calles anchas tirando conventos, en un intento —bastante adelantado a su época— de modernizar y airear el laberíntico Madrid de los Austrias. Irónicamente, muchas de esas reformas urbanas, tan criticadas entonces, son hoy algunas de las plazas más queridas de la ciudad. Con el paso de las décadas, esta en concreto se convirtió en el corazón bohemio del Barrio de las Letras, frecuentado por escritores, actores y noctámbulos, y hoy es una de las zonas con más ambiente y terrazas de todo Madrid.",
      en: "A curious fact before you reach Plaza de Santa Ana: the square as you see it doesn't date from the Golden Age, but from the early 19th century. It was created by Joseph Bonaparte, Napoleon's brother who briefly reigned over Spain between 1808 and 1813, by tearing down the convent that stood on the site. Madrileños, none too pleased with a king imposed by the French and, so the story goes, rather fond of drink, gave him two mocking nicknames: 'Pepe Botella' ('Joe Bottle') and 'Pepe Plazuelas' ('Joe Little-Squares'), the latter for his habit of opening up squares and wide streets by knocking down convents, in an attempt — rather ahead of its time — to modernise and air out the labyrinthine Madrid of the Habsburgs. Ironically, many of those urban reforms, so criticised at the time, are today among the city's most beloved squares. Over the following decades, this particular one became the bohemian heart of the Barrio de las Letras, frequented by writers, actors and night owls, and today it's one of the liveliest areas in Madrid, packed with bars and outdoor terraces.",
      fr: "Un fait curieux avant d'arriver à la Plaza de Santa Ana : la place telle que vous la voyez ne date pas du Siècle d'Or, mais du début du XIXe siècle. Elle fut créée par Joseph Bonaparte, le frère de Napoléon qui régna brièvement sur l'Espagne entre 1808 et 1813, en démolissant le couvent qui occupait ce terrain. Les Madrilènes, peu satisfaits d'un roi imposé par les Français et, dit-on, porté sur la bouteille, lui donnèrent deux surnoms moqueurs : « Pepe Botella » (« Joseph Bouteille ») et « Pepe Plazuelas » (« Joseph Petites-Places »), ce dernier pour sa manie d'ouvrir des places et de larges rues en abattant des couvents, dans une tentative — plutôt en avance sur son temps — de moderniser et d'aérer le labyrinthique Madrid des Habsbourg. Ironiquement, nombre de ces réformes urbaines, tant critiquées à l'époque, comptent aujourd'hui parmi les places les plus appréciées de la ville. Au fil des décennies, celle-ci devint le cœur bohème du Barrio de las Letras, fréquenté par des écrivains, des acteurs et des noctambules, et c'est aujourd'hui l'un des quartiers les plus animés de Madrid, plein de bars et de terrasses.",
    },
    freeTourPhoto: "img/freetour5.jpg",
    freeTourPhotoCaption: {
      es: "José I Bonaparte, por François Gérard (1808) · Palacio de Fontainebleau",
      en: "Joseph Bonaparte, by François Gérard (1808) · Palace of Fontainebleau",
      fr: "Joseph Bonaparte, par François Gérard (1808) · Château de Fontainebleau",
    },
    coords: { lat: 40.4149, lng: -3.7008 },
    photo: "img/etapa5.jpg",
    photoCaption: {
      es: "Calderón de la Barca, grabado de Pedro de Villafranca (1676)",
      en: "Calderón de la Barca, engraving by Pedro de Villafranca (1676)",
      fr: "Calderón de la Barca, gravure de Pedro de Villafranca (1676)",
    },
    narrative: {
      es:
        "¡Bienvenidos a la cuna del teatro español! En este mismo lugar se " +
        "levantaba el famoso Corral del Príncipe, el espacio donde el pueblo " +
        "llano, los nobles y las mujeres hacinadas en «la cazuela» aclamaban " +
        "o abucheaban las comedias de la época. Presidiendo la plaza se " +
        "encuentra la estatua de don Pedro Calderón de la Barca. En los " +
        "bajorrelieves de bronce de su pedestal están inmortalizadas las " +
        "escenas de sus dramas más universales. Una de ellas es «La vida es " +
        "sueño», donde el príncipe Segismundo reflexiona sobre la libertad y " +
        "el destino.",
      en:
        "Welcome to the cradle of Spanish theatre! Right here once stood " +
        "the famous Corral del Príncipe, the venue where commoners, nobles " +
        "and women crowded into 'la cazuela' cheered or booed the plays of " +
        "the age. Presiding over the square is the statue of Don Pedro " +
        "Calderón de la Barca. The bronze reliefs on his pedestal " +
        "immortalise scenes from his most universal dramas. One of them is " +
        "'Life Is a Dream,' where Prince Segismundo reflects on freedom and " +
        "destiny.",
      fr:
        "Bienvenue au berceau du théâtre espagnol ! C'est ici même que se " +
        "dressait le célèbre Corral del Príncipe, l'espace où le peuple, " +
        "les nobles et les femmes entassées dans « la cazuela » acclamaient " +
        "ou huaient les comédies de l'époque. La statue de don Pedro " +
        "Calderón de la Barca préside la place. Les reliefs de bronze de " +
        "son piédestal immortalisent des scènes de ses drames les plus " +
        "universels. L'un d'eux est « La vie est un songe », où le prince " +
        "Sigismond réfléchit sur la liberté et le destin.",
    },
    enigma: {
      es:
        "El gran dramaturgo en mármol preside la plaza, sentado sobre su " +
        "pedestal de piedra. Bajo su nombre esculpido, varios relieves de " +
        "bronce —uno por cada obra maestra— rodean la base: recórrelos " +
        "todos y cuenta cuántos son en total. Uno de ellos retrata «La vida " +
        "es sueño», el drama donde el príncipe Segismundo descubre que toda " +
        "la existencia puede ser una ilusión. Une el número de relieves con " +
        "la palabra clave del título de esa obra.",
      en:
        "The great playwright in marble surveys the square, seated on his " +
        "stone pedestal. Beneath his carved name, several bronze reliefs — " +
        "one per masterpiece — surround the base: walk all the way around " +
        "and count how many there are in total. One of them portrays 'Life " +
        "Is a Dream,' the drama where Prince Segismundo discovers that all " +
        "existence may be an illusion. Join the number of reliefs with the " +
        "key word from that play's title.",
      fr:
        "Le grand dramaturge de marbre contemple la place, assis sur son " +
        "piédestal de pierre. Sous son nom gravé, plusieurs reliefs de " +
        "bronze — un par chef-d'œuvre — entourent la base : faites-en le " +
        "tour complet et comptez combien il y en a au total. L'un d'eux " +
        "représente « La vie est un songe », le drame où le prince " +
        "Sigismond découvre que toute existence pourrait être une illusion. " +
        "Associez le nombre de reliefs au mot-clé du titre de cette œuvre.",
    },
    answerFormat: {
      es: "NÚMERO-PALABRA (ej.: 0-DRAMA)",
      en: "NUMBER-WORD (e.g.: 0-DRAMA)",
      fr: "NOMBRE-MOT (ex. : 0-DRAME)",
    },
    hintSubtle: {
      es:
        "Rodea el pedestal completo: verás una placa con el nombre CALDERÓN " +
        "DE LA BARCA y, debajo, los relieves de bronce. Cuéntalos todos, " +
        "sin dejarte ninguno. «¿Qué es la vida? Un frenesí. ¿Qué es la " +
        "vida? Una ilusión…» — la última palabra del título es la clave.",
      en:
        "Walk all the way around the pedestal: you'll see a plaque reading " +
        "CALDERÓN DE LA BARCA and, below it, the bronze reliefs. Count all " +
        "of them, don't miss any. 'What is life? A frenzy. What is life? " +
        "An illusion…' — the last word of the title is the key.",
      fr:
        "Faites le tour complet du piédestal : vous verrez une plaque " +
        "indiquant CALDERÓN DE LA BARCA et, en dessous, les reliefs de " +
        "bronze. Comptez-les tous, sans en oublier aucun. « Qu'est-ce que " +
        "la vie ? Une frénésie. Qu'est-ce que la vie ? Une illusion… » — " +
        "le dernier mot du titre est la clé.",
    },
    directions: {
      es: [
        "Busca la placa de mármol que dice CALDERÓN DE LA BARCA en el pedestal de su estatua.",
        "Rodea la base completa y cuenta cuántos relieves de bronce hay en total.",
        "Une esa cifra con la palabra clave del título de «La vida es sueño».",
      ],
      en: [
        "Find the marble plaque reading CALDERÓN DE LA BARCA on the pedestal of his statue.",
        "Walk all the way around the base and count how many bronze reliefs there are in total.",
        "Join that number with the key word from the title of 'Life Is a Dream.'",
      ],
      fr: [
        "Trouvez la plaque de marbre indiquant CALDERÓN DE LA BARCA sur le piédestal de sa statue.",
        "Faites le tour complet de la base et comptez combien il y a de reliefs de bronze au total.",
        "Associez ce chiffre au mot-clé du titre de « La vie est un songe ».",
      ],
    },
    answer: "4-SUEÑO",
    acceptedAnswers: [
      "4-SUEÑO", "4 SUEÑO", "4SUEÑO", "4-sueno", "4 sueno",
      "4-DREAM", "4 DREAM", "4DREAM", "4-dream", "4 dream", // inglés
      "4-SONGE", "4 SONGE", "4SONGE", "4-songe", "4 songe", // francés
    ],
    revealExplanation: {
      es:
        "La respuesta era 4-SUEÑO: cuatro relieves de bronce decoran la " +
        "base de la estatua de Calderón, dedicados a El alcalde de " +
        "Zalamea, La vida es sueño, La danza de la muerte y El escondido y " +
        "la tapada — cuatro de sus obras más célebres.",
      en:
        "The answer was 4-SUEÑO ('dream' in Spanish): four bronze reliefs " +
        "decorate the base of Calderón's statue, dedicated to El alcalde " +
        "de Zalamea, La vida es sueño, La danza de la muerte and El " +
        "escondido y la tapada — four of his most celebrated plays.",
      fr:
        "La réponse était 4-SUEÑO (« songe » en espagnol) : quatre reliefs " +
        "de bronze ornent la base de la statue de Calderón, dédiés à El " +
        "alcalde de Zalamea, La vida es sueño, La danza de la muerte et El " +
        "escondido y la tapada — quatre de ses œuvres les plus célèbres.",
    },
    transition: {
      type: "walk",
      text: {
        es:
          "Sal de la plaza por la Calle del Príncipe hacia el norte, gira a " +
          "la izquierda por la Calle de la Cruz y continúa recto atravesando " +
          "la Calle de Gerona. El gran arco de piedra al final de la calle os " +
          "introducirá de lleno en el recinto porticado de la Plaza Mayor.",
        en:
          "Leave the square along Calle del Príncipe heading north, turn " +
          "left onto Calle de la Cruz and carry straight on across Calle de " +
          "Gerona. The great stone arch at the end of the street will lead " +
          "you right into the arcaded precinct of the Plaza Mayor.",
        fr:
          "Quittez la place par la Calle del Príncipe vers le nord, tournez " +
          "à gauche dans la Calle de la Cruz et continuez tout droit en " +
          "traversant la Calle de Gerona. Le grand arc de pierre au bout de " +
          "la rue vous fera entrer directement dans l'enceinte à arcades de " +
          "la Plaza Mayor.",
      },
    },
  },

  {
    id: "etapa_6_plaza_mayor",
    num: 6,
    title: {
      es: "El Gran Teatro del Imperio — Clímax final",
      en: "The Grand Theatre of the Empire — Final Climax",
      fr: "Le Grand Théâtre de l'Empire — Apothéose finale",
    },
    location: "Plaza Mayor",
    landmark: {
      es: "Estatua Ecuestre de Felipe III",
      en: "Equestrian Statue of Philip III",
      fr: "Statue équestre de Philippe III",
    },
    freeTourIntro: {
      es: "Y ahora, el gran final: la Plaza Mayor. La construyó Felipe III entre 1617 y 1619, encargando el diseño al mismo arquitecto que la Casa de la Villa, Juan Gómez de Mora. En sus más de cuatro siglos de historia ha sido escenario de corridas de toros, coronaciones, mascaradas y también de los terribles autos de fe de la Inquisición —el más multitudinario, en junio de 1680, se celebró presidido por el joven rey Carlos II y su madre, la reina Mariana de Austria, y quedó inmortalizado en un célebre cuadro de Francisco Rizi que hoy cuelga en el Museo del Prado. La plaza ha ardido por completo tres veces —en 1631, 1672 y, la más destructiva, en 1790— y cada vez Madrid la ha reconstruido, dándole el aspecto más sobrio que veis hoy. Fijaos, eso sí, en el edificio de vuestra izquierda al entrar por el arco, decorado con vistosos frescos de colores: es la Casa de la Panadería, la única fachada que sobrevivió intacta al último gran incendio, conservando su aspecto original del siglo XVII. Cada diciembre la plaza se llena de casetas para el mercadillo navideño más famoso de la ciudad. Aquí termina vuestra búsqueda: buena suerte con el último sello.",
      en: "And now, the grand finale: Plaza Mayor. Philip III had it built between 1617 and 1619, commissioning the same architect as the Casa de la Villa, Juan Gómez de Mora. In its more than four centuries of history it has been the stage for bullfights, coronations, masquerades and also the terrible autos-da-fé of the Inquisition — the largest of them, in June 1680, was presided over by the young King Charles II and his mother, Queen Mariana of Austria, and was immortalised in a famous painting by Francisco Rizi that now hangs in the Prado Museum. The square has burned to the ground completely three times — in 1631, 1672 and, most destructively, in 1790 — and each time Madrid rebuilt it, giving it the more sober look you see today. Look, though, at the building on your left as you come in through the arch, decorated with colourful frescoes: that's the Casa de la Panadería, the only façade to survive the last great fire intact, still keeping its original 17th-century appearance. Every December the square fills with stalls for the city's most famous Christmas market. Here your quest ends: good luck with the final seal.",
      fr: "Et maintenant, le grand final : la Plaza Mayor. Philippe III la fit construire entre 1617 et 1619, confiant sa conception au même architecte que la Casa de la Villa, Juan Gómez de Mora. En plus de quatre siècles d'histoire, elle a été le théâtre de corridas, de couronnements, de mascarades et aussi des terribles autodafés de l'Inquisition —le plus grand d'entre eux, en juin 1680, fut présidé par le jeune roi Charles II et sa mère, la reine Mariana d'Autriche, et fut immortalisé dans un célèbre tableau de Francisco Rizi aujourd'hui accroché au musée du Prado. La place a entièrement brûlé trois fois —en 1631, 1672 et, le plus destructeur, en 1790— et à chaque fois Madrid l'a reconstruite, lui donnant l'allure plus sobre que vous voyez aujourd'hui. Observez tout de même le bâtiment sur votre gauche en entrant par l'arche, orné de fresques colorées : c'est la Casa de la Panadería, la seule façade à avoir survécu intacte au dernier grand incendie, conservant son aspect original du XVIIe siècle. Chaque mois de décembre, la place se remplit de chalets pour le marché de Noël le plus célèbre de la ville. Ici s'achève votre quête : bonne chance pour le dernier sceau.",
    },
    freeTourPhoto: "img/freetour6.jpg",
    freeTourPhotoCaption: {
      es: "«Auto de fe en la Plaza Mayor de Madrid» (1683), Francisco Rizi · Museo del Prado",
      en: "\"Auto-da-fé in the Plaza Mayor of Madrid\" (1683), Francisco Rizi · Prado Museum",
      fr: "« Autodafé sur la Plaza Mayor de Madrid » (1683), Francisco Rizi · Musée du Prado",
    },
    coords: { lat: 40.4155, lng: -3.7074 },
    photo: "img/etapa6.jpg",
    photoCaption: {
      es: "«Fiesta real en la Plaza Mayor» (s. XVII) · Museo de Historia de Madrid",
      en: "\"Royal Celebration in the Plaza Mayor\" (17th c.) · Museo de Historia de Madrid",
      fr: "« Fête royale sur la Plaza Mayor » (XVIIe s.) · Museo de Historia de Madrid",
    },
    narrative: {
      es:
        "¡Lo habéis conseguido! Habéis llegado al corazón palpitante del " +
        "Madrid de los Austrias: la Plaza Mayor. Inaugurada por Felipe III en " +
        "1619, esta gran plaza porticada fue el escenario imperial donde la " +
        "Corona mostraba su poder en corridas de toros, grandes mascaradas y " +
        "solemnes ceremonias. En el centro de la plaza se alza la estatua " +
        "ecuestre de Felipe III, moldeada en Florencia por los grandes " +
        "maestros del bronce Giambologna y Pietro Tacca. Para certificar " +
        "vuestra victoria y desbloquear el testamento real, debéis leer la " +
        "placa de mármol de su pedestal y encontrar, entre las fechas que " +
        "en ella se recogen, la más antigua de todas.",
      en:
        "You made it! You have reached the beating heart of Habsburg " +
        "Madrid: the Plaza Mayor. Inaugurated by Philip III in 1619, this " +
        "great arcaded square was the imperial stage where the Crown " +
        "displayed its power through bullfights, grand masquerades and " +
        "solemn ceremonies. In the centre of the square stands the " +
        "equestrian statue of Philip III, cast in Florence by the great " +
        "bronze masters Giambologna and Pietro Tacca. To certify your " +
        "victory and unlock the royal testament, you must read the marble " +
        "plaque on its pedestal and find, among the dates it records, the " +
        "oldest of them all.",
      fr:
        "Vous avez réussi ! Vous voici au cœur battant du Madrid des " +
        "Habsbourg : la Plaza Mayor. Inaugurée par Philippe III en 1619, " +
        "cette grande place à arcades fut la scène impériale où la Couronne " +
        "affichait sa puissance à travers corridas, grandes mascarades et " +
        "cérémonies solennelles. Au centre de la place se dresse la statue " +
        "équestre de Philippe III, coulée à Florence par les grands maîtres " +
        "du bronze Giambologna et Pietro Tacca. Pour certifier votre " +
        "victoire et déverrouiller le testament royal, vous devez lire la " +
        "plaque de marbre de son piédestal et trouver, parmi les dates " +
        "qu'elle indique, la plus ancienne de toutes.",
    },
    enigma: {
      es:
        "Rodead el gran pedestal de piedra hasta encontrar la placa de " +
        "mármol que la reina Isabel II mandó colocar aquí en 1848. En ella " +
        "se leen tres años distintos: el regreso de la Corte a Madrid, la " +
        "construcción de esta misma plaza, y la llegada de esta estatua a " +
        "su lugar actual. Buscad el más antiguo de los tres —el primero " +
        "que se menciona— para sellar la victoria final.",
      en:
        "Walk around the great stone pedestal until you find the marble " +
        "plaque that Queen Isabel II had placed here in 1848. On it you'll " +
        "read three different years: the return of the Court to Madrid, " +
        "the construction of this very square, and the arrival of this " +
        "statue at its current spot. Find the oldest of the three — the " +
        "first one mentioned — to seal the final victory.",
      fr:
        "Faites le tour du grand piédestal de pierre jusqu'à trouver la " +
        "plaque de marbre que la reine Isabelle II fit placer ici en 1848. " +
        "On y lit trois années différentes : le retour de la Cour à " +
        "Madrid, la construction de cette même place, et l'arrivée de " +
        "cette statue à son emplacement actuel. Trouvez la plus ancienne " +
        "des trois — la première mentionnée — pour sceller la victoire " +
        "finale.",
    },
    answerFormat: {
      es: "AÑO DE 4 DÍGITOS",
      en: "4-DIGIT YEAR",
      fr: "ANNÉE À 4 CHIFFRES",
    },
    hintSubtle: {
      es:
        "La placa dice: «La reina doña Isabel II… mandó colocar en este " +
        "sitio la estatua del señor rey don Felipe III… que restituyó a " +
        "ella la corte en [año]… y en 1619 hizo construir esta plaza " +
        "Mayor. Año de 1848.» El año que buscáis es el primero de los tres, " +
        "y el más antiguo.",
      en:
        "The plaque reads: 'Queen Isabel II… ordered the statue of King " +
        "Philip III to be placed on this site… who restored the Court to " +
        "it in [year]… and in 1619 had this Plaza Mayor built. Year " +
        "1848.' The year you want is the first of the three, and the " +
        "oldest.",
      fr:
        "La plaque indique : « La reine Isabelle II… fit placer en ce lieu " +
        "la statue du roi Philippe III… qui y ramena la Cour en [année]… " +
        "et en 1619 fit construire cette Plaza Mayor. Année 1848. » " +
        "L'année recherchée est la première des trois, et la plus " +
        "ancienne.",
    },
    directions: {
      es: [
        "Colócate junto a la estatua ecuestre de Felipe III en el centro de la plaza.",
        "Busca la placa de mármol en el pedestal, colocada por Isabel II en 1848.",
        "Lee los tres años grabados y anota el más antiguo de todos.",
      ],
      en: [
        "Stand next to the equestrian statue of Philip III in the centre of the square.",
        "Find the marble plaque on the pedestal, placed by Isabel II in 1848.",
        "Read the three years engraved and note the oldest of them.",
      ],
      fr: [
        "Placez-vous près de la statue équestre de Philippe III, au centre de la place.",
        "Trouvez la plaque de marbre sur le piédestal, posée par Isabelle II en 1848.",
        "Lisez les trois années gravées et notez la plus ancienne.",
      ],
    },
    answer: "1606",
    acceptedAnswers: ["1606"],
    revealExplanation: {
      es:
        "La clave final era 1606: el año en que Felipe III devolvió la " +
        "Corte a Madrid (que su padre, Felipe II, había trasladado " +
        "brevemente a Valladolid). La propia placa, colocada por Isabel II " +
        "en 1848, recoge también 1619 (la construcción de esta plaza) y " +
        "1848 (la llegada de la estatua a este lugar). Como curiosidad: la " +
        "estatua en sí se terminó de fundir en Florencia en 1616 —el mismo " +
        "año en que murieron Cervantes y Shakespeare— aunque esa fecha no " +
        "aparece en ninguna placa visible.",
      en:
        "The final key was 1606: the year Philip III brought the Court " +
        "back to Madrid (which his father, Philip II, had briefly moved to " +
        "Valladolid). The plaque itself, placed by Isabel II in 1848, also " +
        "records 1619 (this square's construction) and 1848 (the statue's " +
        "arrival here). As a curious fact: the statue itself was finished " +
        "being cast in Florence in 1616 — the same year Cervantes and " +
        "Shakespeare both died — though that date doesn't appear on any " +
        "visible plaque.",
      fr:
        "La clé finale était 1606 : l'année où Philippe III ramena la Cour " +
        "à Madrid (que son père, Philippe II, avait brièvement transférée " +
        "à Valladolid). La plaque elle-même, posée par Isabelle II en " +
        "1848, mentionne aussi 1619 (la construction de cette place) et " +
        "1848 (l'arrivée de la statue ici). Fait curieux : la statue " +
        "elle-même fut achevée à Florence en 1616 — la même année que " +
        "moururent Cervantès et Shakespeare — bien que cette date " +
        "n'apparaisse sur aucune plaque visible.",
    },
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
   entrega el contenido real del juego (las 6 pruebas) en el idioma
   pedido. `lang` es opcional (es/en/fr, por defecto es); se puede
   volver a llamar con el mismo código+dispositivo para recargar el
   contenido en otro idioma sin gastar una nueva activación. */
const REDEEM_ERRORS = {
  missing: { es: "Faltan datos.", en: "Missing data.", fr: "Données manquantes." },
  notFound: {
    es: "Código no reconocido.",
    en: "Code not recognised.",
    fr: "Code non reconnu.",
  },
  otherDevice: {
    es: "Este código ya está activado en otro dispositivo.",
    en: "This code is already active on another device.",
    fr: "Ce code est déjà activé sur un autre appareil.",
  },
};

async function handleRedeem(request, env) {
  const { code, deviceId, lang } = await request.json();
  const safeLang = LANGS.includes(lang) ? lang : "es";
  if (!code || !deviceId)
    return json({ error: REDEEM_ERRORS.missing[safeLang] }, 400, env);

  const normalized = code.trim().toUpperCase();
  const row = await env.DB.prepare("SELECT * FROM licenses WHERE code = ?")
    .bind(normalized)
    .first();

  if (!row) return json({ error: REDEEM_ERRORS.notFound[safeLang] }, 404, env);

  const stages = resolveI18n(STAGES_I18N, safeLang);

  if (row.status === "unused") {
    await env.DB.prepare(
      "UPDATE licenses SET status='active', device_id=?, activated_at=? WHERE code=?"
    )
      .bind(deviceId, Date.now(), normalized)
      .run();
    return json({ stages }, 200, env);
  }

  if (row.status === "active" && row.device_id === deviceId) {
    // reinstalación / reapertura del mismo dispositivo, o simplemente
    // el jugador cambió de idioma: se permite sin gastar el código
    return json({ stages }, 200, env);
  }

  return json({ error: REDEEM_ERRORS.otherDevice[safeLang] }, 403, env);
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
