/* ============================================================
   Grabados ilustrativos por etapa (SVG inline, sin red).
   Estilo: plancha de grabado sepia sobre pergamino.
   Para usar fotos reales: añade `photo: "img/etapa_X.jpg"` a la
   etapa en data.js y la app la mostrará en lugar del grabado.
   ============================================================ */

const ART_FRAME_OPEN =
  '<svg viewBox="0 0 400 230" xmlns="http://www.w3.org/2000/svg" role="img">' +
  '<defs><radialGradient id="pg" cx="0.5" cy="0.4" r="0.9">' +
  '<stop offset="0" stop-color="#f6ecd4"/><stop offset="1" stop-color="#e6d3ab"/>' +
  "</radialGradient></defs>" +
  '<rect width="400" height="230" rx="10" fill="url(#pg)"/>' +
  '<rect x="7" y="7" width="386" height="216" rx="7" fill="none" stroke="#b8860b" stroke-width="2.5"/>' +
  '<rect x="14" y="14" width="372" height="202" rx="5" fill="none" stroke="#b8860b" stroke-width="1" opacity="0.6"/>';

function artCaption(text) {
  return (
    '<text x="200" y="211" text-anchor="middle" font-family="Georgia,serif" ' +
    'font-size="12.5" letter-spacing="1.5" fill="#7a1f1f" font-weight="bold">' +
    text +
    "</text>"
  );
}

