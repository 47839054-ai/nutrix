# Nutrix

Aplicación de nutrición **full stack** que genera planes de alimentación personalizados, permite escanear códigos de barras para conocer productos, seguir el progreso de peso y registrar comidas. Disponible como **app web** y como **app móvil** (Android/iOS).

Construida con **React + Vite + Tailwind CSS** (frontend), **Node.js + Express + MongoDB** (backend) e **IA (Claude)** para la generación de planes.

---

## Funcionalidades

- **Registro y login seguro** con JWT + bcrypt, más inicio de sesión con **Google (OAuth2)**
- **Test de salud** en wizard de pasos → calcula IMC, TMB, calorías y objetivos
- **Plan de alimentación** generado por **IA (Claude)** con motor de reglas determinístico de respaldo (funciona incluso sin clave de IA)
- **Escáner de códigos de barras** con datos de Open Food Facts (con cámara en la app móvil)
- **Registro de comidas** con resúmenes diarios/semanales/mensuales
- **Recetas**, **lista de compras**, **estadísticas** con gráficos y **progreso de peso**
- **Recuperación de contraseña** por email (código de 6 dígitos, expira en 30 min)
- **Rotación de planes** (variante nueva cada 3 días para no repetir comidas)
- **App móvil** empaquetada con Capacitor (APK de Android funcional)

---

## Arquitectura

```
Navegador / App móvil (Capacitor)
        │
        ▼  HTTP + JSON (REST API)
┌──────────────────────────────────┐
│  server/  (Node.js + Express)    │
│  routes/  → controllers/models   │
│  middleware/auth  (JWT)          │
└──────────────┬───────────────────┘
               ▼
        MongoDB (Mongoose)
```

### Estructura de carpetas

```
nutrix/
├── server/               ← Backend (Node + Express + MongoDB)
│   ├── server.js         ← entrada + seguridad (helmet, rate-limit, CORS)
│   ├── db.js             ← conexión a MongoDB
│   ├── middleware/auth.js← verifica el token JWT en rutas protegidas
│   ├── controllers/      ← la lógica de cada recurso
│   ├── routes/           ← las rutas de la API (/api/...)
│   ├── models/           ← esquemas de MongoDB
│   └── utils/            ← IA, nutrición, email, Open Food Facts
│
├── client/               ← Frontend (React + Vite + Tailwind)
│   ├── src/pages/        ← pantallas (Login, Dashboard, Plan, Scanner...)
│   ├── src/contexts/     ← AuthContext, DashboardContext, ThemeContext
│   ├── src/services/api.js ← el "mozo": habla con el backend
│   └── dist/             ← build de producción (se genera con npm run build)
│
├── .env                  ← variables de entorno (NUNCA se sube a git)
├── render.yaml           ← config de deploy (Render)
└── DEPLOY.md             ← guía para subir la app a internet
```

---

## Seguridad

- **Contraseñas**: hasheadas con `bcrypt` (nunca se guardan en texto plano)
- **Sesiones**: tokens **JWT** firmados con un secreto fuerte (el servidor se niega a arrancar si `JWT_SECRET` es débil o el de ejemplo)
- **Rutas protegidas**: middleware `requireAuth` verifica el token en cada ruta privada; cada usuario solo accede a sus datos (`req.userId`)
- **Helmet**: headers de seguridad HTTP
- **Rate limiting**: máximo de intentos de login/registro (anti fuerza bruta) y límite de generaciones de IA (protege el crédito)
- **CORS restringido**: solo orígenes permitidos
- **Secretos**: claves en `.env` / variables de entorno, nunca en el código ni en git

---

## Correr en local

### Requisitos
- Node.js 18+
- MongoDB (local con `mongod`, o Atlas gratis)

### 1. Configurar variables
```powershell
copy .env.example .env
```
Completá `MONGO_URI` (local: `mongodb://127.0.0.1:27017/nutrix`). Generá un `JWT_SECRET` fuerte:
```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### 2. Instalar dependencias
```powershell
npm install
cd client
npm install
cd ..
```

### 3. Levantar backend y frontend
En dos terminales:

```powershell
# Terminal 1: backend (puerto 3000)
npm start

# Terminal 2: frontend (puerto 5173)
cd client
npm run dev
```

Abriste `http://localhost:5173` en el navegador.

> También existe `iniciar.ps1` que levanta backend + frontend, abre Android Studio y Chrome con un solo comando.

### Modo producción (opcional)
```powershell
cd client
npm run build
cd ..
npm start
```
El servidor sirve el build (`client/dist`) automáticamente.

---

## Desplegar en línea

Seguí la guía paso a paso en **[DEPLOY.md](./DEPLOY.md)** (MongoDB Atlas gratis + Render gratis, ~20 minutos).

---

## API (resumen)

| Endpoint | Método | Protegida | Descripción |
|---|---|---|---|
| `/api/auth/register` | POST | No | Crear cuenta |
| `/api/auth/login` | POST | No | Iniciar sesión (JWT) |
| `/api/auth/google` | POST | No | Login con Google |
| `/api/auth/me` | GET | Sí | Perfil del usuario |
| `/api/test` | GET/POST | Sí | Test de salud |
| `/api/plan/generate` | POST | Sí | Generar plan (IA + respaldo) |
| `/api/meals` | GET/POST | Sí | Registrar comidas |
| `/api/foods/search` | GET | Sí | Buscar alimentos |
| `/api/stats/dashboard` | GET | Sí | Estadísticas |
| `/api/recipes` | GET/POST/DELETE | Sí | Recetas |

---

## Stack

**Frontend:** React 18, Vite, Tailwind CSS, React Router, Recharts, Capacitor
**Backend:** Node.js, Express, MongoDB (Mongoose), JWT, bcrypt, Claude AI
**Automatización:** Google OAuth, Open Food Facts, Nodemailer

---

*Proyecto personal desarrollado como parte de la formación en Desarrollo de Software.*
