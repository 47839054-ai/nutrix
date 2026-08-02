// server/utils/foodPreferences.js
// Catálogo único de preferencias alimentarias (qué NO comer).
// Se usa en el test, en la generación del plan y para detectar
// ingredientes no consumibles en los productos escaneados.

const FOODS_TO_AVOID = [
  // ---------- Carnes y pescados ----------
  { id: "carne_vacuna", label: "Carne vacuna", icon: "🥩",
    keywords: ["carne vacuna", "vacuno", "ternera", "bife", "milanesa de carne", "carne picada"] },
  { id: "carne_pollo", label: "Pollo", icon: "🍗",
    keywords: ["pollo", "pechuga de pollo", "suprema"] },
  { id: "carne_cerdo", label: "Cerdo", icon: "🐷",
    keywords: ["cerdo", "panceta", "tocino", "bacon", "jamón", "jamon", "chorizo", "bondiola", "matambre"] },
  { id: "cordero", label: "Cordero", icon: "🐑",
    keywords: ["cordero"] },
  { id: "pescado", label: "Pescado", icon: "🐟",
    keywords: ["pescado", "atún", "atun", "merluza", "salmón", "salmon", "sardina", "caballa", "anchoa", "corvina"] },
  { id: "mariscos", label: "Mariscos", icon: "🦐",
    keywords: ["camarón", "camaron", "langostino", "pulpo", "calamar", "mejillón", "mejillon", "ostra", "almeja", "vieira", "mariscos"] },

  // ---------- Lácteos y huevo ----------
  { id: "leche", label: "Leche", icon: "🥛",
    keywords: ["leche", "lactosa", "suero de leche", "leche en polvo", "lácteo", "lacteo"] },
  { id: "queso", label: "Queso", icon: "🧀",
    keywords: ["queso", "parmesano", "muzzarella", "mozzarella", "ricota", "cremoso"] },
  { id: "manteca", label: "Manteca", icon: "🧈",
    keywords: ["manteca", "mantequilla", "butter"] },
  { id: "yogur", label: "Yogur", icon: "🥣",
    keywords: ["yogur", "yogurt"] },
  { id: "lacteos", label: "Lácteos (todos)", icon: "🥛",
    keywords: ["leche", "lactosa", "queso", "yogur", "manteca", "crema de leche", "suero"] },
  { id: "huevo", label: "Huevo", icon: "🥚",
    keywords: ["huevo", "clara de huevo", "yema", "albúmina", "albumina", "ovolacto"] },

  // ---------- Cereales y gluten ----------
  { id: "trigo", label: "Trigo / Gluten", icon: "🌾",
    keywords: ["trigo", "gluten", "harina de trigo", "harina", "tacc", "malta", "maltodextrina", "almidón de trigo", "almidon de trigo"] },
  { id: "avena", label: "Avena", icon: "🌾",
    keywords: ["avena"] },
  { id: "pan", label: "Pan / Panificados", icon: "🍞",
    keywords: ["pan", "tostada", "tostadas", "pan rallado", "prepizza", "grisines", "hamburguesa", "pan lactal"] },
  { id: "pastas", label: "Fideos / Pastas", icon: "🍝",
    keywords: ["fideo", "fideos", "pasta", "tallarín", "tallarin", "spaghetti", "ñoqui", "raviol"] },
  { id: "galletitas", label: "Galletitas", icon: "🍪",
    keywords: ["galletita", "galletitas", "galleta", "galletas", "crackers"] },
  { id: "arroz", label: "Arroz", icon: "🍚",
    keywords: ["arroz"] },
  { id: "maiz", label: "Maíz", icon: "🌽",
    keywords: ["maíz", "maiz", "choclo", "harina de maíz", "harina de maiz", "polenta", "pochoclo"] },

  // ---------- Legumbres y soja ----------
  { id: "soja", label: "Soja", icon: "🫘",
    keywords: ["soja", "soy", "tofu", "edamame", "proteína de soja", "proteina de soja", "tamari", "salsa de soja"] },
  { id: "lentejas", label: "Lentejas", icon: "🫘",
    keywords: ["lenteja", "lentejas"] },
  { id: "garbanzos", label: "Garbanzos", icon: "🫘",
    keywords: ["garbanzo", "garbanzos"] },
  { id: "porotos", label: "Porotos / Frijoles", icon: "🫘",
    keywords: ["poroto", "porotos", "frijol", "frijoles", "habas", "judía", "judia"] },

  // ---------- Frutas ----------
  { id: "banana", label: "Banana", icon: "🍌",
    keywords: ["banana", "plátano", "platano"] },
  { id: "citricos", label: "Cítricos", icon: "🍊",
    keywords: ["naranja", "limón", "limon", "mandarina", "pomelo", "cítrico", "citrico"] },
  { id: "manzana", label: "Manzana", icon: "🍎",
    keywords: ["manzana"] },
  { id: "frutas_rojas", label: "Frutas rojas", icon: "🍓",
    keywords: ["frutilla", "fresa", "frambuesa", "arándano", "arandano", "mora", "cranberry"] },

  // ---------- Verduras ----------
  { id: "papa", label: "Papa", icon: "🥔",
    keywords: ["papa", "patata", "papas fritas", "puré de papa", "pure de papa"] },
  { id: "batata", label: "Batata", icon: "🍠",
    keywords: ["batata", "boniato", "camote"] },
  { id: "zapallo", label: "Zapallo / Calabaza", icon: "🎃",
    keywords: ["zapallo", "calabaza", "anco"] },
  { id: "tomate", label: "Tomate", icon: "🍅",
    keywords: ["tomate", "tomate triturado", "puré de tomate", "pure de tomate", "ketchup"] },
  { id: "cebolla", label: "Cebolla / Ajo", icon: "🧅",
    keywords: ["cebolla", "ajo", "cebollín", "cebollin", "chalota"] },
  { id: "champinones", label: "Champiñones / Hongos", icon: "🍄",
    keywords: ["champiñón", "champinon", "hongos", "seta", "portobello"] },
  { id: "coliflor", label: "Coliflor / Brócoli", icon: "🥦",
    keywords: ["coliflor", "brócoli", "brocoli"] },
  { id: "palta", label: "Palta", icon: "🥑",
    keywords: ["palta", "aguacate"] },

  // ---------- Frutos secos y semillas ----------
  { id: "mani", label: "Maní", icon: "🥜",
    keywords: ["maní", "mani", "cacahuate", "cacahuete"] },
  { id: "frutos_secos", label: "Frutos secos (todos)", icon: "🥜",
    keywords: ["nuez", "nueces", "almendra", "avellana", "castaña", "castana", "anacardo", "cajú", "caju", "pistacho", "maní", "mani"] },
  { id: "sesamo", label: "Sésamo", icon: "🌰",
    keywords: ["sésamo", "sesamo", "ajonjolí", "ajonjoli", "tahini", "tahina"] },

  // ---------- Bebidas ----------
  { id: "gaseosa", label: "Gaseosas", icon: "🥤",
    keywords: ["gaseosa", "cola", "refresco", "tónica", "tonica"] },
  { id: "jugo_azucar", label: "Jugos con azúcar", icon: "🧃",
    keywords: ["jugo", "néctar", "nectar"] },
  { id: "cafe", label: "Café / Cafeína", icon: "☕",
    keywords: ["café", "cafe", "cafeína", "cafeina", "guaraná", "guarana"] },
  { id: "alcohol", label: "Alcohol", icon: "🍺",
    keywords: ["cerveza", "vino", "alcohol", "whisky", "vodka", "ron", "gin", "champagne", "sidra"] },

  // ---------- Procesados y dulces ----------
  { id: "ultraprocesados", label: "Comida ultraprocesada", icon: "🍔",
    keywords: ["hamburguesa", "nugget", "salchicha", "snack", "fideos instantáneos", "sopa instantánea", "caldo de cubo"] },
  { id: "azucar", label: "Azúcar / Dulces", icon: "🍬",
    keywords: ["azúcar", "azucar", "sacarosa", "fructosa", "glucosa", "dextrosa", "jarabe de maíz", "jarabe de maiz", "miel", "dulce de leche"] },
  { id: "chocolate", label: "Chocolate / Cacao", icon: "🍫",
    keywords: ["chocolate", "cacao", "cocoa"] },
  { id: "frituras", label: "Frituras", icon: "🍟",
    keywords: ["frito", "frita", "fritura", "rebozado", "empanizado", "papas fritas"] },
  { id: "embutidos", label: "Fiambres / Embutidos", icon: "🥓",
    keywords: ["jamón", "jamon", "salame", "salchicha", "chorizo", "mortadela", "panceta", "tocino", "longaniza"] },
  { id: "snacks", label: "Snacks salados", icon: "🍿",
    keywords: ["chizito", "chizitos", "palitos", "papas fritas", "pochoclo", "copetín", "copetin"] },
  { id: "mayonesa", label: "Mayonesa / Aderezos", icon: "🥫",
    keywords: ["mayonesa", "aderezo", "ketchup", "salsa golf", "vinagreta", "salsa blanca"] },
];

