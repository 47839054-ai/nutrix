const mongoose = require("mongoose");

async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("Falta MONGO_URI en el archivo .env");
    process.exit(1);
  }
  try {
    await mongoose.connect(uri);
    console.log("MongoDB conectado:", mongoose.connection.name);
  } catch (err) {
    console.error("No se pudo conectar a MongoDB:", err.message);
    process.exit(1);
  }
}

module.exports = connectDB;
