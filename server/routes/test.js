const express = require("express");
const User = require("../models/User");
const TestAnswers = require("../models/TestAnswers");
const requireAuth = require("../middleware/auth");
const { calcularIndicadores } = require("../utils/nutricion");

const router = express.Router();

// GET /api/test — traer las respuestas guardadas del usuario actual
router.get("/", requireAuth, async (req, res) => {
  const answers = await TestAnswers.findOne({ userId: req.userId });
  const indicadores = answers ? calcularIndicadores(answers.toObject()) : null;
  res.json({ answers: answers || null, indicadores });
});

// POST /api/test — crear o actualizar (upsert) las respuestas del usuario
// Marca el test como completado y sincroniza datos al perfil del usuario.
router.post("/", requireAuth, async (req, res) => {
  const { edad, sexo, peso, altura, actividad, objetivo, tipoAlimentacion, restricciones, preferenciasNoComer, condiciones } = req.body;

  const answers = await TestAnswers.findOneAndUpdate(
    { userId: req.userId },
    { edad, sexo, peso, altura, actividad, objetivo, tipoAlimentacion, restricciones, preferenciasNoComer, condiciones },
    { new: true, upsert: true }
  );

  // Sincronizar datos antropométricos y de objetivo al perfil del usuario
  const userUpdate = {
    testCompleted: true,
  };
  if (edad) userUpdate.age = edad;
  if (sexo) userUpdate.sex = sexo === "Masculino" ? "male" : "female";
  if (peso) userUpdate.weight = peso;
  if (altura) userUpdate.height = altura;
  if (actividad) {
    const actMap = { sedentario: "sedentary", moderado: "moderate", activo: "active", muy_activo: "very_active" };
    userUpdate.activityLevel = actMap[actividad] || actividad;
  }
  if (objetivo) {
    const objMap = { bajar: "lose_weight", mantener: "maintain", masa: "gain_muscle", salud: "maintain" };
    userUpdate.goal = objMap[objetivo] || objetivo;
  }
  if (peso) userUpdate.dailyWaterGoal = Math.round(peso * 35);

  await User.findByIdAndUpdate(req.userId, userUpdate);

  const indicadores = calcularIndicadores(answers.toObject());
  res.json({ answers, indicadores });
});

module.exports = router;
