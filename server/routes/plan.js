const express = require("express");
const User = require("../models/User");
const TestAnswers = require("../models/TestAnswers");
const Plan = require("../models/Plan");
const requireAuth = require("../middleware/auth");
const { calcularIndicadores } = require("../utils/nutricion");
const { generarPlanConIA } = require("../utils/aiPlanGenerator");
const { FOOD_AVOID_MAP, getExcludedNames } = require("../utils/foodPreferences");

const router = express.Router();

/* ---------------------------------------------------------------
   CATÁLOGO DE PRODUCTOS (comidas accesibles para comprar)
--------------------------------------------------------------- */
const CATALOGO_PRODUCTOS = [
  { nombre: "Huevo", categoria: "Proteína", tags: ["Vegetariano", "Sin TACC", "Sin lactosa"], tacc: false, lactosa: false, vegano: false, vegetariano: true, motivo: "Proteína completa, barata y práctica para desayunos y meriendas." },
  { nombre: "Pechuga de pollo", categoria: "Proteína", tags: ["Sin TACC", "Sin lactosa"], tacc: false, lactosa: false, vegano: false, vegetariano: false, motivo: "Proteína magra de alto valor biológico, base de casi cualquier plan." },
  { nombre: "Atún en lata", categoria: "Proteína", tags: ["Sin TACC", "Sin lactosa", "Bajo en sodio"], tacc: false, lactosa: false, vegano: false, vegetariano: false, motivo: "Proteína barata y de fácil almacenamiento, ideal para almuerzos rápidos." },
  { nombre: "Carne picada magra", categoria: "Proteína", tags: ["Sin TACC", "Sin lactosa"], tacc: false, lactosa: false, vegano: false, vegetariano: false, motivo: "Versátil y accesible, buena fuente de hierro y proteína." },
  { nombre: "Salmón", categoria: "Proteína", tags: ["Sin TACC", "Sin lactosa"], tacc: false, lactosa: false, vegano: false, vegetariano: false, motivo: "Rico en omega-3 y proteína de alta calidad." },
  { nombre: "Lentejas", categoria: "Legumbres", tags: ["Vegano", "Vegetariano", "Sin TACC", "Sin lactosa"], tacc: false, lactosa: false, vegano: true, vegetariano: true, motivo: "Proteína vegetal, hierro y fibra a muy buen precio." },
  { nombre: "Garbanzos", categoria: "Legumbres", tags: ["Vegano", "Vegetariano", "Sin TACC", "Sin lactosa"], tacc: false, lactosa: false, vegano: true, vegetariano: true, motivo: "Proteína vegetal barata, ideal para guisos y ensaladas." },
  { nombre: "Porotos", categoria: "Legumbres", tags: ["Vegano", "Vegetariano", "Sin TACC", "Sin lactosa"], tacc: false, lactosa: false, vegano: true, vegetariano: true, motivo: "Fibra y proteína vegetal a bajo costo." },
  { nombre: "Tofu firme", categoria: "Proteína vegetal", tags: ["Vegano", "Vegetariano", "Sin TACC", "Sin lactosa"], tacc: false, lactosa: false, vegano: true, vegetariano: true, motivo: "Reemplazo proteico versátil para preparaciones veganas." },
  { nombre: "Avena arrollada", categoria: "Cereales", tags: ["Vegano", "Vegetariano", "Sin lactosa"], tacc: true, lactosa: false, vegano: true, vegetariano: true, motivo: "Carbohidrato complejo de bajo costo, buena saciedad." },
  { nombre: "Arroz", categoria: "Cereales", tags: ["Vegano", "Vegetariano", "Sin TACC", "Sin lactosa"], tacc: false, lactosa: false, vegano: true, vegetariano: true, motivo: "El acompañamiento más económico y versátil." },
  { nombre: "Fideos", categoria: "Cereales", tags: ["Vegano", "Vegetariano", "Sin lactosa"], tacc: true, lactosa: false, vegano: true, vegetariano: true, motivo: "Carbohidrato accesible para almuerzos y cenas rápidas." },
  { nombre: "Polenta", categoria: "Cereales", tags: ["Vegano", "Vegetariano", "Sin TACC", "Sin lactosa"], tacc: false, lactosa: false, vegano: true, vegetariano: true, motivo: "Cereal de maíz muy económico, apto para celíacos." },
  { nombre: "Quinoa", categoria: "Cereales", tags: ["Vegano", "Vegetariano", "Sin TACC", "Sin lactosa", "Apto diabéticos"], tacc: false, lactosa: false, vegano: true, vegetariano: true, motivo: "Pseudocereal con proteína completa y bajo impacto glucémico." },
  { nombre: "Pan", categoria: "Cereales", tags: ["Vegano", "Vegetariano", "Sin lactosa"], tacc: true, lactosa: false, vegano: true, vegetariano: true, motivo: "Base accesible para desayunos y meriendas." },
  { nombre: "Papa", categoria: "Verduras", tags: ["Vegano", "Vegetariano", "Sin TACC", "Sin lactosa"], tacc: false, lactosa: false, vegano: true, vegetariano: true, motivo: "Energía económica y saciedad a muy bajo precio." },
  { nombre: "Batata", categoria: "Verduras", tags: ["Vegano", "Vegetariano", "Sin TACC", "Sin lactosa"], tacc: false, lactosa: false, vegano: true, vegetariano: true, motivo: "Buena fuente de energía con fibra y betacarotenos." },
  { nombre: "Zapallo", categoria: "Verduras", tags: ["Vegano", "Vegetariano", "Sin TACC", "Sin lactosa"], tacc: false, lactosa: false, vegano: true, vegetariano: true, motivo: "Barato, aporta fibra y vitamina A." },
  { nombre: "Zanahoria", categoria: "Verduras", tags: ["Vegano", "Vegetariano", "Sin TACC", "Sin lactosa"], tacc: false, lactosa: false, vegano: true, vegetariano: true, motivo: "Crocante, económica y rica en vitamina A." },
  { nombre: "Brócoli", categoria: "Verduras", tags: ["Vegano", "Vegetariano", "Sin TACC", "Sin lactosa", "Bajo en sodio"], tacc: false, lactosa: false, vegano: true, vegetariano: true, motivo: "Bajo en calorías, alto en fibra y vitamina C." },
  { nombre: "Espinaca", categoria: "Verduras", tags: ["Vegano", "Vegetariano", "Sin TACC", "Sin lactosa", "Bajo en sodio"], tacc: false, lactosa: false, vegano: true, vegetariano: true, motivo: "Aporta hierro y folato con muy pocas calorías." },
  { nombre: "Lechuga", categoria: "Verduras", tags: ["Vegano", "Vegetariano", "Sin TACC", "Sin lactosa"], tacc: false, lactosa: false, vegano: true, vegetariano: true, motivo: "Base de ensaladas frescas y económicas." },
  { nombre: "Tomate", categoria: "Verduras", tags: ["Vegano", "Vegetariano", "Sin TACC", "Sin lactosa"], tacc: false, lactosa: false, vegano: true, vegetariano: true, motivo: "Fresco y barato, ideal para ensaladas y salsas." },
  { nombre: "Palta", categoria: "Grasas saludables", tags: ["Vegano", "Vegetariano", "Sin TACC", "Sin lactosa"], tacc: false, lactosa: false, vegano: true, vegetariano: true, motivo: "Grasas monoinsaturadas que ayudan a la saciedad." },
  { nombre: "Aceite de oliva extra virgen", categoria: "Grasas saludables", tags: ["Vegano", "Vegetariano", "Sin TACC", "Sin lactosa", "Apto diabéticos"], tacc: false, lactosa: false, vegano: true, vegetariano: true, motivo: "Grasa de buena calidad para cocción y aderezos." },
  { nombre: "Maní", categoria: "Frutos secos", tags: ["Vegano", "Vegetariano", "Sin TACC", "Sin lactosa"], tacc: false, lactosa: false, vegano: true, vegetariano: true, motivo: "Snack económico con proteína y grasas buenas." },
  { nombre: "Nueces", categoria: "Frutos secos", tags: ["Vegano", "Vegetariano", "Sin TACC", "Sin lactosa"], tacc: false, lactosa: false, vegano: true, vegetariano: true, motivo: "Aportan omega-3 vegetal y saciedad." },
  { nombre: "Banana", categoria: "Frutas", tags: ["Vegano", "Vegetariano", "Sin TACC", "Sin lactosa"], tacc: false, lactosa: false, vegano: true, vegetariano: true, motivo: "Energía rápida, ideal antes o después de entrenar." },
  { nombre: "Manzana", categoria: "Frutas", tags: ["Vegano", "Vegetariano", "Sin TACC", "Sin lactosa"], tacc: false, lactosa: false, vegano: true, vegetariano: true, motivo: "Fruta económica, práctica para llevar." },
  { nombre: "Naranja", categoria: "Frutas", tags: ["Vegano", "Vegetariano", "Sin TACC", "Sin lactosa"], tacc: false, lactosa: false, vegano: true, vegetariano: true, motivo: "Vitamina C a buen precio." },
  { nombre: "Frutas rojas congeladas", categoria: "Frutas", tags: ["Vegano", "Vegetariano", "Sin TACC", "Sin lactosa", "Apto diabéticos"], tacc: false, lactosa: false, vegano: true, vegetariano: true, motivo: "Antioxidantes con bajo impacto glucémico, prácticos para licuados." },
  { nombre: "Yogur natural descremado", categoria: "Lácteos", tags: ["Vegetariano", "Sin TACC", "Bajo en sodio"], tacc: false, lactosa: true, vegano: false, vegetariano: true, motivo: "Buena fuente de calcio y proteína para meriendas." },
  { nombre: "Queso cremoso", categoria: "Lácteos", tags: ["Vegetariano", "Sin TACC"], tacc: false, lactosa: true, vegano: false, vegetariano: true, motivo: "Proteína y calcio a buen precio para meriendas y comidas." },
  { nombre: "Leche descremada", categoria: "Lácteos", tags: ["Vegetariano", "Sin TACC"], tacc: false, lactosa: true, vegano: false, vegetariano: true, motivo: "Calcio y proteína económica." },
  { nombre: "Bebida de soja sin azúcar", categoria: "Alternativas vegetales", tags: ["Vegano", "Vegetariano", "Sin TACC", "Sin lactosa"], tacc: false, lactosa: false, vegano: true, vegetariano: true, motivo: "Alternativa vegetal económica a la leche." },
  { nombre: "Bebida de almendras sin azúcar", categoria: "Alternativas vegetales", tags: ["Vegano", "Vegetariano", "Sin TACC", "Sin lactosa"], tacc: false, lactosa: false, vegano: true, vegetariano: true, motivo: "Alternativa a la leche para quienes evitan lácteos." },
  { nombre: "Hummus", categoria: "Untables", tags: ["Vegano", "Vegetariano", "Sin TACC", "Sin lactosa"], tacc: false, lactosa: false, vegano: true, vegetariano: true, motivo: "Untable de garbanzos, buena fuente de proteína vegetal." },
];

