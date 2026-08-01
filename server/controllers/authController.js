const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

function signToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "30d" });
}

async function register(req, res) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Completá todos los campos obligatorios." });
    }

    const existe = await User.findOne({ email: email.toLowerCase() });
    if (existe) {
      return res.status(409).json({ error: "Ya existe una cuenta con ese email." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash });

    const token = signToken(user._id);
    res.status(201).json({ token, profile: user.toSafeJSON() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error del servidor al registrar." });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Completá todos los campos." });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: "Email o contraseña incorrectos." });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ error: "Email o contraseña incorrectos." });
    }

    const token = signToken(user._id);
    res.json({ token, profile: user.toSafeJSON() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error del servidor al iniciar sesión." });
  }
}

async function googleLogin(req, res) {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ error: "Token de Google no proporcionado." });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    let user = await User.findOne({ $or: [{ googleId }, { email: email.toLowerCase() }] });

    if (user) {
      user.googleId = googleId;
      if (picture && !user.avatar) user.avatar = picture;
      if (name && !user.name) user.name = name;
      await user.save();
    } else {
      user = await User.create({
        name: name || "Usuario",
        email: email.toLowerCase(),
        googleId,
        avatar: picture || "",
        passwordHash: "",
      });
    }

    const token = signToken(user._id);
    res.json({ token, profile: user.toSafeJSON() });
  } catch (err) {
    console.error("Google auth error:", err);
    res.status(401).json({ error: "Error al autenticar con Google." });
  }
}

async function getProfile(req, res) {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "Usuario no encontrado." });
    res.json({ profile: user.toSafeJSON() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error del servidor al obtener perfil." });
  }
}

async function updateProfile(req, res) {
  try {
    const allowedFields = [
      "name",
      "age",
      "sex",
      "height",
      "weight",
      "targetWeight",
      "activityLevel",
      "goal",
      "dailyWaterGoal",
      "avatar",
    ];
    const update = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        update[field] = req.body[field];
      }
    }

    if (Object.keys(update).length === 0) {
      return res.status(400).json({ error: "No se enviaron campos para actualizar." });
    }

    const user = await User.findByIdAndUpdate(req.userId, update, {
      new: true,
      runValidators: true,
    });
    if (!user) return res.status(404).json({ error: "Usuario no encontrado." });

    res.json({ profile: user.toSafeJSON() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error del servidor al actualizar perfil." });
  }
}

module.exports = { register, login, googleLogin, getProfile, updateProfile };
