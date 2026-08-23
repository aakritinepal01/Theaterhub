import nodemailer from "nodemailer";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type ContactSubmission = {
  name?: string;
  email?: string;
  subject?: string;
  organisation?: string;
  phone?: string;
  message?: string;
};

const clean = (value: unknown) => String(value ?? "").trim();
const escapeHtml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#039;");

function fieldValue(label: string, submission: ContactSubmission) {
  switch (label.trim().toLowerCase()) {
    case "name":
      return clean(submission.name);
    case "email":
      return clean(submission.email);
    case "phone":
      // The legacy form requires this field, but the current contact page does not ask for it.
      return clean(submission.phone) || "Not provided";
    case "message":
      return [
        `Topic: ${clean(submission.subject)}`,
        clean(submission.organisation) && `Theatre / Group: ${clean(submission.organisation)}`,
        "",
        clean(submission.message),
      ]
        .filter(Boolean)
        .join("\n");
    default:
      return "";
  }
}

async function sendContactEmail(form: { sendEmail: boolean; emailCopies: string }, submission: ContactSubmission) {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const password = process.env.SMTP_PASSWORD;
  const recipient = process.env.CONTACT_EMAIL_TO || form.emailCopies;
  const senderName = process.env.CONTACT_EMAIL_SENDER_NAME || "TheatreHub";

  if (!form.sendEmail || !host || !user || !password || !recipient) return false;

  const transporter = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: { user, pass: password },
  });

  const name = clean(submission.name);
  const email = clean(submission.email);
  const subject = clean(submission.subject) || "New message";
  const organisation = clean(submission.organisation) || "Not provided";
  const message = clean(submission.message);
  const replyUrl = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(`Re: ${subject}`)}`;

  await transporter.sendMail({
    from: {
      name: senderName,
      address: process.env.CONTACT_EMAIL_FROM || user,
    },
    to: recipient,
    replyTo: email,
    subject: `[TheatreHub] ${subject} — ${name}`,
    text: [
      `New TheatreHub contact message`,
      "",
      `Name: ${name}`,
      `Email: ${email}`,
      `Topic: ${subject}`,
      `Theatre / Group: ${organisation}`,
      "",
      message,
    ].join("\n"),
    html: `
      <div style="margin:0;padding:32px 16px;background:#f7f2ee;color:#2b2420;font-family:Arial,sans-serif;">
        <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #ded5cf;border-radius:16px;overflow:hidden;">
          <div style="padding:24px 28px;background:#9d4f36;color:#ffffff;">
            <p style="margin:0 0 6px;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;">TheatreHub</p>
            <h1 style="margin:0;font-size:24px;line-height:1.2;">New contact message</h1>
          </div>
          <div style="padding:28px;">
            <p style="margin:0 0 22px;color:#756b65;line-height:1.6;">Someone has sent a message through the TheatreHub contact page.</p>
            <table role="presentation" style="width:100%;border-collapse:collapse;margin:0 0 24px;">
              <tr><td style="padding:10px 0;border-bottom:1px solid #eee6e1;color:#756b65;width:130px;">From</td><td style="padding:10px 0;border-bottom:1px solid #eee6e1;font-weight:700;">${escapeHtml(name)}</td></tr>
              <tr><td style="padding:10px 0;border-bottom:1px solid #eee6e1;color:#756b65;">Email</td><td style="padding:10px 0;border-bottom:1px solid #eee6e1;"><a href="mailto:${encodeURIComponent(email)}" style="color:#9d4f36;">${escapeHtml(email)}</a></td></tr>
              <tr><td style="padding:10px 0;border-bottom:1px solid #eee6e1;color:#756b65;">Topic</td><td style="padding:10px 0;border-bottom:1px solid #eee6e1;font-weight:700;">${escapeHtml(subject)}</td></tr>
              <tr><td style="padding:10px 0;color:#756b65;">Theatre / Group</td><td style="padding:10px 0;">${escapeHtml(organisation)}</td></tr>
            </table>
            <div style="padding:18px 20px;background:#f7f2ee;border-left:4px solid #c58962;border-radius:4px;white-space:pre-wrap;line-height:1.65;">${escapeHtml(message)}</div>
            <p style="margin:28px 0 0;"><a href="${replyUrl}" style="display:inline-block;padding:12px 18px;background:#9d4f36;border-radius:6px;color:#ffffff;font-weight:700;text-decoration:none;">Reply to ${escapeHtml(name)}</a></p>
          </div>
        </div>
      </div>`,
  });

  return true;
}

export async function POST(request: Request) {
  try {
    const submission = (await request.json()) as ContactSubmission;
    const name = clean(submission.name);
    const email = clean(submission.email);
    const subject = clean(submission.subject);
    const message = clean(submission.message);

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: "Please complete all required fields." }, { status: 400 });
    }

    const form = await prisma.form.findFirst({ include: { fields: true } });
    if (!form) {
      return NextResponse.json({ error: "Contact form is unavailable." }, { status: 503 });
    }

    const values = form.fields.map((field) => ({ fieldId: field.id, value: fieldValue(field.label, submission) }));
    const missingField = form.fields.find(
      (field) => field.required && !values.find((value) => value.fieldId === field.id)?.value
    );
    if (missingField) {
      return NextResponse.json({ error: `${missingField.label} is required.` }, { status: 400 });
    }

    const [latestEntry, latestValue] = await Promise.all([
      prisma.formEntry.aggregate({ _max: { id: true } }),
      prisma.formFieldEntry.aggregate({ _max: { id: true } }),
    ]);
    const entryId = (latestEntry._max.id ?? 0) + 1;
    const firstValueId = (latestValue._max.id ?? 0) + 1;

    await prisma.$transaction([
      prisma.formEntry.create({ data: { id: entryId, formId: form.id, entryTime: new Date() } }),
      prisma.formFieldEntry.createMany({
        data: values.map((value, index) => ({
          id: firstValueId + index,
          entryId,
          fieldId: value.fieldId,
          value: value.value,
        })),
      }),
    ]);

    const emailSent = await sendContactEmail(form, submission).catch((error) => {
      console.error("Contact form email delivery failed:", error);
      return false;
    });

    return NextResponse.json({ ok: true, emailSent });
  } catch (error) {
    console.error("Contact form submission failed:", error);
    return NextResponse.json({ error: "Unable to submit the contact form." }, { status: 500 });
  }
}