const OBJETIVO_TEXTO = {
  bajar: "generar un déficit calórico moderado y sostenible",
  mantener: "mantener tu peso actual con una alimentación equilibrada",
  masa: "acompañar el aumento de masa muscular con un leve superávit calórico",
  salud: "mejorar la calidad general de tu alimentación",
};

const DIA_MS = 1000 * 60 * 60 * 24;
const ROTACION_DIAS = 3;
const CANTIDAD_VARIANTES = 4;
const obtenerSeedActual = () =>
  Math.floor(Date.now() / (DIA_MS * ROTACION_DIAS)) % CANTIDAD_VARIANTES;

const RESTRICCIONES_CATALOGO = [
  { id: "sin_tacc", label: "Sin TACC / Celíaco" },
  { id: "sin_lactosa", label: "Sin lactosa / Intolerante a la lactosa" },
  { id: "sin_gluten", label: "Sin gluten" },
  { id: "sin_frutos_secos", label: "Sin frutos secos" },
  { id: "sin_mariscos", label: "Sin mariscos" },
  { id: "bajo_sodio", label: "Bajo en sodio" },
];

const CONDICIONES_SALUD = [
  { id: "diabetes", label: "Diabetes" },
  { id: "hipertension", label: "Hipertensión" },
  { id: "colesterol", label: "Colesterol alto" },
  { id: "celiaquia", label: "Celíaco" },
  { id: "lactosa_intolerancia", label: "Intolerancia a la lactosa" },
  { id: "obesidad", label: "Obesidad / Sobrepeso" },
  { id: "embarazo", label: "Embarazo / Lactancia" },
  { id: "renal", label: "Enfermedad renal" },
  { id: "ninguna", label: "Ninguna" },
];

