/* ============================================================
   Internacionalización: idioma actual, diccionario de interfaz
   (es/en/fr) y motor de resolución de contenido multilingüe.
   ============================================================ */

const I18N = (() => {
  const LANG_KEY = "testamento_lang";
  const SUPPORTED = ["es", "en", "fr"];

  function detectDefault() {
    const nav = (navigator.language || "es").slice(0, 2).toLowerCase();
    return SUPPORTED.includes(nav) ? nav : null; // null = aún no elegido
  }

  function getLang() {
    return localStorage.getItem(LANG_KEY) || null;
  }

  function setLang(lang) {
    if (!SUPPORTED.includes(lang)) return;
    localStorage.setItem(LANG_KEY, lang);
  }

  /* --- Resolución de contenido multilingüe ---
     Un "nodo i18n" es un objeto con únicamente claves es/en/fr, cuyo
     valor puede ser texto, un array (p.ej. directions) o incluso un
     objeto anidado. resolve() recorre cualquier estructura (GAME_DATA,
     las 6 pruebas del backend...) y sustituye cada nodo i18n por el
     valor del idioma pedido, con el español como red de seguridad si
     falta alguna traducción. */
  function isI18nNode(node) {
    if (!node || typeof node !== "object" || Array.isArray(node)) return false;
    const keys = Object.keys(node);
    return (
      keys.length > 0 &&
      keys.every((k) => SUPPORTED.includes(k)) &&
      "es" in node
    );
  }

  function resolve(node, lang) {
    if (Array.isArray(node)) return node.map((x) => resolve(x, lang));
    if (node && typeof node === "object") {
      if (isI18nNode(node)) {
        const val = node[lang] !== undefined ? node[lang] : node.es;
        return resolve(val, lang);
      }
      const out = {};
      for (const k in node) out[k] = resolve(node[k], lang);
      return out;
    }
    return node;
  }

  /* --- Diccionario de interfaz (textos fijos, no el guion del juego) --- */
  const STRINGS = {
    es: {
      home_title: "Madrid Aventure",
      home_tagline: "Escape rooms urbanos por el corazón histórico de Madrid",
      home_choose_lang: "Elige tu idioma",
      home_credit: "Foto: José Manuel Suárez (CC BY 2.0)",
      currency: "ducados",

      gps_unsupported: "Este dispositivo no dispone de GPS.",
      gps_checking: "Consultando la brújula real…",
      gps_arrived: "✔ ¡Habéis llegado al lugar señalado!",
      gps_distance: "Estáis a {d} m del objetivo. ¡Seguid caminando!",
      gps_far: "Estáis muy lejos de Madrid… pero podéis jugar en modo sofá igualmente.",
      gps_denied: "Sin señal de GPS (permiso denegado). Podéis continuar sin él.",
      gps_button: "📍 ¿Estoy cerca?",

      pin_title: "Vuestra posición aproximada",
      pin_approx: "(os situamos donde el plano alcanza)",
      pin_exact: "· ⚜ marcados en el plano",

      maps_link: "🗺 Cómo llegar a {label}",

      speaker_prologue: "os encomienda una misión",
      speaker_narrative: "relata la historia del lugar",
      speaker_enigma: "os plantea el enigma",
      speaker_google_intro: "os concede una excepción",
      speaker_google_question: "os plantea la pregunta",
      speaker_walk: "os indica el camino",
      speaker_freetour: "os cuenta una anécdota del lugar",
      listen_freetour: "Escuchar la explicación",
      listen_required_hint: "🔒 Escuchad la explicación de arriba para continuar",
      speaker_victory: "os da las gracias",
      speaker_hint_subtle: "Don Baltasar os susurra una pista",
      speaker_hint_direct: "Don Baltasar os guía paso a paso",
      speaker_hint_reveal: "Don Baltasar revela el secreto",

      photo_alt: "Foto del equipo",
      photo_repeat: "📸 Repetir foto de recuerdo",
      photo_take: "📸 Foto de recuerdo en {location}",
      photo_saved: "⚜ Foto sellada en la crónica",
      photo_no_space: "No hay espacio para guardar la foto",

      title_meta: "6 sellos ocultos en piedra y bronce<br />Del Palacio Real a la Plaza Mayor · ~2 h a pie<br />Recomendado: jugar en la calle, en equipo",
      title_continue: "▶ Continuar la investigación",
      title_start: "Comenzar la aventura",
      title_restart: "Empezar de nuevo",
      title_restart_confirm: "¿Borrar la partida guardada y empezar de nuevo?",

      license_error_empty: "Escribe el código de tu licencia.",
      license_error_noconn: "No hay conexión. Necesitas internet una sola vez, para desbloquear la aventura.",
      license_error_invalid: "Código no válido.",
      license_error_checkout_conn: "No se pudo conectar con la pasarela de pago.",
      license_error_checkout_failed: "No se pudo iniciar el pago.",
      license_label: "🔑 Licencia de equipo",
      license_text: "Esta aventura requiere una licencia por equipo (válida para hasta 6 personas jugando juntas desde un mismo móvil). Si ya la has comprado, introduce aquí tu código:",
      license_placeholder: "MADRID-XXXXXX",
      license_unlock: "Desbloquear la aventura",
      license_checking: "Comprobando…",
      license_activated: "⚜ Licencia activada. ¡Que comience la aventura!",
      license_buy: "💳 Comprar licencia — {price}",
      license_opening_payment: "Abriendo pago…",
      license_note: "El código se activa en este móvil la primera vez que se usa. Solo hace falta conexión para este paso — el resto de la aventura funciona sin cobertura.",

      prologue_kicker: "Prólogo",
      listen_narration: "Escuchar narración",
      listen_enigma: "Escuchar enigma",
      listen_instructions: "Escuchar indicaciones",
      who_guides: "⚜ Quién os guía",
      arrived_start: "He llegado a la Plaza de Oriente",

      stage_kicker: "Sello {n} de {total}",
      stage_timer: "⏱ {timer} · bonus si resolvéis en 2 min",
      answer_format: "Formato: {format}",
      answer_placeholder: "Escribid aquí la clave…",
      seal_answer: "Sellar la respuesta",
      continue_route: "Continuar la ruta →",
      stage_solved_help: "Sello abierto con ayuda · +{pts} ducados",
      stage_correct_bonus: "⚜ ¡Correcto! +{pts} ducados (¡bonus de celeridad!)",
      stage_correct: "⚜ ¡Correcto! +{pts} ducados",
      wrong_1: "Esa no es la clave… el Historiador os ofrece una pista.",
      wrong_2: "Aún no… seguid las instrucciones directas.",
      wrong_3: "El Historiador revela el secreto. Leed y continuad.",

      google_kicker: "Prueba especial · Única búsqueda permitida",
      google_title: "El oráculo de internet",
      google_open: "🔎 Abrir Google",
      google_placeholder: "Calle y número…",
      google_confirm: "Confirmar dirección",
      google_reveal: "La dirección es <strong>{answer}</strong>. Pulsad de nuevo para continuar.",
      google_correct: "⚜ ¡Exacto! +{pts} ducados",
      google_wrong: "Esa no es la dirección exacta…",

      transition_kicker: "Sello {n} abierto ⚜",
      transition_heading: "Rumbo a {location}",
      transition_points: "+{pts} ducados ganados",
      arrived_next: "He llegado — abrir el siguiente sello",

      victory_chronicle: "⚜ Crónica de la expedición",
      victory_time: "Tiempo total: {time}",
      victory_album: "📸 Álbum de la expedición",
      victory_share: "📤 Compartir hazaña",
      victory_again: "Jugar de nuevo",
      copied_clipboard: "Copiado al portapapeles",
      share_text: '⚜ He completado "{title}" en Madrid: {score} ducados en {time}. ¿Superarás mi marca?',
    },

    en: {
      home_title: "Madrid Aventure",
      home_tagline: "Urban escape rooms through the historic heart of Madrid",
      home_choose_lang: "Choose your language",
      home_credit: "Photo: José Manuel Suárez (CC BY 2.0)",
      currency: "doubloons",

      gps_unsupported: "This device has no GPS.",
      gps_checking: "Checking the royal compass…",
      gps_arrived: "✔ You've reached the marked spot!",
      gps_distance: "You are {d} m from the target. Keep walking!",
      gps_far: "You're very far from Madrid… but you can still play from the sofa.",
      gps_denied: "No GPS signal (permission denied). You can continue without it.",
      gps_button: "📍 Am I close?",

      pin_title: "Your approximate position",
      pin_approx: "(placed as close as this map fragment allows)",
      pin_exact: "· ⚜ marked on the map",

      maps_link: "🗺 How to get to {label}",

      speaker_prologue: "entrusts you with a mission",
      speaker_narrative: "tells the story of this place",
      speaker_enigma: "poses the riddle",
      speaker_google_intro: "grants you an exception",
      speaker_google_question: "asks the question",
      speaker_walk: "shows you the way",
      speaker_freetour: "shares a story about this place",
      listen_freetour: "Listen to the story",
      listen_required_hint: "🔒 Listen to the story above to continue",
      speaker_victory: "thanks you",
      speaker_hint_subtle: "Don Baltasar whispers a clue",
      speaker_hint_direct: "Don Baltasar guides you step by step",
      speaker_hint_reveal: "Don Baltasar reveals the secret",

      photo_alt: "Team photo",
      photo_repeat: "📸 Retake keepsake photo",
      photo_take: "📸 Keepsake photo at {location}",
      photo_saved: "⚜ Photo sealed into the chronicle",
      photo_no_space: "No room left to save the photo",

      title_meta: "6 seals hidden in stone and bronze<br />From the Royal Palace to Plaza Mayor · ~2 h on foot<br />Recommended: play outdoors, as a team",
      title_continue: "▶ Continue the investigation",
      title_start: "Begin the adventure",
      title_restart: "Start over",
      title_restart_confirm: "Delete the saved game and start over?",

      license_error_empty: "Enter your licence code.",
      license_error_noconn: "No connection. You only need internet once, to unlock the adventure.",
      license_error_invalid: "Invalid code.",
      license_error_checkout_conn: "Could not connect to the payment gateway.",
      license_error_checkout_failed: "Could not start the payment.",
      license_label: "🔑 Team licence",
      license_text: "This adventure requires a team licence (valid for up to 6 people playing together from one phone). If you've already bought one, enter your code here:",
      license_placeholder: "MADRID-XXXXXX",
      license_unlock: "Unlock the adventure",
      license_checking: "Checking…",
      license_activated: "⚜ Licence activated. Let the adventure begin!",
      license_buy: "💳 Buy licence — {price}",
      license_opening_payment: "Opening payment…",
      license_note: "The code activates on this phone the first time it's used. You only need a connection for this step — the rest of the adventure works without coverage.",

      prologue_kicker: "Prologue",
      listen_narration: "Listen to narration",
      listen_enigma: "Listen to riddle",
      listen_instructions: "Listen to directions",
      who_guides: "⚜ Who guides you",
      arrived_start: "I've reached Plaza de Oriente",

      stage_kicker: "Seal {n} of {total}",
      stage_timer: "⏱ {timer} · bonus if solved within 2 min",
      answer_format: "Format: {format}",
      answer_placeholder: "Write the code here…",
      seal_answer: "Seal the answer",
      continue_route: "Continue the route →",
      stage_solved_help: "Seal opened with help · +{pts} doubloons",
      stage_correct_bonus: "⚜ Correct! +{pts} doubloons (speed bonus!)",
      stage_correct: "⚜ Correct! +{pts} doubloons",
      wrong_1: "That's not the key… the Historian offers you a clue.",
      wrong_2: "Not quite… follow the direct instructions.",
      wrong_3: "The Historian reveals the secret. Read on and continue.",

      google_kicker: "Special challenge · The only search allowed",
      google_title: "The oracle of the internet",
      google_open: "🔎 Open Google",
      google_placeholder: "Street and number…",
      google_confirm: "Confirm address",
      google_reveal: "The address is <strong>{answer}</strong>. Tap again to continue.",
      google_correct: "⚜ Exact! +{pts} doubloons",
      google_wrong: "That's not the exact address…",

      transition_kicker: "Seal {n} opened ⚜",
      transition_heading: "Heading to {location}",
      transition_points: "+{pts} doubloons earned",
      arrived_next: "I've arrived — open the next seal",

      victory_chronicle: "⚜ Chronicle of the expedition",
      victory_time: "Total time: {time}",
      victory_album: "📸 Expedition album",
      victory_share: "📤 Share your feat",
      victory_again: "Play again",
      copied_clipboard: "Copied to clipboard",
      share_text: '⚜ I completed "{title}" in Madrid: {score} doubloons in {time}. Can you beat my score?',
    },

    fr: {
      home_title: "Madrid Aventure",
      home_tagline: "Escape games urbains au cœur historique de Madrid",
      home_choose_lang: "Choisissez votre langue",
      home_credit: "Photo : José Manuel Suárez (CC BY 2.0)",
      currency: "doublons",

      gps_unsupported: "Cet appareil ne dispose pas de GPS.",
      gps_checking: "Consultation de la boussole royale…",
      gps_arrived: "✔ Vous êtes arrivés au lieu indiqué !",
      gps_distance: "Vous êtes à {d} m de l'objectif. Continuez à marcher !",
      gps_far: "Vous êtes très loin de Madrid… mais vous pouvez quand même jouer depuis votre canapé.",
      gps_denied: "Pas de signal GPS (permission refusée). Vous pouvez continuer sans.",
      gps_button: "📍 Suis-je proche ?",

      pin_title: "Votre position approximative",
      pin_approx: "(placé là où cette carte s'arrête)",
      pin_exact: "· ⚜ marqué sur la carte",

      maps_link: "🗺 Comment aller à {label}",

      speaker_prologue: "vous confie une mission",
      speaker_narrative: "raconte l'histoire du lieu",
      speaker_enigma: "vous pose l'énigme",
      speaker_google_intro: "vous accorde une exception",
      speaker_google_question: "vous pose la question",
      speaker_walk: "vous indique le chemin",
      speaker_freetour: "vous raconte une anecdote du lieu",
      listen_freetour: "Écouter le récit",
      listen_required_hint: "🔒 Écoutez le récit ci-dessus pour continuer",
      speaker_victory: "vous remercie",
      speaker_hint_subtle: "Don Baltasar vous souffle un indice",
      speaker_hint_direct: "Don Baltasar vous guide pas à pas",
      speaker_hint_reveal: "Don Baltasar révèle le secret",

      photo_alt: "Photo de l'équipe",
      photo_repeat: "📸 Reprendre la photo souvenir",
      photo_take: "📸 Photo souvenir à {location}",
      photo_saved: "⚜ Photo scellée dans la chronique",
      photo_no_space: "Plus de place pour enregistrer la photo",

      title_meta: "6 sceaux cachés dans la pierre et le bronze<br />Du Palais Royal à la Plaza Mayor · ~2 h à pied<br />Recommandé : jouer dans la rue, en équipe",
      title_continue: "▶ Continuer l'enquête",
      title_start: "Commencer l'aventure",
      title_restart: "Recommencer",
      title_restart_confirm: "Supprimer la partie sauvegardée et recommencer ?",

      license_error_empty: "Saisissez le code de votre licence.",
      license_error_noconn: "Pas de connexion. Une connexion internet n'est nécessaire qu'une seule fois, pour débloquer l'aventure.",
      license_error_invalid: "Code invalide.",
      license_error_checkout_conn: "Impossible de se connecter à la passerelle de paiement.",
      license_error_checkout_failed: "Impossible de lancer le paiement.",
      license_label: "🔑 Licence d'équipe",
      license_text: "Cette aventure nécessite une licence par équipe (valable pour jusqu'à 6 personnes jouant ensemble depuis un même téléphone). Si vous l'avez déjà achetée, saisissez votre code ici :",
      license_placeholder: "MADRID-XXXXXX",
      license_unlock: "Débloquer l'aventure",
      license_checking: "Vérification…",
      license_activated: "⚜ Licence activée. Que l'aventure commence !",
      license_buy: "💳 Acheter la licence — {price}",
      license_opening_payment: "Ouverture du paiement…",
      license_note: "Le code s'active sur ce téléphone dès la première utilisation. Une connexion n'est nécessaire que pour cette étape — le reste de l'aventure fonctionne sans réseau.",

      prologue_kicker: "Prologue",
      listen_narration: "Écouter le récit",
      listen_enigma: "Écouter l'énigme",
      listen_instructions: "Écouter les indications",
      who_guides: "⚜ Qui vous guide",
      arrived_start: "Je suis arrivé à la Plaza de Oriente",

      stage_kicker: "Sceau {n} sur {total}",
      stage_timer: "⏱ {timer} · bonus si résolu en 2 min",
      answer_format: "Format : {format}",
      answer_placeholder: "Écrivez le code ici…",
      seal_answer: "Sceller la réponse",
      continue_route: "Continuer la route →",
      stage_solved_help: "Sceau ouvert avec aide · +{pts} doublons",
      stage_correct_bonus: "⚜ Correct ! +{pts} doublons (bonus de rapidité !)",
      stage_correct: "⚜ Correct ! +{pts} doublons",
      wrong_1: "Ce n'est pas la clé… l'Historien vous offre un indice.",
      wrong_2: "Pas encore… suivez les instructions directes.",
      wrong_3: "L'Historien révèle le secret. Lisez et continuez.",

      google_kicker: "Épreuve spéciale · La seule recherche autorisée",
      google_title: "L'oracle d'internet",
      google_open: "🔎 Ouvrir Google",
      google_placeholder: "Rue et numéro…",
      google_confirm: "Confirmer l'adresse",
      google_reveal: "L'adresse est <strong>{answer}</strong>. Appuyez à nouveau pour continuer.",
      google_correct: "⚜ Exact ! +{pts} doublons",
      google_wrong: "Ce n'est pas l'adresse exacte…",

      transition_kicker: "Sceau {n} ouvert ⚜",
      transition_heading: "En route vers {location}",
      transition_points: "+{pts} doublons gagnés",
      arrived_next: "Je suis arrivé — ouvrir le sceau suivant",

      victory_chronicle: "⚜ Chronique de l'expédition",
      victory_time: "Temps total : {time}",
      victory_album: "📸 Album de l'expédition",
      victory_share: "📤 Partager l'exploit",
      victory_again: "Rejouer",
      copied_clipboard: "Copié dans le presse-papiers",
      share_text: '⚜ J\'ai terminé « {title} » à Madrid : {score} doublons en {time}. Battrez-vous mon score ?',
    },
  };

  function t(key, vars) {
    const lang = getLang() || "es";
    let str = (STRINGS[lang] && STRINGS[lang][key]) || STRINGS.es[key] || key;
    if (vars) {
      for (const k in vars) str = str.replaceAll(`{${k}}`, vars[k]);
    }
    return str;
  }

  return { SUPPORTED, detectDefault, getLang, setLang, resolve, t };
})();
