const jwt = require("jsonwebtoken");

// Protege una ruta: exige el header "Authorization: Bearer <token>".
// Si es válido, guarda el id del usuario en req.userId para que la
// ruta lo use (por ejemplo, para buscar SUS datos y no los de otro).
function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: "No autenticado. Iniciá sesión de nuevo." });
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.userId;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Sesión inválida o vencida. Iniciá sesión de nuevo." });
  }
}

module.exports = requireAuth;