// Mapa de preferencia → nombres de alimentos del plan que quedan excluidos.
// Debe coincidir con los nombres usados en VARIANTES_COMIDAS y el catálogo.
const FOOD_AVOID_MAP = {
  carne_vacuna: ["Carne picada magra"],
  carne_pollo: ["Pechuga de pollo"],
  carne_cerdo: [],
  cordero: [],
  pescado: ["Atún en lata", "Salmón"],
  mariscos: [],
  leche: ["Leche descremada"],
  lacteos: ["Leche descremada", "Yogur natural", "Queso cremoso", "Manteca"],
  queso: ["Queso cremoso"],
  manteca: ["Manteca"],
  yogur: ["Yogur natural"],
  huevo: ["Huevo"],
  trigo: ["Pan", "Fideos"],
  avena: ["Avena arrollada"],
  pan: ["Pan"],
  pastas: ["Fideos"],
  galletitas: [],
  arroz: ["Arroz"],
  maiz: ["Polenta"],
  soja: ["Tofu firme", "Bebida de soja"],
  lentejas: ["Lentejas"],
  garbanzos: ["Garbanzos", "Hummus"],
  porotos: ["Porotos"],
  banana: ["Banana"],
  citricos: ["Naranja"],
  manzana: ["Manzana"],
  frutas_rojas: ["Frutas rojas"],
  papa: ["Papa"],
  batata: ["Batata"],
  zapallo: ["Zapallo"],
  tomate: ["Tomate"],
  cebolla: [],
  champinones: [],
  coliflor: ["Brócoli"],
  palta: ["Palta"],
  mani: ["Maní"],
  frutos_secos: ["Nueces", "Maní"],
  sesamo: [],
  gaseosa: [],
  jugo_azucar: [],
  cafe: [],
  alcohol: [],
  ultraprocesados: [],
  azucar: [],
  chocolate: [],
  frituras: [],
  embutidos: [],
  snacks: [],
  mayonesa: [],
};

