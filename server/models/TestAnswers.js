const mongoose = require("mongoose");

const testAnswersSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  edad: Number,
  sexo: String,
  peso: Number,
  altura: Number,
  actividad: { type: String, default: "moderado" },
  objetivo: { type: String, default: "salud" },
  tipoAlimentacion: { type: String, default: "Omnivoro" },
  restricciones: { type: [String], default: [] },
  preferenciasNoComer: { type: [String], default: [] },
  condiciones: { type: String, default: "" },
}, { timestamps: true });

module.exports = mongoose.model("TestAnswers", testAnswersSchema);