/* ---------------------------------------------------------------
   GENERACIÓN DE PLAN POR REGLAS
--------------------------------------------------------------- */
function filtrarCatalogo(perfil) {
  const restricciones = perfil.restricciones || [];
  const tipo = (perfil.tipoAlimentacion || "").toLowerCase();
  const noComer = perfil.preferenciasNoComer || [];
  const nombresExcluidos = getExcludedNames(noComer);
  let catalogo = CATALOGO_PRODUCTOS.filter((p) => {
    if (tipo.includes("vegano") && !p.vegano) return false;
    if (tipo.includes("vegetariano") && !p.vegetariano) return false;
    if (restricciones.includes("sin_tacc") && p.tacc) return false;
    if (restricciones.includes("sin_lactosa") && p.lactosa) return false;
    if (nombresExcluidos.has(p.nombre)) return false;
    return true;
  });
  if (catalogo.length < 7) catalogo = CATALOGO_PRODUCTOS;
  return catalogo;
}

function generarPlanDeterministico(perfil, indicadores, seed = 0) {
  const catalogo = filtrarCatalogo(perfil);
  const offset = seed % catalogo.length;
  const rotado = [...catalogo.slice(offset), ...catalogo.slice(0, offset)];
  const productos = rotado.slice(0, 8).map((p) => ({
    nombre: p.nombre,
    categoria: p.categoria,
    motivo: p.motivo,
    tags: p.tags,
  }));

  const calorias = indicadores?.calorias || 2000;
  const macros = {
    calorias,
    proteinas_g: Math.round((calorias * 0.3) / 4),
    carbohidratos_g: Math.round((calorias * 0.4) / 4),
    grasas_g: Math.round((calorias * 0.3) / 9),
  };

  const objetivoTexto = OBJETIVO_TEXTO[perfil.objetivo] || OBJETIVO_TEXTO.salud;
  const resumen = `Plan calculado con reglas nutricionales fijas (IMC, TMB y gasto calórico) pensado para ${objetivoTexto}, en base a tu peso, altura y nivel de actividad. Priorizamos comidas fáciles de conseguir y de buen precio.`;

  const recomendaciones_generales = [
    "Distribuí tus comidas en al menos 4 momentos: desayuno, almuerzo, merienda y cena.",
    indicadores?.aguaMl
      ? `Tu objetivo de hidratación diaria estimado es de ${(indicadores.aguaMl / 1000).toFixed(1)} litros de agua.`
      : "Intentá mantenerte hidratado a lo largo del día.",
    "Priorizá alimentos frescos y de estación por sobre los ultraprocesados.",
    `Este plan se renueva automáticamente cada ${ROTACION_DIAS} días con variantes nuevas para que no te aburras de comer siempre lo mismo.`,
  ];
  if (perfil.condiciones) {
    recomendaciones_generales.push(
      `Tuvimos en cuenta que declaraste "${perfil.condiciones}". De todas formas, consultá con un profesional de la salud antes de hacer cambios importantes.`
    );
  }

  const planComidas = generarPlanComidas(indicadores, perfil, seed);

  return { resumen, macros, productos, recomendaciones_generales, planComidas };
}

/* Variantes de comidas con alimentos accesibles y de buen precio.
   Cada variante define desayuno, almuerzo, merienda y cena según el tipo
   de alimentación. Se elige con (seed % CANTIDAD_VARIANTES). */
