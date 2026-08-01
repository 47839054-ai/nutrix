const mongoose = require("mongoose");

const progressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: String, required: true }, // formato "YYYY-MM-DD", igual que el prototipo original
  peso: { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model("Progress", progressSchema);
