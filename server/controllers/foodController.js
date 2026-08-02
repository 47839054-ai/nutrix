const Food = require("../models/Food");
const Meal = require("../models/Meal");
const TestAnswers = require("../models/TestAnswers");
const { calculateNutritionalScore } = require("../utils/nutritionScore");
const { detectIngredientWarnings } = require("../utils/foodPreferences");
const { buscarProductoOFF } = require("../utils/openFoodFacts");

// Agrega alertas de ingredientes no consumibles según las preferencias del usuario.
async function attachIngredientWarnings(foods, userId) {
  if (!foods || foods.length === 0) return;
  const answers = await TestAnswers.findOne({ userId });
  const preferencias = answers?.preferenciasNoComer || [];
  if (preferencias.length === 0) return;
  for (const food of foods) {
    if (!food.ingredients) continue;
    const alerts = detectIngredientWarnings(preferencias, food.ingredients);
    if (alerts.length > 0) food._doc.alerts = alerts;
  }
}

async function searchFoods(req, res) {
  try {
    const { q } = req.query;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const filter = {};
    if (q && q.trim()) {
      const regex = new RegExp(q.trim(), "i");
      filter.$or = [{ name: regex }, { brand: regex }];
    }

    const [foods, total] = await Promise.all([
      Food.find(filter).sort({ name: 1 }).skip(skip).limit(limit),
      Food.countDocuments(filter),
    ]);

    await attachIngredientWarnings(foods, req.userId);

    res.json({
      foods,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error del servidor al buscar alimentos." });
  }
}

async function getFoodByBarcode(req, res) {
  try {
    const { barcode } = req.params;
    const food = await Food.findOne({ barcode });

    // Si está en la base local, se devuelve directo (con cache).
    if (food) {
      await attachIngredientWarnings([food], req.userId);
      return res.json({ food });
    }

    // Si no, se consulta Open Food Facts y se guarda como cache.
    const off = await buscarProductoOFF(barcode);
    if (!off) {
      return res.status(404).json({ error: "Alimento no encontrado con ese código de barras." });
    }

    const { score, tags } = calculateNutritionalScore({ nutritionPer100g: off.nutritionPer100g });
    const nuevo = await Food.create({
      barcode,
      ...off,
      category: "off",
      nutritionalScore: score,
      tags,
    });

    await attachIngredientWarnings([nuevo], req.userId);
    res.json({ food: nuevo, fuente: "off" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error del servidor al buscar por código de barras." });
  }
}

async function createFood(req, res) {
  try {
    const {
      barcode,
      name,
      brand,
      image,
      servingSize,
      servingUnit,
      nutritionPer100g,
      ingredients,
      category,
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: "El nombre del alimento es obligatorio." });
    }

    const foodData = {
      name,
      brand: brand || "",
      image: image || "",
      servingSize: servingSize || 100,
      servingUnit: servingUnit || "g",
      nutritionPer100g: nutritionPer100g || {
        calories: 0,
        protein: 0,
        fat: 0,
        saturatedFat: 0,
        carbs: 0,
        sugar: 0,
        fiber: 0,
        sodium: 0,
      },
      ingredients: ingredients || "",
      category: category || "custom",
      createdBy: req.userId,
    };

    if (barcode) {
      foodData.barcode = barcode;
    }

    const { score, tags } = calculateNutritionalScore({ nutritionPer100g: foodData.nutritionPer100g });
    foodData.nutritionalScore = score;
    foodData.tags = tags;

    const food = await Food.create(foodData);
    res.status(201).json({ food });
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res.status(409).json({ error: "Ya existe un alimento con ese código de barras." });
    }
    res.status(500).json({ error: "Error del servidor al crear alimento." });
  }
}

async function getFoodById(req, res) {
  try {
    const food = await Food.findById(req.params.id);
    if (!food) {
      return res.status(404).json({ error: "Alimento no encontrado." });
    }
    await attachIngredientWarnings([food], req.userId);
    res.json({ food });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error del servidor al obtener alimento." });
  }
}

async function getPopularFoods(req, res) {
  try {
    const meals = await Meal.find({ userId: req.userId }).limit(500);

    const foodCounts = {};
    for (const meal of meals) {
      for (const f of meal.foods) {
        const key = f.foodId ? f.foodId.toString() : f.name;
        if (!foodCounts[key]) {
          foodCounts[key] = { name: f.name, foodId: f.foodId, count: 0 };
        }
        foodCounts[key].count++;
      }
    }

    const sorted = Object.values(foodCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);

    const foodIds = sorted.filter((f) => f.foodId).map((f) => f.foodId);
    const foods = foodIds.length > 0 ? await Food.find({ _id: { $in: foodIds } }) : [];
    const foodMap = {};
    for (const food of foods) {
      foodMap[food._id.toString()] = food;
    }

    const popular = sorted.map((item) => ({
      food: item.foodId ? foodMap[item.foodId.toString()] || null : null,
      name: item.name,
      count: item.count,
    }));

    res.json({ foods: popular });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error del servidor al obtener alimentos populares." });
  }
}

module.exports = {
  searchFoods,
  getFoodByBarcode,
  createFood,
  getFoodById,
  getPopularFoods,
};