const VARIANTES_COMIDAS = [
  {
    desayuno: (esVeg, esVegt, tiene) => {
      if (esVeg)
        return [
          { nombre: "Avena arrollada", porcion: "1 taza (80g)", calorias: 300 },
          { nombre: "Bebida de soja", porcion: "200ml", calorias: 60 },
          { nombre: "Banana", porcion: "1 mediana", calorias: 100 },
        ];
      if (esVegt)
        return [
          { nombre: "Huevo", porcion: "2 unidades", calorias: 150 },
          { nombre: "Pan", porcion: "2 rebanadas", calorias: 180 },
          { nombre: "Naranja", porcion: "1 unidad", calorias: 60 },
        ];
      return [
        { nombre: "Huevo", porcion: "2 unidades", calorias: 150 },
        { nombre: "Pan", porcion: "2 rebanadas", calorias: 180 },
        ...(tiene("azucar") ? [{ nombre: "Banana", porcion: "1 mediana", calorias: 100 }] : []),
      ];
    },
    almuerzo: (esVeg, esVegt, tiene) => {
      if (esVeg)
        return [
          { nombre: "Lentejas", porcion: "1 taza cocida (200g)", calorias: 230 },
          { nombre: "Arroz", porcion: "1 taza cocida (150g)", calorias: 215 },
          { nombre: "Zanahoria", porcion: "1 zanahoria (80g)", calorias: 33 },
          { nombre: "Aceite de oliva", porcion: "1 cucharada", calorias: 120 },
        ];
      if (esVegt)
        return [
          { nombre: "Garbanzos", porcion: "1 taza cocida (180g)", calorias: 270 },
          { nombre: "Arroz", porcion: "1 taza cocida (150g)", calorias: 215 },
          { nombre: "Espinaca", porcion: "1 taza (100g)", calorias: 25 },
          { nombre: "Aceite de oliva", porcion: "1 cucharada", calorias: 120 },
        ];
      return [
        { nombre: "Pechuga de pollo", porcion: "150g", calorias: 250 },
        { nombre: "Arroz", porcion: "1 taza cocida (150g)", calorias: 215 },
        { nombre: "Lechuga", porcion: "ensalada", calorias: 15 },
        { nombre: "Tomate", porcion: "1 unidad", calorias: 20 },
        { nombre: "Aceite de oliva", porcion: "1 cucharada", calorias: 120 },
      ];
    },
    merienda: (esVeg, esVegt, tiene) => {
      if (esVeg)
        return [
          { nombre: "Maní", porcion: "30g", calorias: 170 },
          { nombre: "Manzana", porcion: "1 mediana", calorias: 80 },
        ];
      return [
        ...(tiene("lacteos") ? [{ nombre: "Yogur natural", porcion: "1 pote (150g)", calorias: 80 }] : []),
        { nombre: "Maní", porcion: "20g", calorias: 115 },
        { nombre: "Manzana", porcion: "1 mediana", calorias: 80 },
      ];
    },
    cena: (esVeg, esVegt, tiene) => {
      if (esVeg)
        return [
          { nombre: "Porotos", porcion: "1 taza cocida (200g)", calorias: 230 },
          { nombre: "Arroz", porcion: "1/2 taza cocida (75g)", calorias: 110 },
          { nombre: "Espinaca", porcion: "1 taza (100g)", calorias: 25 },
          { nombre: "Aceite de oliva", porcion: "1 cucharada", calorias: 120 },
        ];
      if (esVegt)
        return [
          { nombre: "Huevo", porcion: "2 unidades", calorias: 150 },
          { nombre: "Papa", porcion: "1 mediana (150g)", calorias: 120 },
          { nombre: "Lechuga", porcion: "ensalada", calorias: 15 },
          { nombre: "Tomate", porcion: "1 unidad", calorias: 20 },
          { nombre: "Aceite de oliva", porcion: "1 cucharada", calorias: 120 },
        ];
      return [
        { nombre: "Carne picada magra", porcion: "150g", calorias: 230 },
        { nombre: "Batata", porcion: "1 mediana (150g)", calorias: 130 },
        { nombre: "Lechuga", porcion: "ensalada", calorias: 15 },
        { nombre: "Tomate", porcion: "1 unidad", calorias: 20 },
      ];
    },
  },
  {
    desayuno: (esVeg, esVegt, tiene) => {
      if (esVeg)
        return [
          { nombre: "Avena arrollada", porcion: "1 taza (80g)", calorias: 300 },
          { nombre: "Bebida de soja", porcion: "200ml", calorias: 60 },
          { nombre: "Naranja", porcion: "1 unidad", calorias: 60 },
        ];
      if (esVegt)
        return [
          ...(tiene("lacteos") ? [{ nombre: "Yogur natural", porcion: "1 pote (150g)", calorias: 80 }] : []),
          { nombre: "Avena arrollada", porcion: "1/2 taza (40g)", calorias: 150 },
          { nombre: "Banana", porcion: "1 mediana", calorias: 100 },
        ];
      return [
        ...(tiene("lacteos") ? [{ nombre: "Yogur natural", porcion: "1 pote (150g)", calorias: 80 }] : []),
        { nombre: "Pan", porcion: "2 rebanadas", calorias: 180 },
        { nombre: "Huevo", porcion: "1 unidad", calorias: 75 },
      ];
    },
    almuerzo: (esVeg, esVegt, tiene) => {
      if (esVeg)
        return [
          { nombre: "Garbanzos", porcion: "1 taza cocida (180g)", calorias: 270 },
          { nombre: "Arroz", porcion: "1 taza cocida (150g)", calorias: 215 },
          { nombre: "Zapallo", porcion: "1 taza (150g)", calorias: 40 },
          { nombre: "Aceite de oliva", porcion: "1 cucharada", calorias: 120 },
        ];
      if (esVegt)
        return [
          { nombre: "Fideos", porcion: "1 taza cocida (180g)", calorias: 220 },
          { nombre: "Queso cremoso", porcion: "2 cucharadas (40g)", calorias: 100 },
          { nombre: "Tomate", porcion: "1 unidad", calorias: 20 },
          { nombre: "Aceite de oliva", porcion: "1 cucharada", calorias: 120 },
        ];
      return [
        { nombre: "Atún en lata", porcion: "1 lata (120g)", calorias: 180 },
        { nombre: "Fideos", porcion: "1 taza cocida (180g)", calorias: 220 },
        { nombre: "Tomate", porcion: "1 unidad", calorias: 20 },
        { nombre: "Aceite de oliva", porcion: "1 cucharada", calorias: 120 },
      ];
    },
    merienda: (esVeg, esVegt, tiene) => {
      if (esVeg)
        return [
          { nombre: "Pan", porcion: "2 rebanadas", calorias: 180 },
          { nombre: "Maní", porcion: "25g", calorias: 140 },
          { nombre: "Manzana", porcion: "1 mediana", calorias: 80 },
        ];
      return [
        { nombre: "Pan", porcion: "2 rebanadas", calorias: 180 },
        { nombre: "Queso cremoso", porcion: "2 cucharadas (40g)", calorias: 100 },
        { nombre: "Manzana", porcion: "1 mediana", calorias: 80 },
      ];
    },
    cena: (esVeg, esVegt, tiene) => {
      if (esVeg)
        return [
          { nombre: "Tofu firme", porcion: "150g", calorias: 180 },
          { nombre: "Arroz", porcion: "1 taza cocida (150g)", calorias: 215 },
          { nombre: "Brócoli", porcion: "1 taza (150g)", calorias: 55 },
          { nombre: "Aceite de oliva", porcion: "1 cucharada", calorias: 120 },
        ];
      if (esVegt)
        return [
          { nombre: "Lentejas", porcion: "1 taza cocida (200g)", calorias: 230 },
          { nombre: "Arroz", porcion: "1 taza cocida (150g)", calorias: 215 },
          { nombre: "Espinaca", porcion: "1 taza (100g)", calorias: 25 },
        ];
      return [
        { nombre: "Pechuga de pollo", porcion: "150g", calorias: 250 },
        { nombre: "Papa", porcion: "1 mediana (150g)", calorias: 120 },
        { nombre: "Zanahoria", porcion: "1 zanahoria (80g)", calorias: 33 },
        { nombre: "Aceite de oliva", porcion: "1 cucharada", calorias: 120 },
      ];
    },
  },
  {
    desayuno: (esVeg, esVegt, tiene) => {
      if (esVeg)
        return [
          { nombre: "Avena arrollada", porcion: "1 taza (80g)", calorias: 300 },
          { nombre: "Bebida de soja", porcion: "200ml", calorias: 60 },
          { nombre: "Manzana", porcion: "1 mediana", calorias: 80 },
        ];
      if (esVegt)
        return [
          { nombre: "Huevo", porcion: "2 unidades", calorias: 150 },
          { nombre: "Pan", porcion: "2 rebanadas", calorias: 180 },
          { nombre: "Palta", porcion: "1/2 unidad", calorias: 110 },
        ];
      return [
        { nombre: "Huevo", porcion: "2 unidades", calorias: 150 },
        { nombre: "Pan", porcion: "2 rebanadas", calorias: 180 },
        { nombre: "Palta", porcion: "1/2 unidad", calorias: 110 },
      ];
    },
    almuerzo: (esVeg, esVegt, tiene) => {
      if (esVeg)
        return [
          { nombre: "Porotos", porcion: "1 taza cocida (200g)", calorias: 230 },
          { nombre: "Polenta", porcion: "1 taza (150g)", calorias: 160 },
          { nombre: "Lechuga", porcion: "ensalada", calorias: 15 },
          { nombre: "Tomate", porcion: "1 unidad", calorias: 20 },
          { nombre: "Aceite de oliva", porcion: "1 cucharada", calorias: 120 },
        ];
      if (esVegt)
        return [
          { nombre: "Lentejas", porcion: "1 taza cocida (200g)", calorias: 230 },
          { nombre: "Arroz", porcion: "1 taza cocida (150g)", calorias: 215 },
          { nombre: "Zanahoria", porcion: "1 zanahoria (80g)", calorias: 33 },
          { nombre: "Aceite de oliva", porcion: "1 cucharada", calorias: 120 },
        ];
      return [
        { nombre: "Pechuga de pollo", porcion: "150g", calorias: 250 },
        { nombre: "Papa", porcion: "1 mediana (150g)", calorias: 120 },
        { nombre: "Espinaca", porcion: "1 taza (100g)", calorias: 25 },
        { nombre: "Aceite de oliva", porcion: "1 cucharada", calorias: 120 },
      ];
    },
    merienda: (esVeg, esVegt, tiene) => {
      if (esVeg)
        return [
          { nombre: "Pan", porcion: "2 rebanadas", calorias: 180 },
          { nombre: "Hummus", porcion: "60g", calorias: 100 },
          { nombre: "Manzana", porcion: "1 mediana", calorias: 80 },
        ];
      return [
        ...(tiene("lacteos") ? [{ nombre: "Yogur natural", porcion: "1 pote (150g)", calorias: 80 }] : []),
        { nombre: "Avena arrollada", porcion: "1/2 taza (40g)", calorias: 150 },
        { nombre: "Banana", porcion: "1 mediana", calorias: 100 },
      ];
    },
    cena: (esVeg, esVegt, tiene) => {
      if (esVeg)
        return [
          { nombre: "Garbanzos", porcion: "1 taza cocida (180g)", calorias: 270 },
          { nombre: "Arroz", porcion: "1 taza cocida (150g)", calorias: 215 },
          { nombre: "Espinaca", porcion: "1 taza (100g)", calorias: 25 },
        ];
      if (esVegt)
        return [
          { nombre: "Huevo", porcion: "2 unidades", calorias: 150 },
          { nombre: "Papa", porcion: "1 mediana (150g)", calorias: 120 },
          { nombre: "Tomate", porcion: "1 unidad", calorias: 20 },
          { nombre: "Aceite de oliva", porcion: "1 cucharada", calorias: 120 },
        ];
      return [
        { nombre: "Carne picada magra", porcion: "150g", calorias: 230 },
        { nombre: "Arroz", porcion: "1 taza cocida (150g)", calorias: 215 },
        { nombre: "Zapallo", porcion: "1 taza (150g)", calorias: 40 },
        { nombre: "Aceite de oliva", porcion: "1 cucharada", calorias: 120 },
      ];
    },
  },
  {
    desayuno: (esVeg, esVegt, tiene) => {
      if (esVeg)
        return [
          { nombre: "Avena arrollada", porcion: "1 taza (80g)", calorias: 300 },
          { nombre: "Bebida de almendras", porcion: "200ml", calorias: 30 },
          { nombre: "Naranja", porcion: "1 unidad", calorias: 60 },
        ];
      if (esVegt)
        return [
          { nombre: "Pan", porcion: "2 rebanadas", calorias: 180 },
          ...(tiene("lacteos") ? [{ nombre: "Yogur natural", porcion: "1 pote (150g)", calorias: 80 }] : []),
          { nombre: "Manzana", porcion: "1 mediana", calorias: 80 },
        ];
      return [
        { nombre: "Pan", porcion: "2 rebanadas", calorias: 180 },
        { nombre: "Queso cremoso", porcion: "2 cucharadas (40g)", calorias: 100 },
        { nombre: "Huevo", porcion: "1 unidad", calorias: 75 },
      ];
    },
    almuerzo: (esVeg, esVegt, tiene) => {
      if (esVeg)
        return [
          { nombre: "Lentejas", porcion: "1 taza cocida (200g)", calorias: 230 },
          { nombre: "Polenta", porcion: "1 taza (150g)", calorias: 160 },
          { nombre: "Brócoli", porcion: "1 taza (150g)", calorias: 55 },
          { nombre: "Aceite de oliva", porcion: "1 cucharada", calorias: 120 },
        ];
      if (esVegt)
        return [
          { nombre: "Arroz", porcion: "1 taza cocida (150g)", calorias: 215 },
          { nombre: "Huevo", porcion: "2 unidades", calorias: 150 },
          { nombre: "Tomate", porcion: "1 unidad", calorias: 20 },
          { nombre: "Aceite de oliva", porcion: "1 cucharada", calorias: 120 },
        ];
      return [
        { nombre: "Atún en lata", porcion: "1 lata (120g)", calorias: 180 },
        { nombre: "Arroz", porcion: "1 taza cocida (150g)", calorias: 215 },
        { nombre: "Lechuga", porcion: "ensalada", calorias: 15 },
        { nombre: "Tomate", porcion: "1 unidad", calorias: 20 },
        { nombre: "Aceite de oliva", porcion: "1 cucharada", calorias: 120 },
      ];
    },
    merienda: (esVeg, esVegt, tiene) => {
      if (esVeg)
        return [
          { nombre: "Maní", porcion: "30g", calorias: 170 },
          { nombre: "Banana", porcion: "1 mediana", calorias: 100 },
        ];
      return [
        { nombre: "Pan", porcion: "2 rebanadas", calorias: 180 },
        { nombre: "Queso cremoso", porcion: "2 cucharadas (40g)", calorias: 100 },
        { nombre: "Manzana", porcion: "1 mediana", calorias: 80 },
      ];
    },
    cena: (esVeg, esVegt, tiene) => {
      if (esVeg)
        return [
          { nombre: "Tofu firme", porcion: "150g", calorias: 180 },
          { nombre: "Batata", porcion: "1 mediana (150g)", calorias: 130 },
          { nombre: "Espinaca", porcion: "1 taza (100g)", calorias: 25 },
          { nombre: "Aceite de oliva", porcion: "1 cucharada", calorias: 120 },
        ];
      if (esVegt)
        return [
          { nombre: "Garbanzos", porcion: "1 taza cocida (180g)", calorias: 270 },
          { nombre: "Arroz", porcion: "1 taza cocida (150g)", calorias: 215 },
          { nombre: "Zanahoria", porcion: "1 zanahoria (80g)", calorias: 33 },
        ];
      return [
        { nombre: "Pechuga de pollo", porcion: "150g", calorias: 250 },
        { nombre: "Fideos", porcion: "1 taza cocida (180g)", calorias: 220 },
        { nombre: "Brócoli", porcion: "1 taza (150g)", calorias: 55 },
        { nombre: "Aceite de oliva", porcion: "1 cucharada", calorias: 120 },
      ];
    },
  },
];

