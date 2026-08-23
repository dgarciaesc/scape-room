# El Testamento del Siglo de Oro

Escape room urbano para móviles ambientado en el Madrid de los Austrias
(1561–1681). Seis enigmas presenciales del Palacio Real a la Plaza Mayor,
guiados por "El Historiador de la Villa".

**PWA sin dependencias**: HTML + CSS + JS vanilla. Funciona offline una vez
cargada (service worker), se instala como app en Android e iOS, y guarda el
progreso en el dispositivo.

## Jugar en local

```bash
python3 serve.py
```

Abre http://localhost:8080. Para probar en el móvil dentro de tu red wifi,
usa la IP local del ordenador (ej.: `http://192.168.1.x:8080`).

`serve.py` sirve los archivos sin caché. Es importante en desarrollo: con
`python3 -m http.server` el navegador se queda con el `index.html` y los
`.js` antiguos, y los cambios (imágenes nuevas incluidas) no se ven aunque
recargues. Si aun así ves una versión vieja, recarga forzando: **Cmd+Shift+R**
en Mac, o Ctrl+F5 en Windows.

> El service worker y la geolocalización requieren HTTPS (o localhost).
> En producción sirve siempre bajo HTTPS.

## Publicar en Web

Es un sitio estático: sube la carpeta tal cual a Netlify, Vercel, GitHub
Pages o cualquier hosting. Nada que compilar.

## Android

**Opción A — Instalar como PWA (sin tiendas):** abre la URL en Chrome
Android → menú ⋮ → "Añadir a pantalla de inicio". Se instala con icono y
pantalla completa.

