const Anthropic = require("@anthropic-ai/sdk");

const SYSTEM_PROMPT = `Sos el motor de recomendaciones nutricionales de la app Nutrix. Vas a recibir el perfil de salud y habitos de un usuario en JSON. Devolve SOLO un JSON valido, sin texto adicional, sin markdown, con esta forma exacta:

{
  "resumen": "2 frases sobre el enfoque del plan",
  "macros": {
    "calorias": numero,
    "proteinas_g": numero,
    "carbohidratos_g": numero,
    "grasas_g": numero
  },
  "productos": [
    {
      "nombre": "nombre del producto",
      "categoria": "proteina/cereales/verduras/etc",
      "motivo": "frase breve de por que este producto",
      "tags": ["vegano", "sin TACC", "apto diabeticos", etc]
    }
  ],
  "recomendaciones_generales": [
    "recomendacion 1",
    "recomendacion 2",
    "recomendacion 3"
  ],
  "planComidas": [
    {
      "tipo": "Desayuno/Almuerzo/Merienda/Cena",
      "calorias": numero,
      "alimentos": [
        {
          "nombre": "nombre del alimento",
          "porcion": "cantidad y unidad",
          "calorias": numero
        }
      ]
    }
  ]
}

Reglas:
- Inclui entre 7 y 8 productos, variados y realistas para comprar en supermercado o dietetica en Argentina.
- El plan de comidas debe tener 4 comidas (Desayuno, Almuerzo, Merienda, Cena).
- Las calorias totales de las 4 comidas deben sumar aproximadamente las calorias del plan.
- Distribui las calorias: Desayuno ~25%, Almuerzo ~35%, Merienda ~15%, Cena ~25%.
- Respetá las restricciones alimentarias, tipo de alimentación (vegano/vegetariano/omnivoro) y preferencias de comidas a evitar.
- Si el usuario tiene condiciones de salud, inclui recomendaciones especificas.
- No agregues nada fuera del JSON.`;

async function generarPlanConIA(perfil, seed = 0) {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("No hay API key de Anthropic configurada.");
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const perfilConInstruccion = {
    ...perfil,
    instruccion_rotacion: `Esta es la variante ${seed % 4} del plan (el plan se rota cada 3 días para que la persona no se aburra de comer siempre lo mismo). Proponé comidas, alimentos y productos DISTINTOS a los de otras variantes, manteniendo siempre las restricciones, el tipo de alimentación y el objetivo.`,
  };

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: JSON.stringify(perfilConInstruccion) }],
  });

  const text = response.content[0].text;

  // Limpiar posibles fences de markdown
  const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
  return JSON.parse(cleaned);
}

module.exports = { generarPlanConIA };