function generarPlanComidas(indicadores, perfil, seed = 0) {
  const calorias = indicadores?.calorias || 2000;
  const tipo = (perfil.tipoAlimentacion || "omnivoro").toLowerCase();
  const esVegano = tipo.includes("vegano");
  const esVegetariano = tipo.includes("vegetariano") || esVegano;
  const noComer = new Set(perfil.preferenciasNoComer || []);

  const tiene = (id) => !noComer.has(id);

  const variante = VARIANTES_COMIDAS[seed % CANTIDAD_VARIANTES];
  const nombresExcluidos = getExcludedNames(perfil.preferenciasNoComer || []);
  const filtrarAlimentos = (alimentos) =>
    (alimentos || []).filter((al) => !nombresExcluidos.has(al.nombre));

  const comidas = [];

  const desayunoCal = Math.round(calorias * 0.25);
  comidas.push({
    tipo: "Desayuno",
    calorias: desayunoCal,
    alimentos: filtrarAlimentos(variante.desayuno(esVegano, esVegetariano, tiene)),
  });

  const almuerzoCal = Math.round(calorias * 0.35);
  comidas.push({
    tipo: "Almuerzo",
    calorias: almuerzoCal,
    alimentos: filtrarAlimentos(variante.almuerzo(esVegano, esVegetariano, tiene)),
  });

  const meriendaCal = Math.round(calorias * 0.15);
  comidas.push({
    tipo: "Merienda",
    calorias: meriendaCal,
    alimentos: filtrarAlimentos(variante.merienda(esVegano, esVegetariano, tiene)),
  });

  const cenaCal = Math.round(calorias * 0.25);
  comidas.push({
    tipo: "Cena",
    calorias: cenaCal,
    alimentos: filtrarAlimentos(variante.cena(esVegano, esVegetariano, tiene)),
  });

  return comidas;
}

