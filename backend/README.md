# Invoicer — Backend

PERN (PostgreSQL, Express, React, Node) backendas **Invoicer**
sistemai: klientai, sąskaitos, pajamų statistika ir Gemini AI funkcijos
(pvz. kvitų skenavimas, verslo santraukos, priminimai).

Reikalauja **Node.js 20+**.

## Paleidimas

```bash
npm install
cp .env.example .env   # jei yra — užpildyk DB ir Gemini raktus
npm run migrate        # duomenų bazės migracijos
npm run seed           # pradiniai duomenys (nebūtina)
npm run dev            # kūrimo režimas su auto-reload (nodemon)
npm start              # produkcija
```

Įėjimo taškas: `src/server.js`.

## NPM skriptai

| Skriptas | Kam skirtas |
| --- | --- |
| `npm run dev` | Paleidžia serverį su `nodemon` — perkrauna po kodo pakeitimų |
| `npm start` | Paleidžia serverį produkcijai (`node src/server.js`) |
| `npm run migrate` | Paleidžia DB migracijas (`scripts/migrate.js`) |
| `npm run seed` | Užpildo DB pradiniais duomenimis (`scripts/seed.js`) |

## Priklausomybės (`dependencies`)

| Paketas | Versija | Už ką atsako |
| --- | --- | --- |
| **express** | ^5.2.1 | HTTP serverio karkasas: maršrutai, middleware, JSON atsakai. Visos `/api` endpoint'ų šaknys eina per Express. |
| **pg** | ^8.13.1 | PostgreSQL klientas. Jungiasi prie DB, vykdo SQL užklausas (klientai, sąskaitos, mokėjimai ir t. t.). |
| **dotenv** | ^17.4.2 | Įkelia kintamuosius iš `.env` į `process.env` (DB URL, JWT secret, Gemini API raktas, PORT). |
| **cors** | ^2.8.6 | CORS middleware. Leidžia frontendui (Vite, pvz. `localhost:5173`) kviesti backend API iš kitos kilmės. |
| **cookie-parser** | ^1.4.7 | Parsina HTTP cookies. Naudojamas JWT / sesijos cookie skaitymui iš užklausų. |
| **jsonwebtoken** | ^9.0.3 | JWT tokenų kūrimas ir tikrinimas. Autentifikacija: prisijungus išduodamas tokenas, saugomose užklausose jis verifikuojamas. |
| **bcrypt** | ^6.0.0 | Slaptažodžių maišymas (hash) ir palyginimas. Slaptažodžiai DB niekada nelaikomi atviru tekstu. |
| **zod** | ^4.4.3 | Request body / query validacija. Tikrina, kad API gautų teisingos formos duomenis prieš juos rašant į DB. |
| **morgan** | ^1.10.1 | HTTP užklausų loggeris. Konsolėje rodo metodą, kelią, statusą ir trukmę — patogu debuginti. |
| **multer** | ^2.1.1 | `multipart/form-data` failų įkėlimas. Reikalingas kvitų / sąskaitų nuotraukų upload'ui prieš AI analizę. |
| **express-rate-limit** | ^8.5.2 | Užklausų dažnio ribojimas. Apsauga nuo brute-force (login) ir AI endpoint'ų piktnaudžiavimo. |
| **@google/genai** | ^2.6.0 | Oficialus Google Gemini SDK. AI funkcijos: kvitų OCR/skenavimas, verslo santraukos, priminimai, pastabos. |

## Kūrimo priklausomybės (`devDependencies`)

| Paketas | Versija | Už ką atsako |
| --- | --- | --- |
| **nodemon** | 3.1.9 | Stebi failų pakeitimus ir automatiškai perkrauna Node procesą. Naudojamas tik `npm run dev`. |
