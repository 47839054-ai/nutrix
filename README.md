# Nutrix

## Novedades de esta versión

- **UI tipo app de celular**: se reemplazó el dashboard con sidebar +
  scroll por pantallas de tamaño completo ("ventanas") que se
  deslizan al navegar, con una barra de navegación inferior fija
  (patrón típico de apps móviles). El Test de salud ahora es un
  wizard de 4 pasos, cada uno también una "ventana" que se desliza.
  Ver `public/js/app.js` (`showView`/`positionScreens` para las
  pantallas principales, `positionWizardSteps` para el wizard) y los
  estilos nuevos al final de `public/css/style.css`.
- **"Generar plan" ya no depende obligatoriamente de la IA**: si no
  hay `ANTHROPIC_API_KEY` configurada, o si la llamada a Claude
  falla, el backend arma el plan con un motor de reglas
  determinístico (IMC, TMB, calorías y agua calculados en
  `server/utils/nutricion.js`, más un catálogo de productos
  filtrado por restricciones). Así "Generar plan" funciona siempre,
  aunque no hayas cargado la clave de Anthropic todavía.


App de nutrición hecha con lo mismo que se ve en cursada de desarrollo:
**HTML + CSS + JavaScript puro** en el frontend, y **Node.js + Express +
MongoDB** en el backend. Sin React, sin frameworks de frontend, sin
build tools.

## 1. Qué hace cada carpeta

```
nutrix/
├── server/                  ← BACKEND (Node + Express + MongoDB)
│   ├── server.js            ← punto de entrada: arranca Express y Mongo
│   ├── db.js                ← conexión a MongoDB (mongoose.connect)
│   ├── models/               ← "tablas" de Mongo, una por colección
│   │   ├── User.js
│   │   ├── TestAnswers.js
│   │   ├── Plan.js
│   │   └── Progress.js
│   ├── routes/                ← los endpoints de la API (/api/...)
│   │   ├── auth.js           ← registro, login, perfil, preferencias
│   │   ├── test.js           ← guardar/leer el test de salud
│   │   ├── plan.js           ← generar/leer el plan (llama a Claude)
│   │   └── progress.js       ← historial de peso
│   └── middleware/
│       └── auth.js           ← valida el token de sesión (JWT)
│
├── public/                   ← FRONTEND (esto es lo que ve el navegador)
│   ├── index.html            ← toda la app: login + pantallas (una SPA simple)
│   ├── css/style.css         ← todos los estilos
│   └── js/
│       ├── api.js            ← funciones para hablar con el backend (fetch)
│       └── app.js            ← toda la lógica: formularios, vistas, render
│
├── package.json               ← dependencias del backend
├── .env.example                ← plantilla de variables de entorno
└── .gitignore
```

## 2. Cómo se conectan las partes (para entender el flujo)

1. Abrís `index.html` en el navegador (servido por Express, no como
   archivo suelto).
2. `app.js` maneja el formulario de login/registro y llama a
   `Api.login(...)` (definido en `api.js`), que hace un `fetch` a
   `POST /api/auth/login`.
3. Esa ruta vive en `server/routes/auth.js`. Busca el usuario en
   MongoDB con el modelo `User`, compara la contraseña con `bcrypt` y
   devuelve un token (JWT).
4. El frontend guarda ese token en `localStorage` y lo manda en el
   header `Authorization` de cada pedido siguiente (mirá `getToken()`
   en `api.js`).
5. `server/middleware/auth.js` revisa ese token en cada ruta protegida
   y le dice a la ruta "este pedido es del usuario X" (`req.userId`).
6. Cada ruta usa `req.userId` para buscar **solo** los datos de ese
   usuario en Mongo (así un usuario no puede ver los datos de otro).

Ese patrón (form → fetch → ruta Express → modelo Mongoose → Mongo →
JSON de vuelta → JS pinta el DOM) se repite igual en las 6 pantallas
que ya están armadas: Inicio, Test de salud, Plan, Comercios,
Progreso, Ayuda.

## 3. Qué tenés que hacer vos para levantarlo

### a) Instalar MongoDB (una de las dos)
- **Local**: instalá MongoDB Community Server y dejalo corriendo
  (`mongod`). La cadena de conexión queda
  `mongodb://127.0.0.1:27017/nutrix`.
- **Atlas (más fácil, gratis)**: creá una cuenta en
  https://www.mongodb.com/cloud/atlas, un cluster gratuito, un usuario
  de base y copiá el connection string que te da (`mongodb+srv://...`).

### b) Configurar las variables de entorno
```bash
cp .env.example .env
```
Abrí `.env` y completá:
- `MONGO_URI` → tu cadena de conexión (local o Atlas).
- `JWT_SECRET` → cualquier texto largo inventado por vos.
- `ANTHROPIC_API_KEY` → tu clave de https://console.anthropic.com/
  (sin esto, todo funciona **excepto** "Generar plan", que va a tirar
  un error explicando que falta la clave).

`.env` está en `.gitignore` — nunca se sube al repo, porque tiene
tus claves.

### c) Instalar dependencias y correr
```bash
npm install
npm run dev      # reinicia solo cuando guardás cambios
# o
npm start        # una sola vez, sin reinicio automático
```
Después abrís `http://localhost:3000` en el navegador.

## 4. Qué falta (para cuando me mandes los casos de uso)

Quedó armado el **núcleo funcional**: registro/login con MongoDB real,
test de salud, generación de plan con IA, comercios cercanos,
progreso de peso y ayuda/contacto. Lo que faltaría sumar más adelante,
siguiendo exactamente el mismo patrón (modelo → ruta → función en
`app.js` → sección en `index.html`):

- **Comunidad** (reseñas de productos, visibles para todos)
- **Escáner nutricional** (subir foto de etiqueta, requiere
  suscripción)
- **Panel de administrador** (métricas, solo rol `admin`)

El modelo `User` ya tiene el campo `role` (`"usuario"` o `"admin"`)
preparado para cuando quieras agregar esa pantalla.

## 5. Git — cómo subir esto a un repositorio

Si todavía no lo hiciste en esta carpeta:
```bash
git init
git add .
git commit -m "Nutrix: backend Express + MongoDB y frontend HTML/JS"
```

Después, para subirlo a GitHub (creá el repo vacío ahí primero, sin
README ni .gitignore para que no choque):
```bash
git remote add origin <URL-de-tu-repo>
git branch -M main
git push -u origin main
```

De ahí en más, el flujo de todos los días:
```bash
git add .
git commit -m "mensaje corto de qué cambiaste"
git push
```

Importante: como `.env` está en `.gitignore`, cuando otra persona (o
vos en otra compu) clone el repo, tiene que copiar `.env.example` a
`.env` y completar sus propias claves — el repo nunca va a tener tus
contraseñas ni tu API key adentro.