const MEAL_TYPE_LABEL = {
  desayuno: "Desayuno",
  almuerzo: "Almuerzo",
  merienda: "Merienda",
  cena: "Cena",
};

/* ---------------------------------------------------------------
   ENDPOINTS
--------------------------------------------------------------- */

// Genera un plan nuevo para el usuario usando la variante de rotación activa.
async function generarNuevoPlan(userId, seed) {
  const user = await User.findById(userId);
  const answers = await TestAnswers.findOne({ userId });
  const perfil = { name: user.name, ...answers.toObject() };
  const indicadores = calcularIndicadores(perfil);

  let resultado;
  let generadoPor = "reglas";

  if (process.env.ANTHROPIC_API_KEY) {
    try {
      resultado = await generarPlanConIA(perfil, seed);
      if (!resultado.macros || !resultado.planComidas) {
        throw new Error("Respuesta de IA incompleta");
      }
      if (!resultado.indicadores) resultado.indicadores = indicadores;
      generadoPor = "ia";
    } catch (iaErr) {
      console.warn("IA falló, usando motor de reglas:", iaErr.message);
      resultado = generarPlanDeterministico(perfil, indicadores, seed);
    }
  } else {
    resultado = generarPlanDeterministico(perfil, indicadores, seed);
  }

  return Plan.create({
    userId,
    ...resultado,
    indicadores,
    generadoPor,
    seed,
    renuevaEl: new Date(Date.now() + DIA_MS * ROTACION_DIAS),
  });
}

