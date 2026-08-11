require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const path = require("path");
const fs = require("fs");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const connectDB = require("./db");

const authRoutes = require("./routes/auth");
const testRoutes = require("./routes/test");
const planRoutes = require("./routes/plan");
const progressRoutes = require("./routes/progress");
const foodRoutes = require("./routes/food");
const mealRoutes = require("./routes/meals");
const statsRoutes = require("./routes/stats");
const recipeRoutes = require("./routes/recipes");

const app = express();

function validarSecretoJwt() {
  const secret = process.env.JWT_SECRET || "";
  const ejemplo = "cambiar-esto-por-un-secreto-largo-y-unico";
  if (!secret || secret === ejemplo || secret.length < 32) {
    console.error(
      "SEGURIDAD: JWT_SECRET es muy corto o es el valor de ejemplo.\n" +
      "Genera uno fuerte con:  node -e \"console.log(require('crypto').randomBytes(48).toString('hex'))\"\n" +
      "y pegalo en tu archivo .env"
    );
    process.exit(1);
  }
}
validarSecretoJwt();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: "100kb" }));

const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173,http://localhost:3000,http://localhost,capacitor://localhost")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PATCH", "DELETE"],
  })
);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Demasiados intentos. Espera unos minutos e intenta de nuevo." },
});

const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Limite de generaciones alcanzado. Intentá más tarde." },
});

app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api/auth/forgot-password", authLimiter);
app.use("/api/auth/reset-password", authLimiter);
app.use("/api/plan/generate", aiLimiter);
app.use("/api/plan/regenerate-meal", aiLimiter);

app.use("/api/auth", authRoutes);
app.use("/api/test", testRoutes);
app.use("/api/plan", planRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/foods", foodRoutes);
app.use("/api/meals", mealRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/recipes", recipeRoutes);

const distDir = path.join(__dirname, "..", "client", "dist");
const staticDir = fs.existsSync(path.join(distDir, "index.html"))
  ? distDir
  : path.join(__dirname, "..", "public");
app.use(express.static(staticDir));

async function start() {
  await connectDB();
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`Nutrix corriendo en http://localhost:${port}`));
}

start();