const STAGE_ART = {
  /* Prólogo: pergamino enrollado con sello de lacre */
  prologue:
    ART_FRAME_OPEN +
    '<g stroke="#4a3620" stroke-width="3" fill="#efe0bf">' +
    '<rect x="110" y="55" width="180" height="105" rx="6"/>' +
    '<ellipse cx="110" cy="107" rx="14" ry="55"/>' +
    '<ellipse cx="290" cy="107" rx="14" ry="55"/>' +
    "</g>" +
    '<g stroke="#4a3620" stroke-width="2" opacity="0.65">' +
    '<line x1="140" y1="80" x2="265" y2="80"/><line x1="140" y1="98" x2="265" y2="98"/>' +
    '<line x1="140" y1="116" x2="240" y2="116"/></g>' +
    '<circle cx="255" cy="145" r="24" fill="#7a1f1f" stroke="#5e1616" stroke-width="3"/>' +
    '<text x="255" y="153" text-anchor="middle" font-size="22" fill="#f0e3c8">✦</text>' +
    artCaption("EL TESTAMENTO PERDIDO · 1681") +
    "</svg>",

  /* Etapa 1: Velázquez — caballete, lienzo, paleta y corona real */
  etapa_1_plaza_oriente:
    ART_FRAME_OPEN +
    // caballete
    '<g stroke="#4a3620" stroke-width="4" stroke-linecap="round">' +
    '<line x1="150" y1="45" x2="105" y2="185"/><line x1="150" y1="45" x2="195" y2="185"/>' +
    '<line x1="150" y1="115" x2="150" y2="185"/></g>' +
    // lienzo con meninas esbozadas
    '<rect x="95" y="58" width="112" height="88" fill="#f6ecd4" stroke="#4a3620" stroke-width="3"/>' +
    '<g stroke="#4a3620" stroke-width="2" fill="none" opacity="0.8">' +
    '<path d="M125 132 q0 -22 12 -22 q12 0 12 22 Z"/>' +
    '<circle cx="137" cy="103" r="7"/>' +
    '<path d="M160 132 q0 -16 9 -16 q9 0 9 16 Z"/>' +
    '<circle cx="169" cy="110" r="5.5"/></g>' +
    // paleta y pincel
    '<ellipse cx="270" cy="150" rx="45" ry="30" fill="#e6d3ab" stroke="#4a3620" stroke-width="3.5"/>' +
    '<circle cx="252" cy="141" r="5" fill="#7a1f1f"/><circle cx="270" cy="137" r="5" fill="#b8860b"/>' +
    '<circle cx="288" cy="143" r="5" fill="#3f5d3a"/>' +
    '<line x1="238" y1="178" x2="305" y2="118" stroke="#4a3620" stroke-width="3.5" stroke-linecap="round"/>' +
    // corona
    '<g fill="#b8860b" stroke="#8a5c00" stroke-width="1.5">' +
    '<path d="M245 55 L255 32 L270 50 L282 28 L294 50 L309 32 L319 55 L319 66 L245 66 Z"/>' +
    '<rect x="245" y="69" width="74" height="9" rx="3"/></g>' +
    artCaption("VELÁZQUEZ · LA CORTE DEL ALCÁZAR") +
    "</svg>",

  /* Etapa 2: Lepanto — galera con velas y oleaje */
  etapa_2_plaza_villa:
    ART_FRAME_OPEN +
    // casco
    '<path d="M95 155 Q200 185 305 150 L285 128 L120 128 Z" fill="#4a3620"/>' +
    // mástiles y velas
    '<g stroke="#4a3620" stroke-width="3.5" stroke-linecap="round">' +
    '<line x1="160" y1="128" x2="160" y2="45"/><line x1="235" y1="128" x2="235" y2="55"/></g>' +
    '<path d="M160 50 Q205 72 160 100 Z" fill="#f6ecd4" stroke="#4a3620" stroke-width="2.5"/>' +
    '<path d="M235 60 Q275 80 235 105 Z" fill="#f6ecd4" stroke="#4a3620" stroke-width="2.5"/>' +
    // cruz en la vela mayor
    '<g stroke="#7a1f1f" stroke-width="3"><line x1="168" y1="62" x2="168" y2="88"/>' +
    '<line x1="160" y1="72" x2="177" y2="72"/></g>' +
    // gallardete
    '<path d="M160 45 L190 38 L160 52 Z" fill="#7a1f1f"/>' +
    // remos
    '<g stroke="#4a3620" stroke-width="2.5"><line x1="130" y1="140" x2="112" y2="162"/>' +
    '<line x1="165" y1="145" x2="150" y2="168"/><line x1="205" y1="148" x2="193" y2="170"/>' +
    '<line x1="245" y1="147" x2="236" y2="169"/></g>' +
    // olas
    '<g stroke="#4a3620" stroke-width="2.5" fill="none" opacity="0.7">' +
    '<path d="M70 172 q15 -10 30 0 q15 10 30 0 q15 -10 30 0 q15 10 30 0 q15 -10 30 0 q15 10 30 0 q15 -10 30 0 q15 10 30 0"/>' +
    '<path d="M85 186 q15 -9 30 0 q15 9 30 0 q15 -9 30 0 q15 9 30 0 q15 -9 30 0 q15 9 30 0 q15 -9 30 0"/></g>' +
    artCaption("LEPANTO · 1571 · ÁLVARO DE BAZÁN") +
    "</svg>",

  /* Etapa 3: Lope de Vega — libro abierto, pluma y dintel PARVA DOMUS */
  etapa_3_casa_lope_vega:
    ART_FRAME_OPEN +
    // dintel de piedra
    '<rect x="90" y="38" width="220" height="34" rx="4" fill="#e6d3ab" stroke="#4a3620" stroke-width="3"/>' +
    '<text x="200" y="61" text-anchor="middle" font-family="Georgia,serif" font-size="15" ' +
    'letter-spacing="2" fill="#4a3620" font-weight="bold">PARVA DOMVS SED MAGNA QVIES</text>' +
    // libro abierto
    '<path d="M115 170 Q160 150 200 165 Q240 150 285 170 L285 115 Q240 98 200 112 Q160 98 115 115 Z" ' +
    'fill="#f6ecd4" stroke="#4a3620" stroke-width="3.5"/>' +
    '<line x1="200" y1="112" x2="200" y2="165" stroke="#4a3620" stroke-width="2.5"/>' +
    '<g stroke="#4a3620" stroke-width="1.8" opacity="0.6">' +
    '<line x1="130" y1="122" x2="185" y2="115"/><line x1="130" y1="134" x2="185" y2="127"/>' +
    '<line x1="130" y1="146" x2="185" y2="139"/>' +
    '<line x1="215" y1="115" x2="270" y2="122"/><line x1="215" y1="127" x2="270" y2="134"/></g>' +
    // pluma
    '<path d="M262 148 Q300 95 322 78 Q310 112 275 152 Z" fill="#4a3620" opacity="0.9"/>' +
    '<line x1="262" y1="148" x2="252" y2="162" stroke="#4a3620" stroke-width="3" stroke-linecap="round"/>' +
    artCaption("LOPE DE VEGA · EL FÉNIX DE LOS INGENIOS") +
    "</svg>",

  /* Etapa 4: Cervantes — molino quijotesco y lanza */
  etapa_4_convento_trinitarias:
    ART_FRAME_OPEN +
    // cerro
    '<path d="M60 190 Q200 158 340 190 Z" fill="#e6d3ab" stroke="#4a3620" stroke-width="2.5"/>' +
    // torre del molino
    '<path d="M175 175 L185 92 L225 92 L235 175 Z" fill="#f6ecd4" stroke="#4a3620" stroke-width="3.5"/>' +
    '<path d="M182 92 Q205 70 228 92 Z" fill="#7a1f1f" stroke="#4a3620" stroke-width="2.5"/>' +
    '<rect x="196" y="140" width="18" height="35" fill="#4a3620"/>' +
    '<circle cx="205" cy="112" r="5" fill="#4a3620"/>' +
    // aspas
    '<g stroke="#4a3620" stroke-width="4" stroke-linecap="round">' +
    '<line x1="205" y1="90" x2="150" y2="35"/><line x1="205" y1="90" x2="262" y2="35"/>' +
    '<line x1="205" y1="90" x2="148" y2="143"/><line x1="205" y1="90" x2="262" y2="142"/></g>' +
    '<g fill="none" stroke="#4a3620" stroke-width="2.5">' +
    '<path d="M150 35 L172 30 L212 74"/><path d="M262 35 L240 30 L200 72"/>' +
    '<path d="M148 143 L155 120 L196 96"/><path d="M262 142 L255 119 L214 96"/></g>' +
    // lanza apoyada
    '<line x1="290" y1="180" x2="330" y2="80" stroke="#4a3620" stroke-width="3.5" stroke-linecap="round"/>' +
    '<path d="M330 80 L338 62 L324 72 Z" fill="#4a3620"/>' +
    artCaption("CERVANTES · 1616 · TRINITARIAS") +
    "</svg>",

  /* Etapa 5: Calderón — máscaras de teatro y telón */
  etapa_5_plaza_santa_ana:
    ART_FRAME_OPEN +
    // telón
    '<path d="M20 20 Q60 78 40 210 L20 210 Z" fill="#7a1f1f" opacity="0.9"/>' +
    '<path d="M380 20 Q340 78 360 210 L380 210 Z" fill="#7a1f1f" opacity="0.9"/>' +
    '<path d="M20 20 Q200 58 380 20 L380 34 Q200 72 20 34 Z" fill="#7a1f1f"/>' +
    // máscara comedia
    '<g stroke="#4a3620" stroke-width="3.5">' +
    '<path d="M120 75 q42 -12 52 28 q8 42 -22 58 q-34 14 -48 -22 q-10 -40 18 -64 Z" fill="#f6ecd4"/>' +
    '<path d="M138 105 q7 -7 14 0" fill="none"/><path d="M164 100 q7 -7 14 0" fill="none"/>' +
    '<path d="M138 132 q16 16 34 -4" fill="none" stroke-width="4"/></g>' +
    // máscara tragedia
    '<g stroke="#4a3620" stroke-width="3.5">' +
    '<path d="M280 75 q-42 -12 -52 28 q-8 42 22 58 q34 14 48 -22 q10 -40 -18 -64 Z" fill="#e6d3ab"/>' +
    '<path d="M262 103 q-7 -7 -14 0" fill="none"/><path d="M236 98 q-7 -7 -14 0" fill="none"/>' +
    '<path d="M232 138 q16 -16 34 4" fill="none" stroke-width="4"/></g>' +
    artCaption("CALDERÓN · LA VIDA ES SUEÑO") +
    "</svg>",

  /* Etapa 6: Plaza Mayor — soportales y jinete de bronce */
  etapa_6_plaza_mayor:
    ART_FRAME_OPEN +
    // arcada
    '<g fill="#e6d3ab" stroke="#4a3620" stroke-width="3">' +
    '<rect x="40" y="60" width="320" height="130"/>' +
    '<path d="M65 190 v-70 q0 -25 25 -25 q25 0 25 25 v70 Z" fill="#f6ecd4"/>' +
    '<path d="M160 190 v-70 q0 -25 25 -25 q25 0 25 25 v70 Z" fill="#f6ecd4"/>' +
    '<path d="M255 190 v-70 q0 -25 25 -25 q25 0 25 25 v70 Z" fill="#f6ecd4"/></g>' +
    '<g stroke="#4a3620" stroke-width="2" opacity="0.7">' +
    '<rect x="70" y="70" width="20" height="14" fill="none"/><rect x="190" y="70" width="20" height="14" fill="none"/>' +
    '<rect x="310" y="70" width="20" height="14" fill="none"/></g>' +
    // estatua ecuestre (silueta) sobre pedestal, delante de la arcada central
    '<rect x="165" y="150" width="80" height="40" fill="#b8860b" stroke="#8a5c00" stroke-width="2.5"/>' +
    '<g fill="#4a3620">' +
    // caballo
    '<path d="M178 150 l6 -22 q2 -10 12 -12 l28 -4 q10 -2 14 6 l6 10 l8 -2 l4 8 l-8 4 l-6 -2 q-2 8 -10 10 l-4 12 l-8 0 l2 -11 l-16 2 l-3 9 l-8 0 l2 -10 q-8 -2 -9 -8 Z"/>' +
    // jinete
    '<circle cx="212" cy="94" r="7"/>' +
    '<path d="M204 102 l16 0 l-2 18 l-12 0 Z"/>' +
    '<path d="M219 104 l14 -6 l2 5 l-13 7 Z"/></g>' +
    artCaption("PLAZA MAYOR · FELIPE III · 1616") +
    "</svg>",
};
