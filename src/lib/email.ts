import nodemailer from "nodemailer";

export async function sendCredentialEmail(input: { email: string; firstName: string; username: string; temporaryPassword: string }) {
  const { SMTP_HOST, SMTP_USER, SMTP_PASSWORD } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASSWORD) throw new Error("SMTP is not configured");
  const loginUrl = new URL("/login", process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").toString();
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: { user: SMTP_USER, pass: SMTP_PASSWORD },
  });
  const text = `Hello ${input.firstName},\n\nYour TheatreHub owner account is ready.\n\nUsername: ${input.username}\nTemporary password: ${input.temporaryPassword}\nLogin: ${loginUrl}\n\nYou must set a new password when you first sign in.`;
  await transporter.sendMail({
    from: { name: "TheatreHub", address: process.env.CONTACT_EMAIL_FROM || SMTP_USER },
    to: input.email,
    subject: "Your TheatreHub login credentials",
    text,
    html: `<div style="background:#09090b;color:#eee;padding:36px;font-family:Arial,sans-serif"><div style="max-width:600px;margin:auto;background:#18181b;border:1px solid #3f3f46;border-radius:14px;padding:32px"><p style="color:#d4a853;text-transform:uppercase;letter-spacing:2px">TheatreHub</p><h1>Your owner account is ready</h1><p>Hello ${escapeHtml(input.firstName)},</p><p>Use these temporary credentials:</p><p><strong>Username:</strong> ${escapeHtml(input.username)}<br><strong>Temporary password:</strong> ${escapeHtml(input.temporaryPassword)}</p><p><a href="${loginUrl}" style="display:inline-block;background:#a21caf;color:white;padding:12px 20px;border-radius:7px;text-decoration:none">Log in to TheatreHub</a></p><p style="color:#a1a1aa">You will be required to choose a new password on first login.</p></div></div>`,
  });
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[char]!);
}
