const Recipe = require("../models/Recipe");
const Food = require("../models/Food");
const { detectIngredientWarnings } = require("../utils/foodPreferences");

async function getRecipes(req, res) {
  try {
    const recipes = await Recipe.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json({ recipes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error del servidor al cargar las recetas." });
  }
}

// Calcula la nutrición de cada ingrediente según su cantidad (g) y totales.
async function computeRecipeNutrition(ingredients) {
  const foodIds = ingredients
    .filter((ing) => ing.foodId)
    .map((ing) => ing.foodId);
  const foods = foodIds.length ? await Food.find({ _id: { $in: foodIds } }) : [];
  const foodMap = {};
  for (const f of foods) foodMap[f._id.toString()] = f;

  const items = ingredients.map((ing) => {
    const food = ing.foodId ? foodMap[ing.foodId.toString()] : null;
    const n = food ? food.nutritionPer100g || {} : {};
    const factor = (ing.quantity || 0) / 100;
    return {
      foodId: ing.foodId || null,
      name: food ? food.name : ing.name,
      quantity: ing.quantity || 0,
      calories: Math.round(((n.calories || 0) * factor) * 10) / 10,
      protein: Math.round(((n.protein || 0) * factor) * 10) / 10,
      fat: Math.round(((n.fat || 0) * factor) * 10) / 10,
      carbs: Math.round(((n.carbs || 0) * factor) * 10) / 10,
    };
  });

  const totals = items.reduce(
    (acc, i) => {
      acc.totalCalories += i.calories;
      acc.totalProtein += i.protein;
      acc.totalFat += i.fat;
      acc.totalCarbs += i.carbs;
      return acc;
    },
    { totalCalories: 0, totalProtein: 0, totalFat: 0, totalCarbs: 0 }
  );

  return {
    ingredients: items,
    totalCalories: Math.round(totals.totalCalories),
    totalProtein: Math.round(totals.totalProtein * 10) / 10,
    totalFat: Math.round(totals.totalFat * 10) / 10,
    totalCarbs: Math.round(totals.totalCarbs * 10) / 10,
  };
}

async function createRecipe(req, res) {
  try {
    const { name, description, servings, ingredients } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: "El nombre de la receta es obligatorio." });
    }
    if (!Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({ error: "Agregá al menos un ingrediente." });
    }

    const computed = await computeRecipeNutrition(ingredients);

    const recipe = await Recipe.create({
      userId: req.userId,
      name: name.trim(),
      description: description || "",
      servings: Math.max(1, parseInt(servings) || 1),
      ...computed,
    });

    res.status(201).json({ recipe });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error del servidor al crear la receta." });
  }
}

async function deleteRecipe(req, res) {
  try {
    const recipe = await Recipe.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });
    if (!recipe) {
      return res.status(404).json({ error: "Receta no encontrada." });
    }
    res.json({ message: "Receta eliminada." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error del servidor al eliminar la receta." });
  }
}

module.exports = {
  getRecipes,
  createRecipe,
  deleteRecipe,
};
