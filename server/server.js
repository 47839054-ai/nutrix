require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const path = require("path");
const express = require("express");
const cors = require("cors");
const connectDB = require("./db");

const authRoutes = require("./routes/auth");
const testRoutes = require("./routes/test");
const planRoutes = require("./routes/plan");
const progressRoutes = require("./routes/progress");
const foodRoutes = require("./routes/food");
const mealRoutes = require("./routes/meals");
const statsRoutes = require("./routes/stats");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/test", testRoutes);
app.use("/api/plan", planRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/foods", foodRoutes);
app.use("/api/meals", mealRoutes);
app.use("/api/stats", statsRoutes);

app.use(express.static(path.join(__dirname, "..", "public")));

async function start() {
  await connectDB();
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`Nutrix corriendo en http://localhost:${port}`));
}

start();