// POST /api/plan/generate — genera un plan nuevo con la SIGUIENTE variante
router.post("/generate", requireAuth, async (req, res) => {
  try {
    const answers = await TestAnswers.findOne({ userId: req.userId });
    if (!answers) {
      return res.status(400).json({ error: "Completá el test de salud antes de generar el plan." });
    }

    const seedActual = obtenerSeedActual();
    const ultimo = await Plan.findOne({ userId: req.userId }).sort({ createdAt: -1 });
    const base = ultimo && typeof ultimo.seed === "number" ? ultimo.seed : seedActual;
    const seed = (base + 1) % CANTIDAD_VARIANTES;

    const plan = await generarNuevoPlan(req.userId, seed);

    res.json({ plan });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Hubo un problema generando el plan. Intentá de nuevo." });
  }
});

// POST /api/plan/regenerate-meal — regenera SOLO una comida del día
// (desayuno, almuerzo, merienda o cena) usando la siguiente variante.
router.post("/regenerate-meal", requireAuth, async (req, res) => {
  try {
    const mealType = (req.body.mealType || "").toLowerCase();
    const label = MEAL_TYPE_LABEL[mealType];
    if (!label) {
      return res.status(400).json({ error: "Tipo de comida inválido. Usá desayuno, almuerzo, merienda o cena." });
    }

    const plan = await Plan.findOne({ userId: req.userId }).sort({ createdAt: -1 });
    if (!plan) {
      return res.status(404).json({ error: "No hay un plan generado todavía." });
    }

    const user = await User.findById(req.userId);
    const answers = await TestAnswers.findOne({ userId: req.userId });
    if (!user || !answers) {
      return res.status(400).json({ error: "Completá el test de salud antes de regenerar." });
    }
    const perfil = { name: user.name, ...answers.toObject() };
    const indicadores = calcularIndicadores(perfil);

    const seed = ((typeof plan.seed === "number" ? plan.seed : 0) + 1) % CANTIDAD_VARIANTES;
    const comidasNuevas = generarPlanComidas(indicadores, perfil, seed);

    const reemplazo = comidasNuevas.find((c) => c.tipo === label);
    if (!reemplazo) {
      return res.status(500).json({ error: "No se pudo regenerar la comida. Intentá de nuevo." });
    }

    const comidas = plan.planComidas || [];
    const idx = comidas.findIndex((c) => c.tipo === label);
    if (idx >= 0) {
      comidas[idx] = reemplazo;
    } else {
      comidas.push(reemplazo);
    }
    plan.planComidas = comidas;
    plan.seed = seed;
    await plan.save();

    res.json({ plan });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Hubo un problema regenerando la comida. Intentá de nuevo." });
  }
});

