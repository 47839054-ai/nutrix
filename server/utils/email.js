const nodemailer = require("nodemailer");

// Transporte SMTP opcional. Si no hay SMTP configurado (desarrollo),
// el código de recuperación se muestra por consola.
let transporter = null;

if (process.env.SMTP_HOST) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

const MAIL_FROM = process.env.MAIL_FROM || "Nutrix <no-reply@nutrix.app>";

async function sendPasswordResetEmail(to, code) {
  const subject = "Nutrix - Tu código para restablecer la contraseña";
  const text = [
    `Hola!`,
    ``,
    `Recibimos una solicitud para restablecer tu contraseña de Nutrix.`,
    `Tu código es: ${code}`,
    ``,
    `Ingresá este código en la app dentro de los próximos 30 minutos.`,
    `Si no fuiste vos, podés ignorar este mensaje.`,
  ].join("\n");

  if (transporter) {
    await transporter.sendMail({ from: MAIL_FROM, to, subject, text });
  } else {
    console.log(`[DEV] Código de recuperación para ${to}: ${code}`);
  }
}

module.exports = { sendPasswordResetEmail };
