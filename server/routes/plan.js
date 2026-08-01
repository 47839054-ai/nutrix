const express = require("express");
const User = require("../models/User");
const TestAnswers = require("../models/TestAnswers");
const Plan = require("../models/Plan");
const requireAuth = require("../middleware/auth");
const { calcularIndicadores } = require("../utils/nutricion");
const { generarPlanConIA } = require("../utils/aiPlanGenerator");

const router = express.Router();

/* ---------------------------------------------------------------
   CATÁLOGO DE PRODUCTOS
--------------------------------------------------------------- */
const CATALOGO_PRODUCTOS = [
  { nombre: "Pechuga de pollo", categoria: "Proteína", tags: ["Sin TACC", "Sin lactosa", "Apto diabéticos"], tacc: false, lactosa: false, vegano: false, vegetariano: false, motivo: "Proteína magra de alto valor biológico, base de casi cualquier plan." },
  { nombre: "Lentejas", categoria: "Legumbres", tags: ["Vegano", "Vegetariano", "Sin TACC", "Sin lactosa"], tacc: false, lactosa: false, vegano: true, vegetariano: true, motivo: "Aportan proteína vegetal, hierro y fibra a buen precio." },
  { nombre: "Tofu firme", categoria: "Proteína vegetal", tags: ["Vegano", "Vegetariano", "Sin TACC", "Sin lactosa"], tacc: false, lactosa: false, vegano: true, vegetariano: true, motivo: "Reemplazo proteico versátil para preparaciones veganas." },
  { nombre: "Huevo", categoria: "Proteína", tags: ["Vegetariano", "Sin TACC", "Sin lactosa"], tacc: false, lactosa: false, vegano: false, vegetariano: true, motivo: "Proteína completa, práctica para desayunos y meriendas." },
  { nombre: "Avena arrollada", categoria: "Cereales", tags: ["Vegano", "Vegetariano", "Sin lactosa"], tacc: true, lactosa: false, vegano: true, vegetariano: true, motivo: "Carbohidrato complejo de bajo índice glucémico, buena saciedad." },
  { nombre: "Arroz integral", categoria: "Cereales", tags: ["Vegano", "Vegetariano", "Sin TACC", "Sin lactosa"], tacc: false, lactosa: false, vegano: true, vegetariano: true, motivo: "Cereal integral apto para casi todos los perfiles." },
  { nombre: "Quinoa", categoria: "Cereales", tags: ["Vegano", "Vegetariano", "Sin TACC", "Sin lactosa", "Apto diabéticos"], tacc: false, lactosa: false, vegano: true, vegetariano: true, motivo: "Pseudocereal con proteína completa y bajo impacto glucémico." },
  { nombre: "Batata", categoria: "Verduras", tags: ["Vegano", "Vegetariano", "Sin TACC", "Sin lactosa"], tacc: false, lactosa: false, vegano: true, vegetariano: true, motivo: "Buena fuente de energía con fibra y betacarotenos." },
  { nombre: "Brócoli", categoria: "Verduras", tags: ["Vegano", "Vegetariano", "Sin TACC", "Sin lactosa", "Bajo en sodio", "Apto diabéticos"], tacc: false, lactosa: false, vegano: true, vegetariano: true, motivo: "Bajo en calorías, alto en fibra, vitamina C y minerales." },
  { nombre: "Espinaca", categoria: "Verduras", tags: ["Vegano", "Vegetariano", "Sin TACC", "Sin lactosa", "Bajo en sodio"], tacc: false, lactosa: false, vegano: true, vegetariano: true, motivo: "Aporta hierro y folato con muy pocas calorías." },
  { nombre: "Palta", categoria: "Grasas saludables", tags: ["Vegano", "Vegetariano", "Sin TACC", "Sin lactosa"], tacc: false, lactosa: false, vegano: true, vegetariano: true, motivo: "Grasas monoinsaturadas que ayudan a la saciedad." },
  { nombre: "Aceite de oliva extra virgen", categoria: "Grasas saludables", tags: ["Vegano", "Vegetariano", "Sin TACC", "Sin lactosa", "Apto diabéticos"], tacc: false, lactosa: false, vegano: true, vegetariano: true, motivo: "Grasa de buena calidad para cocción y aderezos." },
  { nombre: "Nueces", categoria: "Frutos secos", tags: ["Vegano", "Vegetariano", "Sin TACC", "Sin lactosa"], tacc: false, lactosa: false, vegano: true, vegetariano: true, motivo: "Snack denso en nutrientes, aporta omega-3 vegetal." },
  { nombre: "Yogur natural descremado", categoria: "Lácteos", tags: ["Vegetariano", "Sin TACC", "Bajo en sodio"], tacc: false, lactosa: true, vegano: false, vegetariano: true, motivo: "Buena fuente de calcio y proteína para meriendas." },
  { nombre: "Bebida de almendras sin azúcar", categoria: "Alternativas vegetales", tags: ["Vegano", "Vegetariano", "Sin TACC", "Sin lactosa"], tacc: false, lactosa: false, vegano: true, vegetariano: true, motivo: "Alternativa a la leche para quienes evitan lácteos." },
  { nombre: "Salmón", categoria: "Proteína", tags: ["Sin TACC", "Sin lactosa"], tacc: false, lactosa: false, vegano: false, vegetariano: false, motivo: "Rico en omega-3 y proteína de alta calidad." },
  { nombre: "Frutos rojos congelados", categoria: "Frutas", tags: ["Vegano", "Vegetariano", "Sin TACC", "Sin lactosa", "Apto diabéticos"], tacc: false, lactosa: false, vegano: true, vegetariano: true, motivo: "Antioxidantes con bajo impacto glucémico, prácticos para licuados." },
  { nombre: "Banana", categoria: "Frutas", tags: ["Vegano", "Vegetariano", "Sin TACC", "Sin lactosa"], tacc: false, lactosa: false, vegano: true, vegetariano: true, motivo: "Energía rápida, ideal antes o después de entrenar." },
  { nombre: "Pan sin TACC", categoria: "Cereales", tags: ["Sin TACC", "Vegano", "Vegetariano", "Sin lactosa"], tacc: false, lactosa: false, vegano: true, vegetariano: true, motivo: "Opción de pan apta para celíacos." },
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
  { id: "sin_mariscos", label: "Sin mariscos / mariscos" },
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
const FOOD_AVOID_MAP = {
  carne: ["Pechuga de pollo"],
  cerdo: [],
  pescado: ["Salmón"],
  mariscos: [],
  huevo: ["Huevo"],
  lacteos: ["Yogur natural descremado"],
  frutos_secos: ["Nueces"],
  trigo: [],
  soja: ["Tofu firme"],
  maiz: [],
  papa: [],
  tomate: [],
  cebolla: [],
  champinones: [],
  ultraprocesados: ["Pan sin TACC", "Hummus"],
  azucar: ["Bebida de almendras sin azúcar", "Banana"],
  frituras: [],
  gaseosa: [],
};

function filtrarCatalogo(perfil) {
  const restricciones = perfil.restricciones || [];
  const tipo = (perfil.tipoAlimentacion || "").toLowerCase();
  const noComer = perfil.preferenciasNoComer || [];
  const nombresExcluidos = new Set();
  noComer.forEach((key) => {
    (FOOD_AVOID_MAP[key] || []).forEach((n) => nombresExcluidos.add(n));
  });
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
  const resumen = `Plan calculado con reglas nutricionales fijas (IMC, TMB y gasto calórico) pensado para ${objetivoTexto}, en base a tu peso, altura y nivel de actividad.`;

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

  // Plan de comidas diario (rotado según la variante activa)
  const planComidas = generarPlanComidas(indicadores, perfil, seed);

  return { resumen, macros, productos, recomendaciones_generales, planComidas };
}

/* Variantes de comidas: cada variante define desayuno, almuerzo, merienda y cena
   según el tipo de alimentación. Se elige con (seed % CANTIDAD_VARIANTES). */
const VARIANTES_COMIDAS = [
  {
    desayuno: (esVeg, esVegt, tiene) => {
      if (esVeg)
        return [
          { nombre: "Avena arrollada", porcion: "1 taza (80g)", calorias: 300 },
          { nombre: "Bebida de almendras", porcion: "200ml", calorias: 30 },
          { nombre: "Frutos rojos", porcion: "100g", calorias: 50 },
        ];
      if (esVegt)
        return [
          { nombre: "Huevo", porcion: "2 unidades", calorias: 150 },
          { nombre: "Pan integral", porcion: "2 rebanadas", calorias: 180 },
          ...(tiene("lacteos") ? [{ nombre: "Yogur natural", porcion: "1 pote (150g)", calorias: 80 }] : []),
        ];
      return [
        { nombre: "Huevo", porcion: "2 unidades", calorias: 150 },
        { nombre: "Pan integral", porcion: "2 rebanadas", calorias: 180 },
        ...(tiene("azucar") ? [{ nombre: "Banana", porcion: "1 mediana", calorias: 100 }] : []),
      ];
    },
    almuerzo: (esVeg, esVegt, tiene) => {
      if (esVeg)
        return [
          { nombre: "Lentejas", porcion: "1 taza cocida (200g)", calorias: 230 },
          { nombre: "Arroz integral", porcion: "1 taza cocida (150g)", calorias: 215 },
          { nombre: "Brócoli", porcion: "1 taza (150g)", calorias: 55 },
          { nombre: "Aceite de oliva", porcion: "1 cucharada", calorias: 120 },
        ];
      if (esVegt)
        return [
          { nombre: "Quinoa", porcion: "1 taza cocida (180g)", calorias: 220 },
          { nombre: "Huevo", porcion: "1 unidad", calorias: 75 },
          { nombre: "Espinaca", porcion: "1 taza (100g)", calorias: 25 },
          { nombre: "Aceite de oliva", porcion: "1 cucharada", calorias: 120 },
        ];
      return [
        { nombre: "Pechuga de pollo", porcion: "150g", calorias: 250 },
        { nombre: "Arroz integral", porcion: "1 taza cocida (150g)", calorias: 215 },
        { nombre: "Brócoli", porcion: "1 taza (150g)", calorias: 55 },
        { nombre: "Aceite de oliva", porcion: "1 cucharada", calorias: 120 },
      ];
    },
    merienda: (esVeg, esVegt, tiene) => {
      if (esVeg)
        return [
          { nombre: "Nueces", porcion: "30g", calorias: 185 },
          ...(tiene("azucar") ? [{ nombre: "Banana", porcion: "1 mediana", calorias: 100 }] : []),
        ];
      return [
        ...(tiene("lacteos") ? [{ nombre: "Yogur natural", porcion: "1 pote (150g)", calorias: 80 }] : []),
        { nombre: "Nueces", porcion: "20g", calorias: 130 },
        { nombre: "Frutos rojos", porcion: "100g", calorias: 50 },
      ];
    },
    cena: (esVeg, esVegt, tiene) => {
      if (esVeg)
        return [
          { nombre: "Tofu firme", porcion: "150g", calorias: 180 },
          { nombre: "Espinaca", porcion: "1 taza (100g)", calorias: 25 },
          { nombre: "Batata", porcion: "1 mediana (150g)", calorias: 130 },
          { nombre: "Aceite de oliva", porcion: "1 cucharada", calorias: 120 },
        ];
      if (esVegt)
        return [
          { nombre: "Huevo", porcion: "2 unidades", calorias: 150 },
          { nombre: "Espinaca", porcion: "1 taza (100g)", calorias: 25 },
          { nombre: "Batata", porcion: "1 mediana (150g)", calorias: 130 },
          { nombre: "Aceite de oliva", porcion: "1 cucharada", calorias: 120 },
        ];
      return [
        { nombre: "Salmón", porcion: "150g", calorias: 280 },
        { nombre: "Brócoli", porcion: "1 taza (150g)", calorias: 55 },
        { nombre: "Batata", porcion: "1 mediana (150g)", calorias: 130 },
      ];
    },
  },
  {
    desayuno: (esVeg, esVegt, tiene) => {
      if (esVeg)
        return [
          { nombre: "Avena arrollada", porcion: "1 taza (80g)", calorias: 300 },
          { nombre: "Bebida de almendras", porcion: "200ml", calorias: 30 },
          ...(tiene("azucar") ? [{ nombre: "Banana", porcion: "1 mediana", calorias: 100 }] : []),
        ];
      if (esVegt)
        return [
          ...(tiene("lacteos") ? [{ nombre: "Yogur natural", porcion: "1 pote (150g)", calorias: 80 }] : []),
          { nombre: "Pan integral", porcion: "2 rebanadas", calorias: 180 },
          { nombre: "Frutos rojos", porcion: "100g", calorias: 50 },
          { nombre: "Nueces", porcion: "15g", calorias: 95 },
        ];
      return [
        ...(tiene("lacteos") ? [{ nombre: "Yogur natural", porcion: "1 pote (150g)", calorias: 80 }] : []),
        { nombre: "Pan integral", porcion: "2 rebanadas", calorias: 180 },
        { nombre: "Huevo", porcion: "1 unidad", calorias: 75 },
      ];
    },
    almuerzo: (esVeg, esVegt, tiene) => {
      if (esVeg)
        return [
          { nombre: "Quinoa", porcion: "1 taza cocida (180g)", calorias: 220 },
          { nombre: "Lentejas", porcion: "1/2 taza cocida (100g)", calorias: 115 },
          { nombre: "Espinaca", porcion: "1 taza (100g)", calorias: 25 },
          { nombre: "Aceite de oliva", porcion: "1 cucharada", calorias: 120 },
        ];
      if (esVegt)
        return [
          { nombre: "Arroz integral", porcion: "1 taza cocida (150g)", calorias: 215 },
          { nombre: "Huevo", porcion: "2 unidades", calorias: 150 },
          { nombre: "Brócoli", porcion: "1 taza (150g)", calorias: 55 },
          { nombre: "Aceite de oliva", porcion: "1 cucharada", calorias: 120 },
        ];
      return [
        { nombre: "Pechuga de pollo", porcion: "150g", calorias: 250 },
        { nombre: "Quinoa", porcion: "1 taza cocida (180g)", calorias: 220 },
        { nombre: "Espinaca", porcion: "1 taza (100g)", calorias: 25 },
      ];
    },
    merienda: (esVeg, esVegt, tiene) => {
      if (esVeg)
        return [
          { nombre: "Hummus", porcion: "100g", calorias: 150 },
          { nombre: "Pan sin TACC", porcion: "2 rebanadas", calorias: 120 },
          { nombre: "Frutos rojos", porcion: "100g", calorias: 50 },
        ];
      return [
          ...(tiene("azucar") ? [{ nombre: "Banana", porcion: "1 mediana", calorias: 100 }] : []),
          { nombre: "Nueces", porcion: "20g", calorias: 130 },
          ...(tiene("lacteos") ? [{ nombre: "Yogur natural", porcion: "1 pote (150g)", calorias: 80 }] : []),
      ];
    },
    cena: (esVeg, esVegt, tiene) => {
      if (esVeg)
        return [
          { nombre: "Lentejas", porcion: "1 taza cocida (200g)", calorias: 230 },
          { nombre: "Arroz integral", porcion: "1/2 taza cocida (75g)", calorias: 110 },
          { nombre: "Brócoli", porcion: "1 taza (150g)", calorias: 55 },
        ];
      if (esVegt)
        return [
          { nombre: "Tofu firme", porcion: "150g", calorias: 180 },
          { nombre: "Quinoa", porcion: "1 taza cocida (180g)", calorias: 220 },
          { nombre: "Espinaca", porcion: "1 taza (100g)", calorias: 25 },
        ];
      return [
        { nombre: "Salmón", porcion: "150g", calorias: 280 },
        { nombre: "Quinoa", porcion: "1 taza cocida (180g)", calorias: 220 },
        { nombre: "Espinaca", porcion: "1 taza (100g)", calorias: 25 },
      ];
    },
  },
  {
    desayuno: (esVeg, esVegt, tiene) => {
      if (esVeg)
        return [
          { nombre: "Avena arrollada", porcion: "1 taza (80g)", calorias: 300 },
          { nombre: "Frutos rojos", porcion: "100g", calorias: 50 },
          { nombre: "Nueces", porcion: "15g", calorias: 95 },
        ];
      if (esVegt)
        return [
          { nombre: "Huevo", porcion: "2 unidades", calorias: 150 },
          { nombre: "Pan integral", porcion: "2 rebanadas", calorias: 180 },
          { nombre: "Frutos rojos", porcion: "100g", calorias: 50 },
        ];
      return [
        { nombre: "Huevo", porcion: "2 unidades", calorias: 150 },
        { nombre: "Pan integral", porcion: "2 rebanadas", calorias: 180 },
        { nombre: "Palta", porcion: "1/2 unidad", calorias: 110 },
      ];
    },
    almuerzo: (esVeg, esVegt, tiene) => {
      if (esVeg)
        return [
          { nombre: "Tofu firme", porcion: "150g", calorias: 180 },
          { nombre: "Arroz integral", porcion: "1 taza cocida (150g)", calorias: 215 },
          { nombre: "Brócoli", porcion: "1 taza (150g)", calorias: 55 },
          { nombre: "Aceite de oliva", porcion: "1 cucharada", calorias: 120 },
        ];
      if (esVegt)
        return [
          { nombre: "Lentejas", porcion: "1 taza cocida (200g)", calorias: 230 },
          { nombre: "Quinoa", porcion: "1/2 taza cocida (90g)", calorias: 110 },
          { nombre: "Brócoli", porcion: "1 taza (150g)", calorias: 55 },
        ];
      return [
        { nombre: "Pechuga de pollo", porcion: "150g", calorias: 250 },
        { nombre: "Batata", porcion: "1 mediana (150g)", calorias: 130 },
        { nombre: "Espinaca", porcion: "1 taza (100g)", calorias: 25 },
        { nombre: "Aceite de oliva", porcion: "1 cucharada", calorias: 120 },
      ];
    },
    merienda: (esVeg, esVegt, tiene) => {
      if (esVeg)
        return [
          ...(tiene("azucar") ? [{ nombre: "Banana", porcion: "1 mediana", calorias: 100 }] : []),
          { nombre: "Nueces", porcion: "30g", calorias: 185 },
        ];
      return [
        ...(tiene("lacteos") ? [{ nombre: "Yogur natural", porcion: "1 pote (150g)", calorias: 80 }] : []),
        { nombre: "Frutos rojos", porcion: "100g", calorias: 50 },
        { nombre: "Avena arrollada", porcion: "1/2 taza (40g)", calorias: 150 },
      ];
    },
    cena: (esVeg, esVegt, tiene) => {
      if (esVeg)
        return [
          { nombre: "Lentejas", porcion: "1 taza cocida (200g)", calorias: 230 },
          { nombre: "Espinaca", porcion: "1 taza (100g)", calorias: 25 },
          { nombre: "Batata", porcion: "1 mediana (150g)", calorias: 130 },
        ];
      if (esVegt)
        return [
          { nombre: "Huevo", porcion: "2 unidades", calorias: 150 },
          { nombre: "Arroz integral", porcion: "1 taza cocida (150g)", calorias: 215 },
          { nombre: "Brócoli", porcion: "1 taza (150g)", calorias: 55 },
        ];
      return [
        { nombre: "Pechuga de pollo", porcion: "150g", calorias: 250 },
        { nombre: "Arroz integral", porcion: "1 taza cocida (150g)", calorias: 215 },
        { nombre: "Brócoli", porcion: "1 taza (150g)", calorias: 55 },
      ];
    },
  },
  {
    desayuno: (esVeg, esVegt, tiene) => {
      if (esVeg)
        return [
          { nombre: "Batata", porcion: "1 mediana (150g)", calorias: 130 },
          { nombre: "Hummus", porcion: "100g", calorias: 150 },
          { nombre: "Frutos rojos", porcion: "100g", calorias: 50 },
        ];
      if (esVegt)
        return [
          { nombre: "Pan integral", porcion: "2 rebanadas", calorias: 180 },
          { nombre: "Hummus", porcion: "100g", calorias: 150 },
          { nombre: "Frutos rojos", porcion: "100g", calorias: 50 },
        ];
      return [
        { nombre: "Huevo", porcion: "2 unidades", calorias: 150 },
        { nombre: "Palta", porcion: "1/2 unidad", calorias: 110 },
        { nombre: "Pan integral", porcion: "1 rebanada", calorias: 90 },
      ];
    },
    almuerzo: (esVeg, esVegt, tiene) => {
      if (esVeg)
        return [
          { nombre: "Quinoa", porcion: "1 taza cocida (180g)", calorias: 220 },
          { nombre: "Tofu firme", porcion: "150g", calorias: 180 },
          { nombre: "Espinaca", porcion: "1 taza (100g)", calorias: 25 },
          { nombre: "Aceite de oliva", porcion: "1 cucharada", calorias: 120 },
        ];
      if (esVegt)
        return [
          { nombre: "Arroz integral", porcion: "1 taza cocida (150g)", calorias: 215 },
          { nombre: "Huevo", porcion: "2 unidades", calorias: 150 },
          { nombre: "Espinaca", porcion: "1 taza (100g)", calorias: 25 },
          { nombre: "Aceite de oliva", porcion: "1 cucharada", calorias: 120 },
        ];
      return [
        { nombre: "Salmón", porcion: "150g", calorias: 280 },
        { nombre: "Arroz integral", porcion: "1 taza cocida (150g)", calorias: 215 },
        { nombre: "Espinaca", porcion: "1 taza (100g)", calorias: 25 },
      ];
    },
    merienda: (esVeg, esVegt, tiene) => {
      if (esVeg)
        return [
          { nombre: "Bebida de almendras", porcion: "200ml", calorias: 30 },
          { nombre: "Avena arrollada", porcion: "1/2 taza (40g)", calorias: 150 },
          ...(tiene("azucar") ? [{ nombre: "Banana", porcion: "1 mediana", calorias: 100 }] : []),
        ];
      return [
        ...(tiene("lacteos") ? [{ nombre: "Yogur natural", porcion: "1 pote (150g)", calorias: 80 }] : []),
        { nombre: "Nueces", porcion: "20g", calorias: 130 },
        ...(tiene("azucar") ? [{ nombre: "Banana", porcion: "1 mediana", calorias: 100 }] : []),
      ];
    },
    cena: (esVeg, esVegt, tiene) => {
      if (esVeg)
        return [
          { nombre: "Lentejas", porcion: "1 taza cocida (200g)", calorias: 230 },
          { nombre: "Arroz integral", porcion: "1 taza cocida (150g)", calorias: 215 },
          { nombre: "Brócoli", porcion: "1 taza (150g)", calorias: 55 },
        ];
      if (esVegt)
        return [
          { nombre: "Quinoa", porcion: "1 taza cocida (180g)", calorias: 220 },
          { nombre: "Huevo", porcion: "1 unidad", calorias: 75 },
          { nombre: "Brócoli", porcion: "1 taza (150g)", calorias: 55 },
          { nombre: "Aceite de oliva", porcion: "1 cucharada", calorias: 120 },
        ];
      return [
        { nombre: "Pechuga de pollo", porcion: "150g", calorias: 250 },
        { nombre: "Batata", porcion: "1 mediana (150g)", calorias: 130 },
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
  const comidas = [];

  const desayunoCal = Math.round(calorias * 0.25);
  comidas.push({
    tipo: "Desayuno",
    calorias: desayunoCal,
    alimentos: variante.desayuno(esVegano, esVegetariano, tiene),
  });

  const almuerzoCal = Math.round(calorias * 0.35);
  comidas.push({
    tipo: "Almuerzo",
    calorias: almuerzoCal,
    alimentos: variante.almuerzo(esVegano, esVegetariano, tiene),
  });

  const meriendaCal = Math.round(calorias * 0.15);
  comidas.push({
    tipo: "Merienda",
    calorias: meriendaCal,
    alimentos: variante.merienda(esVegano, esVegetariano, tiene),
  });

  const cenaCal = Math.round(calorias * 0.25);
  comidas.push({
    tipo: "Cena",
    calorias: cenaCal,
    alimentos: variante.cena(esVegano, esVegetariano, tiene),
  });

  return comidas;
}

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
      // Asegurar que tenga los campos necesarios
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
// (así el usuario siempre ve un menú distinto al apretar "Regenerar").
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
