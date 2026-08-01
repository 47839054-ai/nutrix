// server/utils/nutricion.js

function calcularIMC(pesoKg, alturaCm) {
  if (!pesoKg || !alturaCm) return null;
  const alturaM = alturaCm / 100;
  const imc = pesoKg / (alturaM * alturaM);
  return Math.round(imc * 10) / 10;
}

function clasificarIMC(imc) {
  if (imc == null) return "—";
  if (imc < 18.5) return "Bajo peso";
  if (imc < 25) return "Normal";
  if (imc < 30) return "Sobrepeso";
  return "Obesidad";
}

function calcularTMB({ peso, altura, edad, sexo }) {
  if (!peso || !altura || !edad) return null;
  const base = 10 * peso + 6.25 * altura - 5 * edad;
  if (sexo === "male" || sexo === "Masculino") return Math.round(base + 5);
  if (sexo === "female" || sexo === "Femenino") return Math.round(base - 161);
  return Math.round(base - 78);
}

const FACTOR_ACTIVIDAD = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.45,
  active: 1.65,
  very_active: 1.85,
  sedentario: 1.2,
  moderado: 1.45,
  activo: 1.65,
  muy_activo: 1.85,
};

function calcularCaloriasDiarias(tmb, actividad, objetivo) {
  if (!tmb) return null;
  const factor = FACTOR_ACTIVIDAD[actividad] || 1.45;
  let calorias = tmb * factor;
  if (objetivo === "bajar" || objetivo === "lose_weight") calorias -= 400;
  if (objetivo === "masa" || objetivo === "gain_muscle") calorias += 350;
  return Math.max(1200, Math.round(calorias));
}

function calcularAguaDiaria(pesoKg, actividad) {
  if (!pesoKg) return null;
  let ml = pesoKg * 35;
  if (actividad === "active" || actividad === "activo") ml += 350;
  if (actividad === "very_active" || actividad === "muy_activo") ml += 600;
  return Math.round(ml);
}

function calcularIndicadores(perfil = {}) {
  const { peso, altura, edad, sexo, actividad, objetivo, weight, height, age, sex, activityLevel, goal } = perfil;
  const p = peso || weight;
  const a = altura || height;
  const e = edad || age;
  const s = sexo || sex;
  const act = actividad || activityLevel;
  const obj = objetivo || goal;

  const imc = calcularIMC(p, a);
  const tmb = calcularTMB({ peso: p, altura: a, edad: e, sexo: s });
  const calorias = calcularCaloriasDiarias(tmb, act, obj);
  const aguaMl = calcularAguaDiaria(p, act);
  if (imc == null && tmb == null) return null;
  return {
    imc,
    imcClasificacion: clasificarIMC(imc),
    tmb,
    calorias,
    aguaMl,
  };
}

function calculateMacroTargets(goal, calories) {
  if (!calories) return { protein: 0, carbs: 0, fat: 0 };

  let proteinPct, carbsPct, fatPct;
  switch (goal) {
    case "lose_weight":
      proteinPct = 0.35;
      carbsPct = 0.35;
      fatPct = 0.30;
      break;
    case "gain_muscle":
      proteinPct = 0.30;
      carbsPct = 0.45;
      fatPct = 0.25;
      break;
    case "maintain":
    default:
      proteinPct = 0.25;
      carbsPct = 0.45;
      fatPct = 0.30;
      break;
  }

  return {
    protein: Math.round((calories * proteinPct) / 4),
    carbs: Math.round((calories * carbsPct) / 4),
    fat: Math.round((calories * fatPct) / 9),
  };
}

function getMealTypeLabel(type) {
  const labels = {
    breakfast: "Desayuno",
    lunch: "Almuerzo",
    snack: "Merienda",
    dinner: "Cena",
    water: "Agua",
  };
  return labels[type] || type;
}

function formatDate(date) {
  if (typeof date === "string") {
    const d = new Date(date);
    if (isNaN(d.getTime())) return null;
    date = d;
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

module.exports = {
  calcularIMC,
  clasificarIMC,
  calcularTMB,
  calcularCaloriasDiarias,
  calcularAguaDiaria,
  calcularIndicadores,
  calculateMacroTargets,
  getMealTypeLabel,
  formatDate,
};
