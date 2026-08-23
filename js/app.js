/* ============================================================
   Interfaz: pantallas, narración TTS, GPS, progreso
   ============================================================ */

(() => {
  const $screen = document.getElementById("screen");
  const $topbar = document.getElementById("topbar");
  const $sealTrack = document.getElementById("sealTrack");
  const $scoreValue = document.getElementById("scoreValue");
  const $toast = document.getElementById("toast");

  const S = Engine.state;

  /* ---------- Utilidades ---------- */
  function el(html) {
    const t = document.createElement("template");
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }

  let toastTimer;
  function toast(msg, ms = 2600) {
    $toast.textContent = msg;
    $toast.classList.remove("hidden");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => $toast.classList.add("hidden"), ms);
  }

  /* ---------- Narración (Web Speech API) ----------
     Don Baltasar debe sonar a hombre. El catálogo de voces varía mucho
     entre dispositivos y la primera voz "es" suele ser femenina (Mónica en
     Apple, Google español en Android), así que se elige por nombre. */

  // Voces masculinas en español por plataforma, de más a menos preferida
  const MALE_VOICES = [
    "jorge", "diego", "pablo", "raul", "raúl", "alvaro", "álvaro", // Apple / Microsoft
    "carlos", "juan", "enrique", "javier", "miguel", "paco",
    "reed", "rocko", "eddy", "grandpa", // voces de sistema recientes de Apple
  ];

  // Femeninas habituales, para descartarlas cuando no hay coincidencia clara
  const FEMALE_VOICES = [
    "monica", "mónica", "paulina", "marisol", "esperanza", "helena", "laura",
    "sabina", "dalia", "elena", "lucia", "lucía", "penelope", "penélope",
    "flo", "sandy", "shelley", "grandma", "isabela", "camila", "google español",
  ];

  const tts = {
    _voice: undefined, // se resuelve una vez y se reutiliza

    pickVoice() {
      const voices = speechSynthesis.getVoices();
      if (!voices.length) return null;
      const spanish = voices.filter((v) => v.lang.toLowerCase().startsWith("es"));
      if (!spanish.length) return null;

      // España primero: es el acento del personaje
      const byLocale = (list) => [
        ...list.filter((v) => v.lang.toLowerCase().startsWith("es-es")),
        ...list.filter((v) => !v.lang.toLowerCase().startsWith("es-es")),
      ];
      const name = (v) => (v.name + " " + (v.voiceURI || "")).toLowerCase();

      // 1) voz masculina conocida, por orden de preferencia
      for (const wanted of MALE_VOICES) {
        const hit = byLocale(spanish).find((v) => name(v).includes(wanted));
        if (hit) return hit;
      }
      // 2) voces que se declaran masculinas (Android: "...#male_1")
      const tagged = byLocale(spanish).find((v) => /male|masculin|hombre/.test(name(v)));
      if (tagged && !/female|femenin/.test(name(tagged))) return tagged;
      // 3) cualquiera que no sea una femenina conocida
      const neutral = byLocale(spanish).find(
        (v) => !FEMALE_VOICES.some((f) => name(v).includes(f))
      );
      return neutral || byLocale(spanish)[0];
    },

    /* Si el dispositivo solo ofrece voces femeninas, se compensa bajando
       más el tono para que Don Baltasar no suene a mujer. */
    pitchFor(voice) {
      if (!voice) return 0.85;
      const n = (voice.name + " " + (voice.voiceURI || "")).toLowerCase();
      return FEMALE_VOICES.some((f) => n.includes(f)) ? 0.6 : 0.85;
    },

    voice() {
      if (this._voice === undefined) {
        const v = this.pickVoice();
        // getVoices() llega vacío al principio en algunos navegadores:
        // no memorizar hasta que haya catálogo
        if (v === null) return null;
        this._voice = v;
      }
      return this._voice;
    },

    speak(text, btn) {
      if (!("speechSynthesis" in window)) {
        toast("Tu navegador no soporta narración por voz");
        return;
      }
      if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
        if (btn && btn.dataset.speaking === "1") {
          btn.dataset.speaking = "";
          btn.textContent = "🔊";
          return;
        }
      }
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "es-ES";
      u.rate = 1.0;
      const voice = this.voice();
      if (voice) u.voice = voice;
      u.pitch = this.pitchFor(voice); // grave: es un cronista entrado en años
      if (btn) {
        btn.dataset.speaking = "1";
        btn.textContent = "⏸";
        u.onend = u.onerror = () => {
          btn.dataset.speaking = "";
          btn.textContent = "🔊";
        };
      }
      speechSynthesis.speak(u);
    },
    stop() {
      if ("speechSynthesis" in window) speechSynthesis.cancel();
    },
  };

  /* El catálogo de voces se carga de forma asíncrona: se pide cuanto antes
     y se reevalúa la elección cuando el sistema lo completa. */
  if ("speechSynthesis" in window) {
    speechSynthesis.getVoices();
    speechSynthesis.addEventListener("voiceschanged", () => {
      tts._voice = undefined;
    });
  }

  /* ---------- Barra superior ---------- */
  function renderTopbar() {
    $topbar.classList.toggle(
      "hidden",
      S.screen === "title" || S.screen === "prologue"
    );
    $scoreValue.textContent = S.score;
    $sealTrack.innerHTML = "";
    GAME_DATA.stages.forEach((st, i) => {
      const done =
        i < S.stageIndex || (S.screen === "victory" && i <= S.stageIndex);
      const cls = done ? "seal done" : i === S.stageIndex ? "seal current" : "seal";
      $sealTrack.appendChild(el(`<div class="${cls}">${done ? "✦" : st.num}</div>`));
    });
  }

  /* ---------- GPS ----------
     `onMap`, si se pasa, georreferencia al jugador sobre un plano
     histórico: {georef, container} donde container es el <figure> de la
     imagen. Hoy solo se usa en el prólogo, con el plano de Texeira. */
  function gpsCheck(targetCoords, $status, onMap) {
    if (!("geolocation" in navigator)) {
      $status.textContent = "Este dispositivo no dispone de GPS.";
      return;
    }
    $status.textContent = "Consultando la brújula real…";
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const here = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        const d = Engine.distanceMeters(here, targetCoords);
        if (d < 120) {
          $status.textContent = "✔ ¡Habéis llegado al lugar señalado!";
          $status.classList.add("near");
        } else if (d < 100000) {
          $status.textContent = `Estáis a ${Math.round(d)} m del objetivo. ¡Seguid caminando!`;
          $status.classList.remove("near");
        } else {
          $status.textContent =
            "Estáis muy lejos de Madrid… pero podéis jugar en modo sofá igualmente.";
        }
        if (onMap) placePinOnMap(here, onMap, $status);
      },
      () => {
        $status.textContent =
          "Sin señal de GPS (permiso denegado). Podéis continuar sin él.";
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  /* Dibuja (o mueve) el punto "estáis aquí" sobre un plano histórico
     georreferenciado, usando la transformación afín de data.js. */
  function placePinOnMap(here, { georef, container }, $status) {
    if (!container) return;
    const pos = Engine.projectToMap(here, georef);
    let pin = container.querySelector(".user-map-pin");
    if (!pin) {
      pin = el(`
        <div class="user-map-pin" title="Vuestra posición aproximada">
          <span class="pin-ring"></span>
          <span class="pin-dot"></span>
        </div>`);
      container.appendChild(pin);
    }
    pin.style.left = pos.xPercent + "%";
    pin.style.top = pos.yPercent + "%";
    pin.classList.toggle("approximate", pos.approximate);
    if ($status) {
      $status.insertAdjacentHTML(
        "beforeend",
        pos.approximate
          ? " <span class='pin-note'>(os situamos donde el plano alcanza)</span>"
          : " <span class='pin-note'>· ⚜ marcados en el plano</span>"
      );
    }
  }

  function mapsLink(coords, label) {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}&travelmode=walking`;
    return `<a class="map-link" href="${url}" target="_blank" rel="noopener">🗺 Cómo llegar a ${label}</a>`;
  }

  /* ---------- El Historiador: cabecera con su avatar ----------
     Se antepone a todo texto que pronuncia el guía, para que se vea
     quién habla. `tag` describe el tipo de intervención. */
  const NARRATOR = GAME_DATA.narrator;

  function speaker(tag) {
    return `
      <div class="speaker">
        <img class="speaker-avatar" src="${NARRATOR.avatar}"
             alt="${NARRATOR.name}, ${NARRATOR.role}" />
        <div class="speaker-id">
          <span class="speaker-name">${NARRATOR.name}</span>
          <span class="speaker-tag">${tag}</span>
        </div>
      </div>`;
  }

  /* Avatar suelto y pequeño, para pistas y avisos breves */
  function miniAvatar() {
    return `<img class="mini-avatar" src="${NARRATOR.avatar}" alt="${NARRATOR.name}" />`;
  }

  /* ---------- Obra de arte de cada etapa ---------- */
  /* Cuadro/grabado histórico (photo) con su crédito; si la etapa no
     tiene imagen, cae al grabado SVG de art.js */
  function artCard(item, alt, id) {
    // El id va en el envoltorio de la imagen (no en el <figure>): así el
    // pie de foto no descuadra los porcentajes al posicionar un punto
    // sobre la imagen (ver placePinOnMap).
    const idAttr = id ? ` id="${id}"` : "";
    if (item.photo) {
      return `
        <figure class="art-card">
          <div class="art-card-imgwrap"${idAttr}>
            <img src="${item.photo}" alt="${alt}" loading="lazy" />
          </div>
          ${item.photoCaption ? `<figcaption>${item.photoCaption}</figcaption>` : ""}
        </figure>`;
    }
    const key = item.id || "prologue";
    return STAGE_ART[key] ? `<div class="art-card"${idAttr}>${STAGE_ART[key]}</div>` : "";
  }

  /* ---------- Fotos de recuerdo ---------- */
  function photoSection(stage, onSaved) {
    const existing = Engine.getPhotos()[stage.id];
    const wrap = el(`
      <div class="photo-section">
        <div id="photoPreview">${
          existing
            ? `<div class="photo-frame"><img src="${existing}" alt="Foto del equipo" />
                 <div class="photo-seal">✦</div></div>`
            : ""
        }</div>
        <button class="btn-secondary" id="btnPhoto">
          📸 ${existing ? "Repetir foto de recuerdo" : `Foto de recuerdo en ${stage.location}`}
        </button>
        <input type="file" accept="image/*" capture="environment" id="photoInput" hidden />
      </div>
    `);
    const $input = wrap.querySelector("#photoInput");
    wrap.querySelector("#btnPhoto").onclick = () => $input.click();
    $input.onchange = () => {
      const file = $input.files && $input.files[0];
      if (!file) return;
      const img = new Image();
      img.onload = () => {
        // reducir a máx. 640 px para no agotar el almacenamiento local
        const scale = Math.min(1, 640 / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.72);
        URL.revokeObjectURL(img.src);
        if (Engine.savePhoto(stage.id, dataUrl)) {
          wrap.querySelector("#photoPreview").innerHTML = `
            <div class="photo-frame"><img src="${dataUrl}" alt="Foto del equipo" />
              <div class="photo-seal">✦</div></div>`;
          wrap.querySelector("#btnPhoto").textContent = "📸 Repetir foto de recuerdo";
          toast("⚜ Foto sellada en la crónica");
          if (onSaved) onSaved();
        } else {
          toast("No hay espacio para guardar la foto");
        }
      };
      img.src = URL.createObjectURL(file);
    };
    return wrap;
  }

  /* ---------- Navegación entre pantallas ---------- */
  let stageTimerInterval = null;

  function go(screen) {
    tts.stop();
    clearInterval(stageTimerInterval);
    S.screen = screen;
    Engine.save();
    render();
    window.scrollTo(0, 0);
  }

  function render() {
    renderTopbar();
    $screen.innerHTML = "";
    const views = {
      title: viewTitle,
      prologue: viewPrologue,
      stage: viewStage,
      google: viewGoogle,
      transition: viewTransition,
      victory: viewVictory,
    };
    (views[S.screen] || viewTitle)();
  }

  /* ---------- Pantalla: título ---------- */
  function viewTitle() {
    const hasSave = S.startedAt && !S.finishedAt;
    const v = el(`
      <div class="title-screen">
        <div class="title-emblem">👑</div>
        <h1>${GAME_DATA.title}</h1>
        <p class="title-sub">${GAME_DATA.subtitle}</p>
        <div class="ornament">❦ ❦ ❦</div>
        <p class="title-meta">
          6 sellos ocultos en piedra y bronce<br />
          Del Palacio Real a la Plaza Mayor · ~2 h a pie<br />
          Recomendado: jugar en la calle, en equipo
        </p>
        <button class="btn-primary" id="btnStart">
          ${hasSave ? "▶ Continuar la investigación" : "Comenzar la aventura"}
        </button>
        ${hasSave ? '<button class="btn-ghost" id="btnReset">Empezar de nuevo</button>' : ""}
      </div>
    `);
    v.querySelector("#btnStart").onclick = () => {
      if (hasSave) {
        go(S.stageIndex === 0 && !S.stageLog.length && S.screen === "title" ? "stage" : resumeScreen());
      } else {
        go("prologue");
      }
    };
    const btnReset = v.querySelector("#btnReset");
    if (btnReset)
      btnReset.onclick = () => {
        if (confirm("¿Borrar la partida guardada y empezar de nuevo?")) {
          Engine.reset();
          location.reload();
        }
      };
    $screen.appendChild(v);
  }

  function resumeScreen() {
    // reanudar en la pantalla guardada, con respaldo a la etapa actual
    const valid = ["stage", "google", "transition", "victory", "prologue"];
    return valid.includes(S.savedScreen) ? S.savedScreen : "stage";
  }

  /* ---------- Pantalla: prólogo ---------- */
  function viewPrologue() {
    const p = GAME_DATA.prologue;
    const v = el(`
      <div>
        <div class="stage-header">
          <div class="stage-kicker">Prólogo</div>
          <h2>${p.title}</h2>
        </div>
        <figure class="art-card narrator-portrait">
          <img src="${NARRATOR.portrait}" alt="${NARRATOR.name}" />
          <figcaption>
            <strong>${NARRATOR.name}</strong> · ${NARRATOR.role}<br />
            <span class="art-credit">${NARRATOR.portraitCaption}</span>
          </figcaption>
        </figure>
        <div class="card">
          <div class="card-label">⚜ Quién os guía</div>
          <p class="narrator-bio">${NARRATOR.bio}</p>
        </div>
        <div class="card">
          <button class="btn-audio" title="Escuchar narración">🔊</button>
          ${speaker("os encomienda una misión")}
          <p>${p.text}</p>
        </div>
        ${artCard(p, "Plano de Madrid de Texeira, 1656", "prologueMap")}
        ${mapsLink(p.startCoords, p.startLocation)}
        <p class="gps-status" id="gpsStatus"></p>
        <button class="btn-secondary" id="btnGps">📍 ¿Estoy cerca?</button>
        <button class="btn-primary" id="btnGo">He llegado a la Plaza de Oriente</button>
      </div>
    `);
    v.querySelector(".btn-audio").onclick = (e) => tts.speak(p.text, e.currentTarget);
    v.querySelector("#btnGps").onclick = () =>
      gpsCheck(p.startCoords, v.querySelector("#gpsStatus"), {
        georef: p.mapGeoref,
        container: v.querySelector("#prologueMap"),
      });
    v.querySelector("#btnGo").onclick = () => {
      if (!S.startedAt) S.startedAt = Date.now();
      go("stage");
    };
    $screen.appendChild(v);
  }

  /* ---------- Pantalla: etapa (enigma) ---------- */
  function viewStage() {
    const st = Engine.currentStage();
    // arranca el cronómetro de la prueba (persiste entre recargas)
    if (!S.stageEnteredAt) {
      S.stageEnteredAt = Date.now();
      Engine.save();
    }
    const art = artCard(st, st.landmark);
    const v = el(`
      <div>
        <div class="stage-header">
          <div class="stage-kicker">Sello ${st.num} de ${GAME_DATA.stages.length}</div>
          <h2>${st.title}</h2>
          <p class="location-line">📍 ${st.location} · ${st.landmark}</p>
          <p class="stage-timer">⏱ <span id="stageTimer">0 s</span> · bonus si resolvéis en 2 min</p>
        </div>

        ${art}

        <div class="card">
          <button class="btn-audio" data-say="narrative" title="Escuchar narración">🔊</button>
          ${speaker("relata la historia del lugar")}
          <p>${st.narrative}</p>
        </div>

        <div class="card enigma">
          <button class="btn-audio" data-say="enigma" title="Escuchar enigma">🔊</button>
          ${speaker("os plantea el enigma")}
          <p>${st.enigma}</p>
        </div>

        <form class="answer-form" id="answerForm">
          <p class="answer-format">Formato: ${st.answerFormat}</p>
          <input type="text" id="answerInput" placeholder="Escribid aquí la clave…"
                 autocomplete="off" autocapitalize="characters" enterkeyhint="go" />
          <div class="attempts-dots" id="attemptDots"></div>
          <div id="hintArea"></div>
          <button type="submit" class="btn-primary" id="btnSubmit">Sellar la respuesta</button>
        </form>
      </div>
    `);

    v.querySelectorAll(".btn-audio").forEach((b) => {
      b.onclick = (e) => {
        e.preventDefault();
        tts.speak(b.dataset.say === "enigma" ? st.enigma : st.narrative, b);
      };
    });

    const $input = v.querySelector("#answerInput");
    const $hintArea = v.querySelector("#hintArea");
    const $dots = v.querySelector("#attemptDots");
    const $btnSubmit = v.querySelector("#btnSubmit");

    function renderDots() {
      $dots.innerHTML = "";
      for (let i = 0; i < 3; i++) {
        $dots.appendChild(
          el(`<div class="attempt-dot ${i < S.attempts ? "used" : ""}"></div>`)
        );
      }
    }

    function renderHints() {
      $hintArea.innerHTML = "";
      if (S.attempts >= 1) {
        $hintArea.appendChild(
          el(`<div class="hint-box subtle">
                <div class="hint-title">${miniAvatar()} Don Baltasar os susurra una pista</div>
                ${st.hintSubtle}
              </div>`)
        );
      }
      if (S.attempts >= 2) {
        $hintArea.appendChild(
          el(`<div class="hint-box direct">
                <div class="hint-title">${miniAvatar()} Don Baltasar os guía paso a paso</div>
                <ol>${st.directions.map((d) => `<li>${d}</li>`).join("")}</ol>
              </div>`)
        );
      }
      if (S.attempts >= 3) {
        $hintArea.appendChild(
          el(`<div class="hint-box reveal">
                <div class="hint-title">${miniAvatar()} Don Baltasar revela el secreto</div>
                ${st.revealExplanation}
              </div>`)
        );
        $btnSubmit.textContent = "Continuar la ruta →";
      }
    }

    renderDots();
    renderHints();

    // cronómetro visible de la prueba
    const $timer = v.querySelector("#stageTimer");
    const tick = () => {
      const s = Math.round((Date.now() - S.stageEnteredAt) / 1000);
      $timer.textContent = Engine.formatSeconds(s);
      $timer.parentElement.classList.toggle("over", s > 120);
    };
    tick();
    stageTimerInterval = setInterval(tick, 1000);

    v.querySelector("#answerForm").onsubmit = (e) => {
      e.preventDefault();
      // tras 3 fallos, el botón avanza directamente (regla 4 de la espec.)
      if (S.attempts >= 3) {
        const pts = Engine.completeStage(true);
        S.lastPoints = pts;
        toast(`Sello abierto con ayuda · +${pts} ducados`);
        go("transition");
        return;
      }
      const val = $input.value;
      if (!val.trim()) return;
      if (Engine.checkAnswer(val, st)) {
        const pts = Engine.completeStage(false);
        S.lastPoints = pts;
        const last = S.stageLog[S.stageLog.length - 1];
        toast(
          last.bonus
            ? `⚜ ¡Correcto! +${pts} ducados (¡bonus de celeridad!)`
            : `⚜ ¡Correcto! +${pts} ducados`
        );
        go("transition");
      } else {
        S.attempts++;
        Engine.save();
        $input.classList.remove("shake");
        void $input.offsetWidth; // reiniciar animación
        $input.classList.add("shake");
        $input.select();
        renderDots();
        renderHints();
        renderTopbar();
        const msgs = [
          "Esa no es la clave… el Historiador os ofrece una pista.",
          "Aún no… seguid las instrucciones directas.",
          "El Historiador revela el secreto. Leed y continuad.",
        ];
        toast(msgs[Math.min(S.attempts - 1, 2)]);
      }
    };

    $screen.appendChild(v);
  }

  /* ---------- Pantalla: prueba de Google (etapa 2 → 3) ---------- */
  function viewGoogle() {
    const st = GAME_DATA.stages[1]; // transición definida en la etapa 2
    const tr = st.transition;
    const v = el(`
      <div>
        <div class="stage-header">
          <div class="stage-kicker">Prueba especial · Única búsqueda permitida</div>
          <h2>El oráculo de internet</h2>
        </div>
        <div class="card">
          ${speaker("os concede una excepción")}
          <p>${tr.text}</p>
        </div>
        <div class="card enigma">
          ${speaker("os plantea la pregunta")}
          <p>${tr.question}</p>
        </div>
        <a class="map-link" href="https://www.google.com/search?q=Casa+Museo+Lope+de+Vega+Madrid+direcci%C3%B3n"
           target="_blank" rel="noopener">🔎 Abrir Google</a>
        <form class="answer-form" id="googleForm">
          <input type="text" id="googleInput" placeholder="Calle y número…"
                 autocomplete="off" enterkeyhint="go" />
          <div id="googleHints"></div>
          <button type="submit" class="btn-primary">Confirmar dirección</button>
        </form>
      </div>
    `);

    const $input = v.querySelector("#googleInput");
    const $hints = v.querySelector("#googleHints");

    function renderGoogleHints() {
      $hints.innerHTML = "";
      if (S.googleAttempts >= 1)
        $hints.appendChild(
          el(`<div class="hint-box subtle">
                <div class="hint-title">${miniAvatar()} Don Baltasar os susurra una pista</div>
                ${tr.hintSubtle}
              </div>`)
        );
      if (S.googleAttempts >= 2)
        $hints.appendChild(
          el(`<div class="hint-box direct">
                <div class="hint-title">${miniAvatar()} Don Baltasar os guía paso a paso</div>
                <ol>${tr.directions.map((d) => `<li>${d}</li>`).join("")}</ol>
              </div>`)
        );
      if (S.googleAttempts >= 3)
        $hints.appendChild(
          el(`<div class="hint-box reveal">
                <div class="hint-title">${miniAvatar()} Don Baltasar revela el secreto</div>
                La dirección es <strong>${tr.answer}</strong>. Pulsad de nuevo para continuar.
              </div>`)
        );
    }
    renderGoogleHints();

    v.querySelector("#googleForm").onsubmit = (e) => {
      e.preventDefault();
      if (S.googleAttempts >= 3) {
        const pts = Engine.completeGoogle(true);
        S.lastPoints = pts;
        S.pendingWalkText = tr.walkText;
        Engine.advanceStage();
        go("transition");
        return;
      }
      if (Engine.checkGoogleAnswer($input.value, tr)) {
        const pts = Engine.completeGoogle(false);
        S.lastPoints = pts;
        S.pendingWalkText = tr.walkText;
        toast(`⚜ ¡Exacto! +${pts} ducados`);
        Engine.advanceStage();
        go("transition");
      } else {
        S.googleAttempts++;
        Engine.save();
        $input.classList.remove("shake");
        void $input.offsetWidth;
        $input.classList.add("shake");
        renderGoogleHints();
        toast("Esa no es la dirección exacta…");
      }
    };

    $screen.appendChild(v);
  }

  /* ---------- Pantalla: transición a pie ---------- */
  /* Se muestra tras resolver una etapa. Dos casos:
     a) etapa con transición "walk"/"victory": aún NO se ha avanzado
     b) tras la prueba de Google: ya se avanzó, S.pendingWalkText definido */
  function viewTransition() {
    const afterGoogle = !!S.pendingWalkText;
    const solvedStage = afterGoogle
      ? GAME_DATA.stages[S.stageIndex - 1]
      : Engine.currentStage();
    const tr = solvedStage.transition;

    // Caso especial: la etapa 2 desemboca en la prueba de Google
    if (!afterGoogle && tr.type === "google") {
      go("google");
      return;
    }
    if (!afterGoogle && tr.type === "victory") {
      Engine.advanceStage(); // marca fin de partida
      go("victory");
      return;
    }

    const next = afterGoogle
      ? Engine.currentStage()
      : GAME_DATA.stages[S.stageIndex + 1];
    const walkText = afterGoogle ? S.pendingWalkText : tr.text;

    const v = el(`
      <div>
        <div class="stage-header">
          <div class="stage-kicker">Sello ${solvedStage.num} abierto ⚜</div>
          <h2>Rumbo a ${next.location}</h2>
          ${S.lastPoints ? `<p class="location-line">+${S.lastPoints} ducados ganados</p>` : ""}
        </div>
        <div class="card">
          <button class="btn-audio" title="Escuchar indicaciones">🔊</button>
          ${speaker("os indica el camino")}
          <p>${walkText}</p>
        </div>
        ${mapsLink(next.coords, next.location)}
        <p class="gps-status" id="gpsStatus"></p>
        <button class="btn-secondary" id="btnGps">📍 ¿Estoy cerca?</button>
        <button class="btn-primary" id="btnArrived">He llegado — abrir el siguiente sello</button>
      </div>
    `);

    // foto de equipo en el hito recién conquistado
    v.insertBefore(photoSection(solvedStage), v.querySelector(".map-link"));

    v.querySelector(".btn-audio").onclick = (e) => tts.speak(walkText, e.currentTarget);
    v.querySelector("#btnGps").onclick = () =>
      gpsCheck(next.coords, v.querySelector("#gpsStatus"));
    v.querySelector("#btnArrived").onclick = () => {
      S.pendingWalkText = null;
      S.lastPoints = 0;
      if (!afterGoogle) Engine.advanceStage();
      go("stage");
    };

    $screen.appendChild(v);
  }

  /* ---------- Pantalla: victoria ---------- */
  function viewVictory() {
    const vic = GAME_DATA.victory;
    const rows = S.stageLog
      .map(
        (l) =>
          `<tr><td>${l.title}</td>
           <td class="time-cell">${Engine.formatSeconds(l.seconds)}${l.bonus ? " ⚡" : ""}</td>
           <td>${l.revealed ? "🔓" : l.attempts === 0 ? "⚜" : "✔"} ${l.points}</td></tr>`
      )
      .join("");
    const photos = Engine.getPhotos();
    const gallery = GAME_DATA.stages
      .filter((st) => photos[st.id])
      .map(
        (st) => `
          <figure class="photo-frame gallery-item">
            <img src="${photos[st.id]}" alt="Foto en ${st.location}" />
            <div class="photo-seal">✦</div>
            <figcaption>${st.location}</figcaption>
          </figure>`
      )
      .join("");
    const v = el(`
      <div class="victory-screen">
        <div class="victory-emblem">🏆</div>
        <h1>${vic.title}</h1>
        <div class="ornament">❦ ❦ ❦</div>
        <div class="card">
          <button class="btn-audio" title="Escuchar">🔊</button>
          ${speaker("os da las gracias")}
          <p>${vic.text}</p>
        </div>
        <div class="card">
          <div class="card-label">⚜ Crónica de la expedición</div>
          <div class="big-score">${S.score} ducados</div>
          <p class="location-line">Tiempo total: ${Engine.elapsedText()}</p>
          <table class="stats-table"><tbody>${rows}</tbody></table>
        </div>
        ${
          gallery
            ? `<div class="card"><div class="card-label">📸 Álbum de la expedición</div>
                 <div class="photo-grid">${gallery}</div></div>`
            : ""
        }
        <div id="finalPhotoSlot"></div>
        <button class="btn-secondary" id="btnShare">📤 Compartir hazaña</button>
        <button class="btn-ghost" id="btnAgain">Jugar de nuevo</button>
      </div>
    `);
    v.querySelector(".btn-audio").onclick = (e) => tts.speak(vic.text, e.currentTarget);
    // foto de la victoria en la Plaza Mayor (la etapa final no pasa por transición)
    const lastStage = GAME_DATA.stages[GAME_DATA.stages.length - 1];
    const slot = v.querySelector("#finalPhotoSlot");
    slot.appendChild(photoSection(lastStage, render)); // re-render: entra en el álbum
    v.querySelector("#btnShare").onclick = async () => {
      const text =
        `⚜ He completado "El Testamento del Siglo de Oro" en Madrid: ` +
        `${S.score} ducados en ${Engine.elapsedText()}. ¿Superarás mi marca?`;
      if (navigator.share) {
        try {
          await navigator.share({ title: GAME_DATA.title, text });
        } catch (e) {}
      } else {
        try {
          await navigator.clipboard.writeText(text);
          toast("Copiado al portapapeles");
        } catch (e) {
          toast(text, 5000);
        }
      }
    };
    v.querySelector("#btnAgain").onclick = () => {
      Engine.reset();
      location.reload();
    };
    $screen.appendChild(v);
  }

  /* ---------- Arranque ---------- */
  const restored = Engine.load();
  if (restored && S.startedAt && !S.finishedAt) {
    S.savedScreen = S.screen; // recordar dónde iba para "Continuar"
    S.screen = "title";
  } else if (restored && S.finishedAt) {
    // partida acabada: mostrar victoria de nuevo
    S.screen = "victory";
  } else {
    S.screen = "title";
  }
  render();
})();
