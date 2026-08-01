const express = require("express");
const Progress = require("../models/Progress");
const requireAuth = require("../middleware/auth");

const router = express.Router();

// GET /api/progress — historial ordenado por fecha
router.get("/", requireAuth, async (req, res) => {
  const registros = await Progress.find({ userId: req.userId }).sort({ date: 1 });
  res.json({ registros });
});

// POST /api/progress — agregar un nuevo registro de peso
router.post("/", requireAuth, async (req, res) => {
  const { date, peso } = req.body;
  if (!date || !peso) return res.status(400).json({ error: "Faltan datos del registro." });

  const registro = await Progress.create({ userId: req.userId, date, peso });
  res.status(201).json({ registro });
});

module.exports = router;
