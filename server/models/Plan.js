const mongoose = require("mongoose");

const planSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  resumen: String,
  macros: {
    calorias: Number,
    proteinas_g: Number,
    carbohidratos_g: Number,
    grasas_g: Number,
  },
  productos: [{
    nombre: String,
    categoria: String,
    motivo: String,
    tags: [String],
  }],
  recomendaciones_generales: [String],
  planComidas: [{
    tipo: String,
    calorias: Number,
    alimentos: [{
      nombre: String,
      porcion: String,
      calorias: Number,
    }],
  }],
  indicadores: {
    imc: Number,
    imcClasificacion: String,
    tmb: Number,
    calorias: Number,
    aguaMl: Number,
  },
  generadoPor: { type: String, enum: ["ia", "reglas"], default: "ia" },
  seed: Number,
  renuevaEl: Date,
}, { timestamps: true });

module.exports = mongoose.model("Plan", planSchema);
