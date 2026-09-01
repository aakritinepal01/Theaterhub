import nodemailer from "nodemailer";

export async function sendCredentialEmail(input: { email: string; firstName: string; username: string; temporaryPassword: string }) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER } = process.env;
  const smtpPass = process.env.SMTP_PASS || process.env.SMTP_PASSWORD;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !smtpPass) {
    throw new Error("SMTP is not configured: SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS are required");
  }
  const loginUrl = new URL("/login", process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").toString();
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: false,
    auth: {
      user: SMTP_USER,
      pass: smtpPass,
    },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  });
  const deliveryReference = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const subject = `Your TheaterHub Account Credentials - ${deliveryReference.slice(-6).toUpperCase()}`;
  const text = `THEATERHUB\n\nYour owner account is ready\n\nHello ${input.firstName},\n\nUsername: ${input.username}\nTemporary Password: ${input.temporaryPassword}\nLogin: ${loginUrl}\n\nPlease change your password after logging in.\n\nIf you did not expect this account, please contact the TheaterHub administrator.`;
  const result = await transporter.sendMail({
    from: `"TheaterHub" <${SMTP_USER}>`,
    to: input.email,
    subject,
    headers: {
      "X-Entity-Ref-ID": deliveryReference,
      "X-TheatreHub-Message": "owner-credentials",
    },
    text,
    html: `<!doctype html>
<html lang="en">
<body style="margin:0;padding:0;background:#f7f2ee;color:#2b2420;font-family:Arial,Helvetica,sans-serif">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f7f2ee;padding:32px 12px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:620px;background:#ffffff;border:1px solid #ded5cf;border-radius:18px;overflow:hidden;box-shadow:0 10px 32px rgba(43,36,32,.10)">
        <tr><td style="height:7px;background:#9d4f36;font-size:0;line-height:0">&nbsp;</td></tr>
        <tr><td style="padding:34px 38px 24px;text-align:center;background:#211b18">
          <div style="font-family:Georgia,'Times New Roman',serif;font-size:28px;font-weight:bold;color:#fff6ee;letter-spacing:.5px">TheatreHub</div>
          <div style="margin-top:8px;font-size:11px;font-weight:bold;color:#c58962;letter-spacing:3px;text-transform:uppercase">Owner Portal</div>
        </td></tr>
        <tr><td style="padding:38px 38px 16px">
          <div style="display:inline-block;padding:7px 12px;border-radius:999px;background:#f7f2ee;color:#9d4f36;font-size:11px;font-weight:bold;letter-spacing:1.5px;text-transform:uppercase">Account created</div>
          <h1 style="margin:20px 0 12px;font-family:Georgia,'Times New Roman',serif;font-size:32px;line-height:1.2;color:#2b2420">Your owner account is ready</h1>
          <p style="margin:0 0 12px;font-size:16px;line-height:1.7;color:#756b65">Hello <strong style="color:#2b2420">${escapeHtml(input.firstName)}</strong>,</p>
          <p style="margin:0;font-size:16px;line-height:1.7;color:#756b65">Welcome to TheatreHub. Use the secure temporary credentials below to access your theatre dashboard.</p>
        </td></tr>
        <tr><td style="padding:18px 38px">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f7f2ee;border:1px solid #ded5cf;border-radius:14px">
            <tr><td style="padding:22px 24px 10px;font-size:11px;font-weight:bold;color:#756b65;letter-spacing:1.4px;text-transform:uppercase">Login ID</td></tr>
            <tr><td style="padding:0 24px 20px;font-family:'Courier New',monospace;font-size:17px;font-weight:bold;color:#2b2420;word-break:break-all">${escapeHtml(input.username)}</td></tr>
            <tr><td style="padding:18px 24px 10px;border-top:1px solid #ded5cf;font-size:11px;font-weight:bold;color:#756b65;letter-spacing:1.4px;text-transform:uppercase">Temporary Password</td></tr>
            <tr><td style="padding:0 24px 22px;font-family:'Courier New',monospace;font-size:19px;font-weight:bold;color:#9d4f36;letter-spacing:.6px;word-break:break-all">${escapeHtml(input.temporaryPassword)}</td></tr>
          </table>
        </td></tr>
        <tr><td style="padding:8px 38px 22px">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#fff8f2;border-left:4px solid #c58962;border-radius:8px">
            <tr><td style="padding:17px 18px">
              <div style="font-size:12px;font-weight:bold;color:#9d4f36;letter-spacing:1px;text-transform:uppercase">Password reset required</div>
              <div style="margin-top:7px;font-size:14px;line-height:1.6;color:#756b65">Sign in with the credentials above. On your first login, TheaterHub will require you to create a new private password before opening your dashboard.</div>
            </td></tr>
          </table>
        </td></tr>
        <tr><td align="center" style="padding:4px 38px 38px">
          <a href="${escapeHtml(loginUrl)}" style="display:inline-block;background:#9d4f36;color:#ffffff;padding:14px 24px;border-radius:9px;font-size:14px;font-weight:bold;letter-spacing:.4px;text-decoration:none">Login &amp; Change Password &rarr;</a>
          <p style="margin:18px 0 0;font-size:12px;line-height:1.6;color:#756b65">If the button does not work, use:<br><a href="${escapeHtml(loginUrl)}" style="color:#9d4f36;word-break:break-all">${escapeHtml(loginUrl)}</a></p>
        </td></tr>
        <tr><td style="padding:22px 38px;background:#211b18;text-align:center;font-size:12px;line-height:1.6;color:#c4bab2">This is a secure account email from TheatreHub.<br>If you did not expect this account, contact the TheatreHub administrator.</td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  });

  const accepted = result.accepted.map(String).some(address => address.toLowerCase() === input.email.toLowerCase());
  if (!accepted || result.rejected.length > 0) {
    throw new Error(`SMTP did not accept the recipient: ${result.response || "no response"}`);
  }

  return { messageId: result.messageId, response: result.response };
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[char]!);
}

export async function sendPasswordResetCode(input: { email: string; firstName: string; code: string }) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER } = process.env;
  const smtpPass = process.env.SMTP_PASS || process.env.SMTP_PASSWORD;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !smtpPass) {
    throw new Error("SMTP is not configured: SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS are required");
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: false,
    auth: { user: SMTP_USER, pass: smtpPass },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  });

  const result = await transporter.sendMail({
    from: `"TheaterHub" <${SMTP_USER}>`,
    to: input.email,
    subject: "Your TheaterHub password verification code",
    text: `Hello ${input.firstName},\n\nYour TheaterHub verification code is: ${input.code}\n\nThis code expires in 10 minutes and can be used only once.`,
    html: `<div style="margin:0;padding:36px 12px;background:#f7f2ee;font-family:Arial,sans-serif;color:#2b2420"><div style="max-width:560px;margin:auto;background:#fff;border:1px solid #ded5cf;border-radius:18px;overflow:hidden"><div style="padding:28px;text-align:center;background:#211b18;color:#fff6ee"><div style="font:700 28px Georgia,serif">TheaterHub</div><div style="margin-top:8px;color:#c58962;font-size:11px;letter-spacing:2px">PASSWORD VERIFICATION</div></div><div style="padding:34px"><h1 style="margin:0 0 14px;font:700 27px Georgia,serif">Verify your password change</h1><p style="color:#756b65;line-height:1.7">Hello ${escapeHtml(input.firstName)}, enter this single-use code to confirm your new password:</p><div style="margin:26px 0;padding:20px;text-align:center;background:#f7f2ee;border:1px solid #ded5cf;border-radius:12px;font:700 34px 'Courier New',monospace;letter-spacing:8px;color:#9d4f36">${escapeHtml(input.code)}</div><p style="margin:0;color:#756b65;font-size:13px;line-height:1.6">This code expires in 10 minutes. Never share it with anyone.</p></div></div></div>`,
  });

  const accepted = result.accepted.map(String).some(address => address.toLowerCase() === input.email.toLowerCase());
  if (!accepted || result.rejected.length > 0) throw new Error(`SMTP did not accept the recipient: ${result.response || "no response"}`);
  return { messageId: result.messageId, response: result.response };
}