**Opción B — APK/AAB para Play Store con [Capacitor](https://capacitorjs.com):**

```bash
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init "El Testamento del Siglo de Oro" com.davidgarcia.testamento --web-dir .
npx cap add android
npx cap open android
```

Compila desde Android Studio. La geolocalización necesita añadir en
`android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
```

**Opción C — TWA con [Bubblewrap](https://github.com/GoogleChromeLabs/bubblewrap):**
empaqueta la PWA ya publicada en HTTPS como app de Play Store sin tocar código.

## Estructura

```
index.html          Shell de la app
css/styles.css      Estética pergamino / Siglo de Oro
js/data.js          Marco del juego: título, prólogo, Historiador, victoria.
                    Las 6 pruebas NO están aquí (ver "Monetización" abajo)
js/license.js       Habla con el backend: código de licencia, dispositivo,
                    caché local de las etapas ya desbloqueadas
js/art.js           Grabados SVG de reserva (si una etapa no tiene photo)
img/                Obras de arte de época (dominio público, W. Commons)
js/engine.js        Validación (normaliza tildes/mayúsculas/separadores),
                    pistas progresivas, puntuación, guardado, haversine GPS
js/app.js           Pantallas, narración TTS, GPS, compartir, candado de licencia
sw.js               Cache offline
gracias.html        Página post-pago: muestra el código de licencia
backend/            Worker de Cloudflare + esquema D1 (ver backend/README.md)
manifest.webmanifest, icons/
```

## El personaje guía

**Don Baltasar de Quintana, Cronista Mayor de la Villa** (n. 1601) es quien
conduce la partida. El nombre es ficticio, con guiño a Jerónimo de Quintana,
cronista real de Madrid y autor de su primera historia (1629).

Su avatar es un recorte del «Retrato de un hombre» de Velázquez (c. 1630,
Apsley House): golilla, perilla y ropón negro de erudito de la corte de
Felipe IV. Se define en `narrator` dentro de `js/data.js` — cambiar nombre,
rol, biografía o imagen es editar ese bloque.

El avatar acompaña **todo** texto que él pronuncia: prólogo, trasfondo
histórico, enigmas, las tres pistas progresivas, indicaciones de camino,
prueba de Google y despedida final. Cada cabecera indica qué está haciendo
("os plantea el enigma", "os susurra una pista"), para que se lea como una
conversación con el guía.

## Monetización: licencia de pago por equipo

El juego **no funciona sin un código de licencia válido**. Al abrirlo por
primera vez aparece un candado en vez del botón de jugar, con dos opciones:
introducir un código ya comprado, o comprar uno (Stripe Checkout).

**Por qué no basta con JavaScript en el cliente:** cualquier "si no ha
pagado, bloquear" en el propio código se salta abriendo la consola del
navegador. Por eso el contenido real de las 6 pruebas (narrativa, enigmas,
pistas, respuestas) **no vive en este repositorio público** — se sirve
desde un backend (`backend/worker.js`, Cloudflare Workers + D1) solo tras
validar el código contra la base de datos. `js/data.js` solo contiene el
marco gratuito (título, prólogo, Historiador): no hay nada que "hackear"
ahí porque las respuestas no están.

- Un código = un equipo (hasta 6 personas) = un dispositivo, fijado en la
  primera vez que se usa.
- Tras la validación, las 6 pruebas se cachean en el móvil: tal como
  antes, el resto de la partida funciona sin cobertura — la única vez que
  hace falta conexión es para desbloquear al principio.
- Ver [`backend/README.md`](backend/README.md) para desplegar el backend
  (Cloudflare + Stripe, todo desde panel web, sin instalar nada) y
  conectar `js/license.js` a tu Worker.

## Mecánicas implementadas (según especificación)

- 6 etapas + prólogo + prueba única de Google (etapa 2 → 3) + victoria.
- Validación flexible: ignora mayúsculas, tildes, guiones, espacios y
  puntuación ("3 sueno" ≡ "3-SUEÑO").
- Pistas progresivas: 1 fallo → pista sutil · 2 fallos → instrucciones
  directas · 3 fallos → respuesta revelada con explicación y avance.
- Puntuación en "ducados": 1000/etapa, −100 por fallo, −250 por revelación.
- GPS opcional: botón "¿Estoy cerca?" (distancia haversine al hito) y enlace
  a Google Maps a pie. Nunca bloquea: se puede jugar en "modo sofá".
- En el prólogo, el plano de Texeira (1656) está georreferenciado: al
  pulsar "¿Estoy cerca?" aparece un punto pulsante con la posición real
  del jugador sobre el propio grabado antiguo. Se calibra con una
  transformación afín (`mapGeoref` en `js/data.js`) ajustada con 3 puntos
  identificables en el mapa (Plaza Mayor, Puerta del Sol, Plaza de la
  Villa); fuera de esa zona el punto se ajusta al borde más cercano y se
  marca en dorado como aproximado, ya que es un mapa manuscrito del
  s. XVII, no una ortofoto.
- Narración por voz masculina (Web Speech API). La voz no se deja al azar:
  se busca por nombre entre las masculinas de cada plataforma (Jorge, Diego,
  Pablo, Raúl, Reed…), prefiriendo acento de España, porque la primera voz
  «es» del sistema suele ser femenina (Mónica en Apple, Google español en
  Android). El tono va grave (pitch 0.85) para dar edad al cronista, y baja
  a 0.6 si el aparato solo tiene voces femeninas.
- Progreso persistente (localStorage): cierra el móvil a mitad de ruta y
  continúa donde estabas.
- Compartir resultado (Web Share API) al terminar.
- Obra de arte real (dominio público, Wikimedia Commons) en cada prueba,
  con su crédito: plano de Texeira (1656), «Las Meninas», «La batalla de
  Lepanto», Lope por Van der Hamen, el Cervantes de Jáuregui, el Calderón
  de Villafranca y «Fiesta real en la Plaza Mayor». Se definen con
  `photo` y `photoCaption` en `js/data.js` (si faltan, cae al grabado SVG
  de `js/art.js`).
- Foto de equipo con sello de lacre en cada hito conquistado (cámara del
  móvil, comprimida y guardada en local); álbum completo en la pantalla
  de victoria.
- Cronómetro por prueba con bonus de celeridad: +150 ducados si se
  resuelve a la primera en menos de 2 minutos. Tiempos por sello en la
  crónica final.