const FOOD_AVOID_MAP_BY_ID = new Map(FOODS_TO_AVOID.map((f) => [f.id, f]));

// Devuelve el Set de nombres de alimentos excluidos para un usuario.
function getExcludedNames(preferenciasNoComer = []) {
  const nombres = new Set();
  for (const key of preferenciasNoComer) {
    const mapped = FOOD_AVOID_MAP[key] || [];
    for (const n of mapped) nombres.add(n);
  }
  return nombres;
}

// Normaliza texto para comparaciones simples (minúsculas y sin acentos).
function normalizar(texto) {
  return (texto || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

// Detecta qué preferencias del usuario están presentes en la lista de
// ingredientes de un producto. Devuelve [{ id, label }, ...].
function detectIngredientWarnings(preferenciasNoComer = [], ingredientsText = "") {
  if (!ingredientsText || !preferenciasNoComer || preferenciasNoComer.length === 0) {
    return [];
  }
  const texto = normalizar(ingredientsText);
  const alertas = [];
  const vistos = new Set();

  for (const key of preferenciasNoComer) {
    const pref = FOOD_AVOID_MAP_BY_ID.get(key);
    if (!pref) continue;
    const coincide = (pref.keywords || []).some((kw) => texto.includes(normalizar(kw)));
    if (coincide && !vistos.has(pref.id)) {
      vistos.add(pref.id);
      alertas.push({ id: pref.id, label: pref.label });
    }
  }

  return alertas;
}

module.exports = {
  FOODS_TO_AVOID,
  FOOD_AVOID_MAP,
  getExcludedNames,
  detectIngredientWarnings,
};
