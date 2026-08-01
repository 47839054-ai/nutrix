const User = require("../models/User");
const Meal = require("../models/Meal");
const Progress = require("../models/Progress");
const { calcularIMC, clasificarIMC, calcularTMB, calcularCaloriasDiarias, calculateMacroTargets, formatDate } = require("../utils/nutricion");

async function getDashboardStats(req, res) {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "Usuario no encontrado." });

    const today = formatDate(new Date());
    const meals = await Meal.find({ userId: req.userId, date: today });

    let totalCalories = 0;
    let totalProtein = 0;
    let totalFat = 0;
    let totalCarbs = 0;
    let waterMl = 0;

    for (const meal of meals) {
      if (meal.mealType === "water") {
        waterMl += meal.totalCalories;
      } else {
        totalCalories += meal.totalCalories;
        totalProtein += meal.totalProtein;
        totalFat += meal.totalFat;
        totalCarbs += meal.totalCarbs;
      }
    }

    const tmb = calcularTMB({
      peso: user.weight,
      altura: user.height,
      edad: user.age,
      sexo: user.sex,
    });

    const caloriesGoal = calcularCaloriasDiarias(tmb, user.activityLevel, user.goal);
    const macroTargets = calculateMacroTargets(user.goal, caloriesGoal);

    const imc = calcularIMC(user.weight, user.height);

    res.json({
      today: {
        date: today,
        calories: { current: Math.round(totalCalories), goal: caloriesGoal || 0 },
        protein: { current: Math.round(totalProtein), goal: macroTargets.protein },
        fat: { current: Math.round(totalFat), goal: macroTargets.fat },
        carbs: { current: Math.round(totalCarbs), goal: macroTargets.carbs },
        water: { current: Math.round(waterMl), goal: user.dailyWaterGoal },
      },
      profile: {
        imc: imc,
        imcClassification: clasificarIMC(imc),
        tmb: tmb,
        goal: user.goal,
        targetWeight: user.targetWeight,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error del servidor al obtener estadísticas." });
  }
}

async function getWeightHistory(req, res) {
  try {
    const records = await Progress.find({ userId: req.userId }).sort({ date: 1 });
    res.json({ records });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error del servidor al obtener historial de peso." });
  }
}

async function addWeightRecord(req, res) {
  try {
    const { date, peso } = req.body;
    if (!date || !peso) {
      return res.status(400).json({ error: "La fecha y el peso son obligatorios." });
    }

    const record = await Progress.create({
      userId: req.userId,
      date,
      peso,
    });

    res.status(201).json({ record });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error del servidor al agregar registro de peso." });
  }
}

async function getProgressStats(req, res) {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "Usuario no encontrado." });

    const weightRecords = await Progress.find({ userId: req.userId }).sort({ date: 1 });

    let weightTrend = null;
    if (weightRecords.length >= 2) {
      const first = weightRecords[0].peso;
      const last = weightRecords[weightRecords.length - 1].peso;
      weightTrend = {
        startWeight: first,
        currentWeight: last,
        change: Math.round((last - first) * 10) / 10,
        direction: last < first ? "down" : last > first ? "up" : "stable",
      };
    }

    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const startDate = formatDate(thirtyDaysAgo);

    const meals = await Meal.find({
      userId: req.userId,
      date: { $gte: startDate },
    });

    const caloriesByDate = {};
    for (const meal of meals) {
      if (meal.mealType !== "water") {
        if (!caloriesByDate[meal.date]) {
          caloriesByDate[meal.date] = 0;
        }
        caloriesByDate[meal.date] += meal.totalCalories;
      }
    }

    const avgCalories =
      Object.values(caloriesByDate).length > 0
        ? Math.round(
            Object.values(caloriesByDate).reduce((a, b) => a + b, 0) /
              Object.values(caloriesByDate).length
          )
        : 0;

    const tmb = calcularTMB({
      peso: user.weight,
      altura: user.height,
      edad: user.age,
      sexo: user.sex,
    });
    const calorieGoal = calcularCaloriasDiarias(tmb, user.activityLevel, user.goal);

    let goalComplianceDays = 0;
    let totalDaysTracked = Object.keys(caloriesByDate).length;
    for (const cal of Object.values(caloriesByDate)) {
      if (calorieGoal) {
        const diff = Math.abs(cal - calorieGoal);
        if (diff <= calorieGoal * 0.15) {
          goalComplianceDays++;
        }
      }
    }

    const compliancePercentage =
      totalDaysTracked > 0 ? Math.round((goalComplianceDays / totalDaysTracked) * 100) : 0;

    res.json({
      weightTrend,
      avgCalories,
      calorieGoal,
      goalCompliance: {
        daysOnTarget: goalComplianceDays,
        totalDaysTracked,
        percentage: compliancePercentage,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error del servidor al obtener estadísticas de progreso." });
  }
}

module.exports = {
  getDashboardStats,
  getWeightHistory,
  addWeightRecord,
  getProgressStats,
};
