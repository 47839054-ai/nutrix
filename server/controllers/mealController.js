const Meal = require("../models/Meal");
const Food = require("../models/Food");
const { formatDate } = require("../utils/nutricion");

async function logMeal(req, res) {
  try {
    const { date, mealType, foods, notes } = req.body;

    if (!date || !mealType) {
      return res.status(400).json({ error: "La fecha y el tipo de comida son obligatorios." });
    }

    const validTypes = ["breakfast", "lunch", "snack", "dinner", "water"];
    if (!validTypes.includes(mealType)) {
      return res.status(400).json({ error: `Tipo de comida inválido. Valores válidos: ${validTypes.join(", ")}` });
    }

    const processedFoods = [];
    let totalCalories = 0;
    let totalProtein = 0;
    let totalFat = 0;
    let totalCarbs = 0;

    if (foods && Array.isArray(foods)) {
      for (const item of foods) {
        let nutritionData = null;

        if (item.foodId) {
          const foodDoc = await Food.findById(item.foodId);
          if (foodDoc) {
            const factor = (item.quantity || 100) / 100;
            nutritionData = {
              calories: Math.round(foodDoc.nutritionPer100g.calories * factor * 10) / 10,
              protein: Math.round(foodDoc.nutritionPer100g.protein * factor * 10) / 10,
              fat: Math.round(foodDoc.nutritionPer100g.fat * factor * 10) / 10,
              carbs: Math.round(foodDoc.nutritionPer100g.carbs * factor * 10) / 10,
            };
          }
        }

        const entry = {
          foodId: item.foodId || null,
          name: item.name || "Alimento",
          quantity: item.quantity || 0,
          calories: item.calories !== undefined ? item.calories : (nutritionData ? nutritionData.calories : 0),
          protein: item.protein !== undefined ? item.protein : (nutritionData ? nutritionData.protein : 0),
          fat: item.fat !== undefined ? item.fat : (nutritionData ? nutritionData.fat : 0),
          carbs: item.carbs !== undefined ? item.carbs : (nutritionData ? nutritionData.carbs : 0),
        };

        processedFoods.push(entry);
        totalCalories += entry.calories;
        totalProtein += entry.protein;
        totalFat += entry.fat;
        totalCarbs += entry.carbs;
      }
    }

    const meal = await Meal.create({
      userId: req.userId,
      date,
      mealType,
      foods: processedFoods,
      totalCalories: Math.round(totalCalories * 10) / 10,
      totalProtein: Math.round(totalProtein * 10) / 10,
      totalFat: Math.round(totalFat * 10) / 10,
      totalCarbs: Math.round(totalCarbs * 10) / 10,
      notes: notes || "",
    });

    res.status(201).json({ meal });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error del servidor al registrar comida." });
  }
}

async function getMealsByDate(req, res) {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ error: "El parámetro date es obligatorio (YYYY-MM-DD)." });
    }

    const meals = await Meal.find({ userId: req.userId, date }).sort({ createdAt: 1 });

    const grouped = {};
    for (const meal of meals) {
      if (!grouped[meal.mealType]) {
        grouped[meal.mealType] = [];
      }
      grouped[meal.mealType].push(meal);
    }

    res.json({ meals, grouped });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error del servidor al obtener comidas." });
  }
}

async function getMealHistory(req, res) {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ error: "Los parámetros startDate y endDate son obligatorios." });
    }

    const meals = await Meal.find({
      userId: req.userId,
      date: { $gte: startDate, $lte: endDate },
    }).sort({ date: 1, createdAt: 1 });

    res.json({ meals });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error del servidor al obtener historial." });
  }
}

async function deleteMeal(req, res) {
  try {
    const meal = await Meal.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!meal) {
      return res.status(404).json({ error: "Comida no encontrada." });
    }

    res.json({ message: "Comida eliminada." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error del servidor al eliminar comida." });
  }
}

async function getDailySummary(req, res) {
  try {
    const date = req.query.date || formatDate(new Date());
    const meals = await Meal.find({ userId: req.userId, date });

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

    res.json({
      date,
      totalCalories: Math.round(totalCalories * 10) / 10,
      totalProtein: Math.round(totalProtein * 10) / 10,
      totalFat: Math.round(totalFat * 10) / 10,
      totalCarbs: Math.round(totalCarbs * 10) / 10,
      waterMl: Math.round(waterMl),
      mealCount: meals.filter((m) => m.mealType !== "water").length,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error del servidor al obtener resumen diario." });
  }
}

async function getWeeklySummary(req, res) {
  try {
    const today = new Date();
    const summaries = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = formatDate(d);

      const meals = await Meal.find({ userId: req.userId, date: dateStr });

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

      summaries.push({
        date: dateStr,
        totalCalories: Math.round(totalCalories * 10) / 10,
        totalProtein: Math.round(totalProtein * 10) / 10,
        totalFat: Math.round(totalFat * 10) / 10,
        totalCarbs: Math.round(totalCarbs * 10) / 10,
        waterMl: Math.round(waterMl),
      });
    }

    res.json({ summaries });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error del servidor al obtener resumen semanal." });
  }
}

async function getMonthlySummary(req, res) {
  try {
    const today = new Date();
    const summaries = [];

    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = formatDate(d);

      const meals = await Meal.find({ userId: req.userId, date: dateStr });

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

      summaries.push({
        date: dateStr,
        totalCalories: Math.round(totalCalories * 10) / 10,
        totalProtein: Math.round(totalProtein * 10) / 10,
        totalFat: Math.round(totalFat * 10) / 10,
        totalCarbs: Math.round(totalCarbs * 10) / 10,
        waterMl: Math.round(waterMl),
      });
    }

    res.json({ summaries });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error del servidor al obtener resumen mensual." });
  }
}

module.exports = {
  logMeal,
  getMealsByDate,
  getMealHistory,
  deleteMeal,
  getDailySummary,
  getWeeklySummary,
  getMonthlySummary,
};
