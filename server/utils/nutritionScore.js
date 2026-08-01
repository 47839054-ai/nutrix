function calculateNutritionalScore(food) {
  const n = food.nutritionPer100g || {};
  let score = 5.0;
  const tags = [];
  const labels = [];

  const sugar = n.sugar || 0;
  const sodium = n.sodium || 0;
  const saturatedFat = n.saturatedFat || 0;
  const calories = n.calories || 0;
  const protein = n.protein || 0;
  const fiber = n.fiber || 0;

  if (sugar > 25) {
    score -= 2.0;
    tags.push("high_sugar");
    labels.push("Muy alto en azúcar");
  } else if (sugar > 15) {
    score -= 1.5;
    tags.push("high_sugar");
    labels.push("Alto en azúcar");
  } else if (sugar < 5) {
    score += 0.5;
    tags.push("low_sugar");
    labels.push("Bajo en azúcar");
  }

  if (sodium > 1000) {
    score -= 1.5;
    tags.push("high_sodium");
    labels.push("Muy alto en sodio");
  } else if (sodium > 600) {
    score -= 1.0;
    tags.push("high_sodium");
    labels.push("Alto en sodio");
  } else if (sodium < 100) {
    score += 0.5;
    tags.push("low_sodium");
    labels.push("Bajo en sodio");
  }

  if (saturatedFat > 5) {
    score -= 1.0;
    tags.push("high_saturated_fat");
    labels.push("Alto en grasas saturadas");
  } else if (saturatedFat < 1.5) {
    score += 0.5;
    tags.push("low_saturated_fat");
    labels.push("Bajo en grasas saturadas");
  }

  if (calories > 400) {
    score -= 0.5;
  }

  if (protein > 15) {
    score += 1.5;
    tags.push("high_protein");
    labels.push("Alto en proteínas");
  }

  if (fiber > 6) {
    score += 1.0;
    tags.push("good_fiber");
    labels.push("Buena fuente de fibra");
  }

  score = Math.max(0, Math.min(10, Math.round(score * 10) / 10));

  return { score, tags, labels };
}

module.exports = { calculateNutritionalScore };
