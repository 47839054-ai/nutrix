const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");
const { sendPasswordResetEmail } = require("../utils/email");

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

async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: "La contraseña nueva debe tener al menos 6 caracteres." });
    }
    if (newPassword.length > 72) {
      return res.status(400).json({ error: "La contraseña es demasiado larga." });
    }

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "Usuario no encontrado." });

    // Si la cuenta no tiene contraseña (registrada con Google), se puede
    // fijar una sin pedir la actual.
    if (user.passwordHash) {
      if (!currentPassword) {
        return res.status(400).json({ error: "Ingresá tu contraseña actual." });
      }
      const ok = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!ok) {
        return res.status(401).json({ error: "La contraseña actual es incorrecta." });
      }
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Contraseña actualizada correctamente." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error del servidor al cambiar la contraseña." });
  }
}

async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Ingresá tu email." });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    // Siempre respondemos lo mismo para no revelar si el email existe.
    if (user) {
      const code = crypto.randomInt(100000, 1000000).toString();
      user.resetPasswordCode = await bcrypt.hash(code, 10);
      user.resetPasswordExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 min
      await user.save();
      try {
        await sendPasswordResetEmail(user.email, code);
      } catch (err) {
        console.error("Error enviando email:", err);
        return res.status(500).json({ error: "No se pudo enviar el email. Intentá de nuevo." });
      }
    }

    res.json({
      message: "Si el email está registrado, te enviamos un código para restablecer la contraseña.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error del servidor al enviar el código." });
  }
}

async function resetPassword(req, res) {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code) {
      return res.status(400).json({ error: "Faltan datos para restablecer la contraseña." });
    }
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: "La contraseña nueva debe tener al menos 6 caracteres." });
    }
    if (newPassword.length > 72) {
      return res.status(400).json({ error: "La contraseña es demasiado larga." });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (
      !user ||
      !user.resetPasswordCode ||
      !user.resetPasswordExpires ||
      new Date(user.resetPasswordExpires).getTime() < Date.now()
    ) {
      return res.status(400).json({ error: "El código no es válido o ya expiró." });
    }

    const ok = await bcrypt.compare(code, user.resetPasswordCode);
    if (!ok) {
      return res.status(400).json({ error: "El código no es válido o ya expiró." });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    user.resetPasswordCode = "";
    user.resetPasswordExpires = null;
    await user.save();

    res.json({ message: "Contraseña restablecida correctamente. Ya podés iniciar sesión." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error del servidor al restablecer la contraseña." });
  }
}

module.exports = {
  register,
  login,
  googleLogin,
  getProfile,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
};
