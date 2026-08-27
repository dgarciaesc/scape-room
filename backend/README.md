# Backend de licencias — despliegue

Todo se hace **desde el panel web de Cloudflare y Stripe**, sin instalar
nada en el ordenador (tu Mac no tiene Node ni Homebrew, y no hace falta
para esto).

Coste fijo mensual a esta escala: **0 €**. Solo paga Stripe su comisión
por transacción (~1.5% + 0.25€).

**Nota sobre idiomas:** `worker.js` sirve las 6 pruebas en español,
inglés o francés según el `lang` que mande el cliente en `/api/redeem`
(`js/data.js`/`js/i18n.js` en el frontend). Si en el futuro cambias el
guion de una prueba, edítalo en las tres versiones dentro de `STAGES_I18N`
y vuelve a pegar el archivo entero en "Edit code" — no hay build ni
despliegue parcial, el paso es siempre "sustituir todo el código y
Save and deploy".

---

## 1. Cloudflare: base de datos D1

1. Crea una cuenta gratuita en **[dash.cloudflare.com](https://dash.cloudflare.com)** (si no tienes ya una)
2. Menú lateral → **Workers & Pages** → pestaña **D1** → **Create database**
3. Nombre: `testamento-licencias` → Create
4. Entra en la base de datos creada → pestaña **Console**
5. Abre [schema.sql](schema.sql) de este repo, copia todo su contenido, pégalo en la consola y ejecútalo (botón "Execute")
6. Verifica que se creó: en la consola ejecuta `SELECT * FROM licenses;` — debe devolver una tabla vacía sin error

## 2. Cloudflare: el Worker

1. **Workers & Pages** → **Create** → **Workers** → **Create Worker**
2. Nombre: `testamento-licencias` (o el que prefieras) → Deploy (con el código de ejemplo, luego lo sustituimos)
3. Una vez creado, pulsa **Edit code** (el editor "Quick Edit")
4. Borra todo el contenido y pega el de [worker.js](worker.js) de este repo → **Save and deploy**
5. **Copia la URL** que te asigna Cloudflare, arriba del editor — algo como `https://testamento-licencias.tu-usuario.workers.dev`. La necesitarás en el paso 5.

### Conectar el Worker con la base de datos

6. En el Worker → **Settings** → **Bindings** → **Add binding** → **D1 database**
7. Variable name: `DB` (exactamente así, en mayúsculas — el código lo espera) → selecciona `testamento-licencias` → Save

### Variables de entorno

8. **Settings** → **Variables and Secrets** → añade estas 5 (marca **Encrypt** en las tres primeras, son secretas):

   | Nombre | Valor | Encrypt |
   |---|---|---|
   | `STRIPE_SECRET_KEY` | tu clave secreta de Stripe (paso 3) | ✅ |
   | `STRIPE_WEBHOOK_SECRET` | la firma del webhook (paso 3) | ✅ |
   | `STRIPE_PRICE_ID` | el ID del precio creado en Stripe (paso 3) | ✅ |
   | `SITE_URL` | `https://dgarciaesc.github.io/scape-room` (con la ruta, sin barra final — se usa para construir las URLs de vuelta de Stripe) | — |
   | `ALLOWED_ORIGIN` | `https://dgarciaesc.github.io` (⚠️ **sin** la ruta `/scape-room` — el navegador nunca incluye la ruta en la cabecera `Origin`, así que si pones la ruta aquí, CORS bloquea todas las peticiones) | — |

   Guarda y **vuelve a desplegar** el Worker tras añadirlas (Deploy).

## 3. Stripe: cobro

1. Crea cuenta en **[stripe.com](https://dashboard.stripe.com/register)** (gratis, sin cuota fija)
2. **Product catalog** → **Add product**: nombre "Testamento del Siglo de Oro — Licencia de equipo", precio único (p.ej. 19€), tipo "One time" → guarda
3. Copia el **Price ID** (empieza por `price_...`) → es el valor de `STRIPE_PRICE_ID` de arriba
4. **Developers → API keys** → copia la **Secret key** (`sk_live_...` en modo real, `sk_test_...` en modo prueba — usa `sk_test_` mientras pruebas) → es `STRIPE_SECRET_KEY`
5. **Developers → Webhooks** → **Add endpoint**:
   - URL: `https://TU-WORKER.workers.dev/api/stripe-webhook` (la del paso 2.5)
   - Evento a escuchar: `checkout.session.completed`
   - Crea el endpoint → copia el **Signing secret** (`whsec_...`) → es `STRIPE_WEBHOOK_SECRET`

**Recomendación:** prueba primero todo en modo **Test** de Stripe (claves `sk_test_`/`whsec_` de test, tarjeta de prueba `4242 4242 4242 4242`) antes de pasar a modo real (`sk_live_`).

## 4. Conectar el frontend

Edita **[js/license.js](../js/license.js)**, línea `WORKER_URL`, y pon la URL real del Worker (paso 2.5). Luego:

```bash
git add -A
git commit -m "Conectar backend de licencias"
git push
```

## 5. Probar de punta a punta

1. Abre `https://dgarciaesc.github.io/scape-room/` en una pestaña nueva (o borra `localStorage` en las herramientas de desarrollador)
2. Pulsa "Comprar licencia" → paga con la tarjeta de prueba `4242 4242 4242 4242`, cualquier fecha futura y CVC
3. Deberías caer en `gracias.html` con un código `MADRID-XXXXXX`
4. Vuelve al juego, introdúcelo → debería desbloquear las 6 pruebas

## Soporte: incidencias habituales

- **Cliente perdió el móvil / borró datos y no puede reactivar su código**: en la consola D1 (paso 1.4) ejecuta:
  ```sql
  UPDATE licenses SET status='unused', device_id=NULL WHERE code='MADRID-XXXXXX';
  ```
- **Generar un código sin pasar por Stripe** (regalo, prensa, ensayo):
  ```sql
  INSERT INTO licenses (code, status, created_at) VALUES ('MADRID-REGALO1', 'unused', unixepoch()*1000);
  ```
- **Ver todas las licencias vendidas**:
  ```sql
  SELECT code, status, email, datetime(created_at/1000,'unixepoch') AS creado FROM licenses ORDER BY created_at DESC;
  ```

## Qué NO hace este backend (todavía)

- No envía el código por email automáticamente — el comprador lo ve en pantalla en `gracias.html` tras pagar. Si cierra la pestaña sin apuntarlo, tendrás que buscarlo tú en D1 por su email (Stripe lo captura) y dárselo a mano.
- No hay panel de administración — la gestión de licencias es por SQL directo en el panel de Cloudflare (ver arriba).
- No hay reventa/generación masiva de códigos para agencias — se puede añadir extendiendo `handleWebhook`/un endpoint nuevo cuando haga falta.