// GET /api/plan — último plan. Si pasaron 3 días (renuevaEl vencido),
// se regenera automáticamente con la variante del ciclo actual.
router.get("/", requireAuth, async (req, res) => {
  try {
    const seedActual = obtenerSeedActual();
    let plan = await Plan.findOne({ userId: req.userId }).sort({ createdAt: -1 });

    const planVigente =
      plan && plan.renuevaEl && new Date(plan.renuevaEl).getTime() > Date.now();

    if (!planVigente) {
      const answers = await TestAnswers.findOne({ userId: req.userId });
      if (answers) {
        plan = await generarNuevoPlan(req.userId, seedActual);
      }
    }

    res.json({ plan: plan || null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Hubo un problema cargando el plan." });
  }
});

/* ---------------------------------------------------------------
   LISTA DE COMPRAS — agrega los alimentos del plan en un solo lugar
--------------------------------------------------------------- */
const UNIDADES_COMPRA = {
  unidad: "unidades",
  rebanada: "rebanadas",
  taza: "tazas",
  cucharada: "cucharadas",
  pote: "potes",
  lata: "latas",
  porcion: "porciones",
  puñado: "puñados",
  rodaja: "rodajas",
  mediana: "medianas",
  banana: "bananas",
};

function parsePorcionCompra(porcion) {
  const s = String(porcion || "");
  const res = { gramos: 0, ml: 0, count: 0, unidad: null };

  const g = s.match(/(\d+(?:[.,]\d+)?)\s*g/);
  if (g) res.gramos += parseFloat(g[1].replace(",", "."));

  const ml = s.match(/(\d+(?:[.,]\d+)?)\s*ml/);
  if (ml) res.ml += parseFloat(ml[1].replace(",", "."));

  const n = s.match(/^(\d+(?:[.,]\d+)?|1\/2)\b/);
  res.count += n ? (n[1].includes("/") ? 0.5 : parseFloat(n[1].replace(",", "."))) : 1;

  const u = s.match(/(unidad|rebanada|taza|cucharada|pote|lata|porcion|puñado|rodaja|mediana|banana)s?/i);
  if (u) res.unidad = u[1].toLowerCase();

  return res;
}

function armarListaDeCompras(plan) {
  const mapa = new Map();
  for (const comida of plan.planComidas || []) {
    for (const al of comida.alimentos || []) {
      const clave = al.nombre.trim().toLowerCase();
      if (!clave) continue;
      const info = parsePorcionCompra(al.porcion);
      const it = mapa.get(clave) || { nombre: al.nombre.trim(), gramos: 0, ml: 0, count: 0, unidad: null };
      it.gramos += info.gramos;
      it.ml += info.ml;
      it.count += info.count;
      if (!it.unidad && info.unidad) it.unidad = info.unidad;
      mapa.set(clave, it);
    }
  }

  const items = [];
  for (const it of mapa.values()) {
    let detalle;
    if (it.gramos > 0) {
      detalle =
        it.gramos >= 1000
          ? `${(Math.round((it.gramos / 1000) * 10) / 10).toLocaleString("es-AR")} kg`
          : `${Math.round(it.gramos)} g`;
    } else if (it.ml > 0) {
      detalle =
        it.ml >= 1000
          ? `${(Math.round((it.ml / 1000) * 10) / 10).toLocaleString("es-AR")} L`
          : `${Math.round(it.ml)} ml`;
    } else if (it.unidad) {
      const cant = Math.max(1, Math.ceil(it.count));
      detalle = cant === 1 ? `1 ${it.unidad}` : `${cant} ${UNIDADES_COMPRA[it.unidad] || it.unidad + "s"}`;
    } else {
      const cant = Math.max(1, Math.ceil(it.count));
      detalle = cant === 1 ? "1 porción" : `${cant} porciones`;
    }
    items.push({ nombre: it.nombre, detalle });
  }
  items.sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
  return items;
}

// GET /api/plan/shopping-list — lista de compras derivada del plan actual
router.get("/shopping-list", requireAuth, async (req, res) => {
  try {
    let plan = await Plan.findOne({ userId: req.userId }).sort({ createdAt: -1 });

    const planVigente =
      plan && plan.renuevaEl && new Date(plan.renuevaEl).getTime() > Date.now();
    if (!planVigente) {
      const answers = await TestAnswers.findOne({ userId: req.userId });
      if (answers) plan = await generarNuevoPlan(req.userId, obtenerSeedActual());
    }

    if (!plan) return res.json({ hasPlan: false, items: [], products: [] });

    const items = armarListaDeCompras(plan);
    const products = (plan.productos || []).map((p) => ({
      nombre: p.nombre,
      motivo: p.motivo,
      tags: p.tags || [],
    }));

    res.json({ hasPlan: true, items, products });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Hubo un problema armando la lista de compras." });
  }
});

// GET /api/plan/catalog — catálogo de restricciones y condiciones para el test
router.get("/catalog", requireAuth, (req, res) => {
  res.json({
    restricciones: RESTRICCIONES_CATALOGO,
    condiciones: CONDICIONES_SALUD,
    tipoAlimentacion: [
      { id: "omnivoro", label: "Omnívoro" },
      { id: "vegetariano", label: "Vegetariano" },
      { id: "vegano", label: "Vegano" },
    ],
  });
});

module.exports = router;
