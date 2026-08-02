// server/utils/openFoodFacts.js
// Consulta la API pública de Open Food Facts por código de barras.
// Devuelve los datos mapeados al formato de Food o null si no existe.

const USER_AGENT = "Nutrix - app de nutricion (argentina) - consulta de productos";

async function buscarProductoOFF(barcode) {
  if (!barcode || !barcode.trim()) return null;

  const url = `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(
    barcode.trim()
  )}.json`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": USER_AGENT },
    });
    if (!res.ok) return null;

    const data = await res.json();
    if (data.status !== 1 || !data.product) return null;

    const p = data.product;
    const nut = p.nutriments || {};

    let calories = nut["energy-kcal_100g"];
    if (calories == null && nut.energy_100g != null) {
      calories = Math.round((nut.energy_100g / 4.184) * 10) / 10;
    }

    const sodium = nut.sodium_100g != null ? Math.round(nut.sodium_100g * 1000) : 0;

    return {
      name:
        p.product_name_es ||
        p.product_name ||
        p.generic_name_es ||
        p.generic_name ||
        `Producto ${barcode.trim()}`,
      brand: (p.brands || "").split(",")[0].trim() || "",
      image: p.image_front_url || p.image_front_thumb_url || "",
      ingredients: p.ingredients_text_es || p.ingredients_text || "",
      nutritionPer100g: {
        calories: calories || 0,
        protein: nut.proteins_100g || 0,
        fat: nut.fat_100g || 0,
        saturatedFat: nut["saturated-fat_100g"] || 0,
        carbs: nut.carbohydrates_100g || 0,
        sugar: nut.sugars_100g || 0,
        fiber: nut.fiber_100g || 0,
        sodium,
      },
    };
  } catch (err) {
    console.error("Open Food Facts error:", err.message);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

module.exports = { buscarProductoOFF };
