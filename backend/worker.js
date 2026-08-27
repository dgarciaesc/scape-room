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
        "estaba solo en la Corte: si miráis a vuestro alrededor, las estatuas " +
        "de piedra de los antiguos monarcas custodian los jardines. Para abrir " +
        "el primer archivo de la dinastía, debéis reconciliar la pintura de " +
        "Velázquez con el linaje de los reyes.",
      en:
        "Attention, investigators! You stand on the ancient site of the " +
        "Habsburgs' Royal Alcázar, the medieval fortress where Diego " +
        "Velázquez set up his workshop and painted \"Las Meninas.\" Before " +
        "you rises the imposing statue of Philip IV, the first equestrian " +
        "statue in the world held up solely on the horse's hind legs, thanks " +
        "to the calculations of Galileo Galilei himself. But the king was " +
        "not alone at Court: look around you and you'll see stone statues of " +
        "the old monarchs guarding the gardens. To open the dynasty's first " +
        "file, you must reconcile Velázquez's painting with the royal " +
        "lineage.",
      fr:
        "Attention, enquêteurs ! Vous vous trouvez sur l'ancien emplacement " +
        "de l'Alcázar Royal des Habsbourg, la forteresse médiévale où Diego " +
        "Velázquez installa son atelier et peignit « Les Ménines ». Devant " +
        "vous se dresse l'imposante statue de Philippe IV, la première " +
        "statue équestre au monde tenue uniquement sur les pattes arrière du " +
        "cheval, grâce aux calculs de Galilée lui-même. Mais le roi n'était " +
        "pas seul à la Cour : regardez autour de vous, des statues de pierre " +
        "des anciens monarques gardent les jardins. Pour ouvrir le premier " +
        "dossier de la dynastie, vous devez réconcilier la peinture de " +
        "Velázquez avec la lignée des rois.",
    },
    enigma: {
      es:
        "El rey de bronce desafía la gravedad gracias al sabio de Pisa, pero a " +
        "los pies de su montura, el pintor de «Las Meninas» recibe su hábito " +
        "de nobleza. Inspecciona el relieve lateral: ¿qué sagrada cruz de " +
        "orden militar mancha el pecho del artista? Pasea después la mirada " +
        "por las efigies de piedra que custodian la plaza. Ignora a godos y " +
        "borbones: cuenta únicamente a los monarcas de la dinastía del águila " +
        "bicéfala (los Austrias) que reinaron en los siglos XVI y XVII. Une la " +
        "cruz de la orden con el número de reyes imperiales para descifrar la " +
        "clave.",
      en:
        "The bronze king defies gravity thanks to the sage of Pisa, but at " +
        "his mount's feet, the painter of \"Las Meninas\" receives his habit " +
        "of nobility. Inspect the side relief: what sacred cross of a " +
        "military order stains the artist's chest? Then sweep your gaze over " +
        "the stone effigies guarding the square. Ignore the Visigoths and " +
        "the Bourbons: count only the monarchs of the two-headed eagle " +
        "dynasty (the Habsburgs) who reigned in the 16th and 17th centuries. " +
        "Join the order's cross with the number of imperial kings to " +
        "decipher the key.",
      fr:
        "Le roi de bronze défie la gravité grâce au sage de Pise, mais aux " +
        "pieds de sa monture, le peintre des « Ménines » reçoit son habit de " +
        "noblesse. Inspectez le relief latéral : quelle croix sacrée d'un " +
        "ordre militaire tache la poitrine de l'artiste ? Parcourez ensuite " +
        "du regard les effigies de pierre qui gardent la place. Ignorez les " +
        "Wisigoths et les Bourbons : ne comptez que les monarques de la " +
        "dynastie de l'aigle bicéphale (les Habsbourg) qui régnèrent aux " +
        "XVIe et XVIIe siècles. Associez la croix de l'ordre au nombre de " +
        "rois impériaux pour déchiffrer la clé.",
    },
    answerFormat: {
      es: "PALABRA-NÚMERO (ej.: ORDEN-0)",
      en: "WORD-NUMBER (e.g.: ORDER-0)",
      fr: "MOT-NOMBRE (ex. : ORDRE-0)",
    },
    hintSubtle: {
      es:
        "La orden militar es la misma que da nombre al Camino que peregrina " +
        "hasta Galicia… y los reyes que buscas empiezan en Felipe «el Hermoso» " +
        "y terminan en Carlos «el Hechizado».",
      en:
        "The military order shares its name with the Way that pilgrims walk " +
        "to Galicia… and the kings you're after begin with Philip 'the " +
        "Handsome' and end with Charles 'the Bewitched.'",
      fr:
        "L'ordre militaire porte le même nom que le Chemin emprunté par les " +
        "pèlerins vers la Galice… et les rois que vous cherchez commencent " +
        "avec Philippe « le Beau » et se terminent avec Charles « " +
        "l'Ensorcelé ».",
    },
    directions: {
      es: [
        "Acércate al pedestal de la estatua ecuestre de Felipe IV en el centro de la Plaza de Oriente.",
        "Localiza en el bajorrelieve lateral la escena donde el rey nombra caballero a Velázquez y observa la cruz grabada en su pecho.",
        "Cuenta las estatuas de piedra de los reyes Austrias en el paseo: Felipe I, Carlos I, Felipe II, Felipe III, Felipe IV y Carlos II.",
      ],
      en: [
        "Go to the pedestal of the equestrian statue of Philip IV in the centre of Plaza de Oriente.",
        "Find the scene in the side bas-relief where the king knights Velázquez, and look at the cross carved on his chest.",
        "Count the stone statues of the Habsburg kings along the walkway: Philip I, Charles I, Philip II, Philip III, Philip IV and Charles II.",
      ],
      fr: [
        "Approchez-vous du piédestal de la statue équestre de Philippe IV, au centre de la Plaza de Oriente.",
        "Repérez, dans le bas-relief latéral, la scène où le roi adoube Velázquez, et observez la croix gravée sur sa poitrine.",
        "Comptez les statues de pierre des rois Habsbourg le long de l'allée : Philippe Ier, Charles Ier, Philippe II, Philippe III, Philippe IV et Charles II.",
      ],
    },
    answer: "SANTIAGO-6",
    acceptedAnswers: ["SANTIAGO-6", "SANTIAGO 6", "SANTIAGO6", "santiago-6", "santiago 6"],
    revealExplanation: {
      es:
        "La respuesta era SANTIAGO-6. En el relieve, Felipe IV impone a " +
        "Velázquez la cruz de la Orden de Santiago — la que el propio pintor " +
        "lució en «Las Meninas». Y seis son los Austrias con efigie en la " +
        "plaza: Felipe I, Carlos I, Felipe II, Felipe III, Felipe IV y " +
        "Carlos II.",
      en:
        "The answer was SANTIAGO-6. In the relief, Philip IV bestows on " +
        "Velázquez the cross of the Order of Santiago — the very one the " +
        "painter himself wears in \"Las Meninas.\" And six Habsburgs have a " +
        "statue in the square: Philip I, Charles I, Philip II, Philip III, " +
        "Philip IV and Charles II.",
      fr:
        "La réponse était SANTIAGO-6. Dans le relief, Philippe IV confère à " +
        "Velázquez la croix de l'ordre de Santiago — celle-là même que le " +
        "peintre porte dans « Les Ménines ». Et six Habsbourg ont leur " +
        "effigie sur la place : Philippe Ier, Charles Ier, Philippe II, " +
        "Philippe III, Philippe IV et Charles II.",
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
        "de Cervantes. Buscando la paz que su agitada vida le negaba, Lope " +
        "mandó esculpir en el dintel de piedra de su puerta una célebre " +
        "máxima latina que recuerda que la verdadera grandeza está en la " +
        "quietud del hogar.",
      en:
        "Stop before the wooden gate of the house where Lope de Vega, the " +
        "'Phoenix of Wits,' lived and died. Lope wrote more than 1,500 " +
        "plays, led a life full of passions and forbidden loves, and kept " +
        "up a bitter feud with his neighbour Miguel de Cervantes. Seeking " +
        "the peace his turbulent life denied him, Lope had a famous Latin " +
        "maxim carved into his door's stone lintel, recalling that true " +
        "greatness lies in the stillness of home.",
      fr:
        "Arrêtez-vous devant le portail de bois de la maison où vécut et " +
        "mourut Lope de Vega, le « Phénix des Esprits ». Lope écrivit plus " +
        "de 1 500 pièces de théâtre, mena une vie pleine de passions et " +
        "d'amours interdites, et entretint une inimitié féroce avec son " +
        "voisin Miguel de Cervantès. En quête de la paix que sa vie agitée " +
        "lui refusait, Lope fit graver sur le linteau de pierre de sa porte " +
        "une célèbre maxime latine, rappelant que la vraie grandeur réside " +
        "dans la quiétude du foyer.",
    },
    enigma: {
      es:
        "Ante el portón del poeta más prolijo del Imperio, alza la mirada " +
        "hacia el dintel tallado en piedra. Lope buscaba la calma que sus " +
        "romances le negaban y mandó labrar en la lengua de la antigua Roma " +
        "una sentencia que proclama: «Casa pequeña, pero de gran " +
        "tranquilidad». Transcribe las cinco palabras latinas en piedra que " +
        "custodian la entrada para cruzar el umbral del dramaturgo.",
      en:
        "Before the gate of the Empire's most prolific poet, raise your " +
        "eyes to the stone-carved lintel. Lope sought the calm his romances " +
        "denied him, and had carved, in the tongue of ancient Rome, a " +
        "sentence proclaiming: 'Small house, but of great tranquillity.' " +
        "Transcribe the five Latin words in stone that guard the entrance to " +
        "cross the playwright's threshold.",
      fr:
        "Devant le portail du poète le plus prolifique de l'Empire, levez " +
        "les yeux vers le linteau taillé dans la pierre. Lope cherchait le " +
        "calme que ses romances lui refusaient, et fit graver, dans la " +
        "langue de la Rome antique, une phrase proclamant : « Petite " +
        "maison, mais de grande tranquillité ». Transcrivez les cinq mots " +
        "latins gravés dans la pierre qui gardent l'entrée, pour franchir " +
        "le seuil du dramaturge.",
    },
    answerFormat: {
      es: "CINCO PALABRAS EN LATÍN",
      en: "FIVE WORDS IN LATIN",
      fr: "CINQ MOTS EN LATIN",
    },
    hintSubtle: {
      es:
        "Mira justo encima del portón de madera: la inscripción empieza por " +
        "«PARVA…» (pequeña) y termina en «…QUIES» (quietud). Transcríbela " +
        "completa, tal cual está tallada.",
      en:
        "Look just above the wooden gate: the inscription begins with " +
        "'PARVA…' (small) and ends with '…QUIES' (stillness). Transcribe it " +
        "in full, exactly as carved.",
      fr:
        "Regardez juste au-dessus du portail de bois : l'inscription " +
        "commence par « PARVA… » (petite) et se termine par « …QUIES » " +
        "(quiétude). Transcrivez-la intégralement, telle qu'elle est " +
        "gravée.",
    },
    directions: {
      es: [
        "Sitúate frente al portón de madera en la Calle de Cervantes, 11.",
        "Mira el dintel de piedra sobre la puerta.",
        "Transcribe las 5 palabras en latín grabadas en la piedra.",
      ],
      en: [
        "Stand in front of the wooden gate at Calle de Cervantes, 11.",
        "Look at the stone lintel above the door.",
        "Transcribe the 5 Latin words carved in the stone.",
      ],
      fr: [
        "Placez-vous devant le portail de bois au Calle de Cervantes, 11.",
        "Regardez le linteau de pierre au-dessus de la porte.",
        "Transcrivez les 5 mots latins gravés dans la pierre.",
      ],
    },
    answer: "PARVA DOMUS SED MAGNA QUIES",
    acceptedAnswers: [
      "PARVA DOMUS SED MAGNA QUIES",
      "parva domus sed magna quies",
      "PARVA DOMUS SED MAGNA QUIES.",
    ],
    revealExplanation: {
      es:
        "La inscripción reza PARVA DOMUS SED MAGNA QUIES: «casa pequeña, " +
        "pero de gran quietud». El refugio que Lope opuso a su tormentosa " +
        "vida de amores, pleitos y rivalidades literarias.",
      en:
        "The inscription reads PARVA DOMUS SED MAGNA QUIES: 'small house, " +
        "but of great stillness.' The refuge Lope set against his stormy " +
        "life of love affairs, lawsuits and literary rivalries.",
      fr:
        "L'inscription dit PARVA DOMUS SED MAGNA QUIES : « petite maison, " +
        "mais de grande quiétude ». Le refuge que Lope opposa à sa vie " +
        "tumultueuse faite d'amours, de procès et de rivalités littéraires.",
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
        "la lápida de la Academia guarda el año de su homenaje en la pared. " +
        "Pero los eruditos no escribieron el año con números comunes, sino " +
        "con el lenguaje del César: MDCCCLXVIII. Desentraña el valor de " +
        "estas letras romanas y conviértelas en la cifra de cuatro dígitos de " +
        "nuestro calendario.",
      en:
        "In the sacred dwelling that ransomed the author of 'Don Quixote' " +
        "from Algiers, the Academy's plaque holds on the wall the year of " +
        "its tribute. But the scholars did not write the year in common " +
        "numerals, but in the language of Caesar: MDCCCLXVIII. Unravel the " +
        "value of these Roman letters and turn them into the four-digit " +
        "figure of our calendar.",
      fr:
        "Dans la demeure sacrée qui racheta d'Alger l'auteur de « Don " +
        "Quichotte », la plaque de l'Académie garde sur le mur l'année de " +
        "son hommage. Mais les érudits n'ont pas écrit l'année en chiffres " +
        "ordinaires, mais dans la langue de César : MDCCCLXVIII. Démêlez la " +
        "valeur de ces lettres romaines et transformez-les en le nombre à " +
        "quatre chiffres de notre calendrier.",
    },
    answerFormat: {
      es: "AÑO DE 4 DÍGITOS",
      en: "4-DIGIT YEAR",
      fr: "ANNÉE À 4 CHIFFRES",
    },
    hintSubtle: {
      es:
        "Recuerda el valor de cada letra romana: M=1000, D=500, C=100, L=50, " +
        "X=10, V=5, I=1. Ve sumando de izquierda a derecha.",
      en:
        "Remember the value of each Roman numeral: M=1000, D=500, C=100, " +
        "L=50, X=10, V=5, I=1. Add them up from left to right.",
      fr:
        "Rappelez-vous la valeur de chaque chiffre romain : M=1000, D=500, " +
        "C=100, L=50, X=10, V=5, I=1. Additionnez de gauche à droite.",
    },
    directions: {
      es: [
        "Acércate a la fachada exterior del convento en la Calle de Lope de Vega, 18.",
        "Localiza la placa de la Real Academia Española (RAE).",
        "Convierte los números romanos MDCCCLXVIII: M(1000) + DCCC(800) + LX(60) + VIII(8).",
      ],
      en: [
        "Go to the outer façade of the convent at Calle de Lope de Vega, 18.",
        "Find the plaque of the Real Academia Española (RAE).",
        "Convert the Roman numerals MDCCCLXVIII: M(1000) + DCCC(800) + LX(60) + VIII(8).",
      ],
      fr: [
        "Rendez-vous à la façade extérieure du couvent, Calle de Lope de Vega, 18.",
        "Repérez la plaque de la Real Academia Española (RAE).",
        "Convertissez les chiffres romains MDCCCLXVIII : M(1000) + DCCC(800) + LX(60) + VIII(8).",
      ],
    },
    answer: "1868",
    acceptedAnswers: ["1868"],
    revealExplanation: {
      es:
        "MDCCCLXVIII = 1868: M(1000) + DCCC(800) + LX(60) + VIII(8). Ese año " +
        "la RAE rindió homenaje a Cervantes en el convento donde reposa desde " +
        "1616.",
      en:
        "MDCCCLXVIII = 1868: M(1000) + DCCC(800) + LX(60) + VIII(8). That " +
        "year the RAE paid tribute to Cervantes at the convent where he has " +
        "rested since 1616.",
      fr:
        "MDCCCLXVIII = 1868 : M(1000) + DCCC(800) + LX(60) + VIII(8). Cette " +
        "année-là, la RAE rendit hommage à Cervantès au couvent où il repose " +
        "depuis 1616.",
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
        "El gran dramaturgo en bronce contempla la plaza rodeado por sus " +
        "cuatro obras maestras esculpidas en metal. Busca el cuadro donde el " +
        "príncipe Segismundo yace encadenado descubriendo que toda la " +
        "existencia es una ilusión. Cuenta las figuras humanas de bronce " +
        "atrapadas en esa escena concreta. Junta la cantidad de figuras con " +
        "la palabra clave que da título a la ficción dramática.",
      en:
        "The great playwright in bronze surveys the square, surrounded by " +
        "his four masterpieces sculpted in metal. Find the panel where " +
        "Prince Segismundo lies in chains, discovering that all existence " +
        "is an illusion. Count the bronze human figures trapped in that " +
        "particular scene. Join the number of figures with the key word " +
        "that gives the dramatic fiction its title.",
      fr:
        "Le grand dramaturge de bronze contemple la place, entouré de ses " +
        "quatre chefs-d'œuvre sculptés dans le métal. Trouvez le tableau où " +
        "le prince Sigismond gît enchaîné, découvrant que toute existence " +
        "est une illusion. Comptez les figures humaines de bronze " +
        "prisonnières de cette scène précise. Associez le nombre de " +
        "figures au mot-clé qui donne son titre à cette fiction dramatique.",
    },
    answerFormat: {
      es: "NÚMERO-PALABRA (ej.: 0-DRAMA)",
      en: "NUMBER-WORD (e.g.: 0-DRAMA)",
      fr: "NOMBRE-MOT (ex. : 0-DRAME)",
    },
    hintSubtle: {
      es:
        "Rodea el pedestal: son cuatro relieves, uno por obra. El que buscas " +
        "muestra a un hombre encadenado. «¿Qué es la vida? Un frenesí. ¿Qué " +
        "es la vida? Una ilusión…» — la última palabra del título es la " +
        "clave.",
      en:
        "Walk around the pedestal: there are four reliefs, one per play. " +
        "The one you want shows a man in chains. 'What is life? A frenzy. " +
        "What is life? An illusion…' — the last word of the title is the " +
        "key.",
      fr:
        "Faites le tour du piédestal : il y a quatre reliefs, un par " +
        "pièce. Celui que vous cherchez montre un homme enchaîné. « " +
        "Qu'est-ce que la vie ? Une frénésie. Qu'est-ce que la vie ? Une " +
        "illusion… » — le dernier mot du titre est la clé.",
    },
    directions: {
      es: [
        "Inspecciona las cuatro caras del pedestal de la estatua de Calderón de la Barca.",
        "Encuentra el relieve de «La vida es sueño» y cuenta las figuras humanas esculpidas.",
        "Une esa cifra con la palabra clave del título de la obra.",
      ],
      en: [
        "Inspect all four faces of the pedestal of the Calderón de la Barca statue.",
        "Find the relief of 'Life Is a Dream' and count the sculpted human figures.",
        "Join that number with the play's key title word.",
      ],
      fr: [
        "Inspectez les quatre faces du piédestal de la statue de Calderón de la Barca.",
        "Trouvez le relief de « La vie est un songe » et comptez les figures humaines sculptées.",
        "Associez ce chiffre au mot-clé du titre de l'œuvre.",
      ],
    },
    answer: "3-SUEÑO",
    acceptedAnswers: [
      "3-SUEÑO", "3 SUEÑO", "3SUEÑO", "3-sueno", "3 sueno",
      "3-DREAM", "3 DREAM", "3DREAM", "3-dream", "3 dream", // inglés
      "3-SONGE", "3 SONGE", "3SONGE", "3-songe", "3 songe", // francés
    ],
    revealExplanation: {
      es:
        "La respuesta era 3-SUEÑO: tres figuras habitan el relieve de «La " +
        "vida es sueño», el drama donde Segismundo descubre que «los sueños, " +
        "sueños son».",
      en:
        "The answer was 3-SUEÑO ('dream' in Spanish): three figures inhabit " +
        "the relief of 'Life Is a Dream,' the drama where Segismundo " +
        "discovers that 'dreams are only dreams.'",
      fr:
        "La réponse était 3-SUEÑO (« songe » en espagnol) : trois figures " +
        "peuplent le relief de « La vie est un songe », le drame où " +
        "Sigismond découvre que « les songes ne sont que des songes ».",
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
        "vuestra victoria y desbloquear el testamento real, debéis examinar " +
        "los símbolos y fechas grabados a los pies del caballo del rey.",
      en:
        "You made it! You have reached the beating heart of Habsburg " +
        "Madrid: the Plaza Mayor. Inaugurated by Philip III in 1619, this " +
        "great arcaded square was the imperial stage where the Crown " +
        "displayed its power through bullfights, grand masquerades and " +
        "solemn ceremonies. In the centre of the square stands the " +
        "equestrian statue of Philip III, cast in Florence by the great " +
        "bronze masters Giambologna and Pietro Tacca. To certify your " +
        "victory and unlock the royal testament, you must examine the " +
        "symbols and dates carved at the feet of the king's horse.",
      fr:
        "Vous avez réussi ! Vous voici au cœur battant du Madrid des " +
        "Habsbourg : la Plaza Mayor. Inaugurée par Philippe III en 1619, " +
        "cette grande place à arcades fut la scène impériale où la Couronne " +
        "affichait sa puissance à travers corridas, grandes mascarades et " +
        "cérémonies solennelles. Au centre de la place se dresse la statue " +
        "équestre de Philippe III, coulée à Florence par les grands maîtres " +
        "du bronze Giambologna et Pietro Tacca. Pour certifier votre " +
        "victoire et déverrouiller le testament royal, vous devez examiner " +
        "les symboles et les dates gravés aux pieds du cheval du roi.",
    },
    enigma: {
      es:
        "En el foro de la villa, el rey de bronce cabalga desde Florencia. " +
        "Mira las placas a los pies de la montura: encuentra el año de " +
        "cuatro dígitos en que los maestros toscanos concluyeron la estatua. " +
        "Cuenta después los escudos con castillos y leones que vigilan las " +
        "cuatro esquinas de la base del monumento. Une el año de fundición " +
        "florentina con el número de escudos esquineros para sellar la " +
        "victoria final.",
      en:
        "In the town's forum, the bronze king rides in from Florence. Look " +
        "at the plaques at the mount's feet: find the four-digit year when " +
        "the Tuscan masters completed the statue. Then count the shields " +
        "bearing castles and lions that watch over the four corners of the " +
        "monument's base. Join the year of the Florentine casting with the " +
        "number of corner shields to seal the final victory.",
      fr:
        "Sur le forum de la ville, le roi de bronze chevauche depuis " +
        "Florence. Regardez les plaques aux pieds de la monture : trouvez " +
        "l'année à quatre chiffres où les maîtres toscans achevèrent la " +
        "statue. Comptez ensuite les écus aux châteaux et aux lions qui " +
        "veillent aux quatre coins de la base du monument. Associez " +
        "l'année de la fonte florentine au nombre d'écus d'angle pour " +
        "sceller la victoire finale.",
    },
    answerFormat: {
      es: "AÑO-NÚMERO (ej.: 1500-0)",
      en: "YEAR-NUMBER (e.g.: 1500-0)",
      fr: "ANNÉE-NOMBRE (ex. : 1500-0)",
    },
    hintSubtle: {
      es:
        "El año que buscas coincide, curiosamente, con el de la muerte de " +
        "Cervantes… y los escudos son tantos como esquinas tiene la base.",
      en:
        "The year you're after coincides, curiously, with the year " +
        "Cervantes died… and there are as many shields as the base has " +
        "corners.",
      fr:
        "L'année que vous cherchez coïncide, curieusement, avec celle de " +
        "la mort de Cervantès… et il y a autant d'écus que la base compte " +
        "de coins.",
    },
    directions: {
      es: [
        "Colócate junto a la estatua ecuestre de Felipe III en el centro de la plaza.",
        "Encuentra en las placas del pedestal el año de fundición en Florencia.",
        "Cuenta los escudos heráldicos tallados en las esquinas de la base.",
      ],
      en: [
        "Stand next to the equestrian statue of Philip III in the centre of the square.",
        "Find the year of the Florentine casting on the pedestal plaques.",
        "Count the heraldic shields carved into the corners of the base.",
      ],
      fr: [
        "Placez-vous près de la statue équestre de Philippe III, au centre de la place.",
        "Trouvez l'année de la fonte florentine sur les plaques du piédestal.",
        "Comptez les écus héraldiques sculptés aux coins de la base.",
      ],
    },
    answer: "1616-4",
    acceptedAnswers: ["1616-4", "1616 4", "16164"],
    revealExplanation: {
      es:
        "La clave final era 1616-4: la estatua se concluyó en Florencia en " +
        "1616 — el mismo año en que murieron Cervantes y Shakespeare — y " +
        "cuatro escudos custodian las esquinas de su base.",
      en:
        "The final key was 1616-4: the statue was completed in Florence in " +
        "1616 — the same year Cervantes and Shakespeare both died — and " +
        "four shields guard the corners of its base.",
      fr:
        "La clé finale était 1616-4 : la statue fut achevée à Florence en " +
        "1616 — la même année que moururent Cervantès et Shakespeare — et " +
        "quatre écus gardent les coins de sa base.",
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
