import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// All contact form submissions route here
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers for the SPA
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, subject, message } = req.body || {};

  // Validation
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email address.' });
  }

  try {
    await resend.emails.send({
      from: 'DEFRAG <info@defrag.app>',
      to: ['chadowen93@gmail.com'],
      replyTo: email,
      subject: `[DEFRAG Contact] ${subject || 'New message'}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px; background: #0a0a0a; color: #e5e5e5; border-radius: 12px;">
          <div style="border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 16px; margin-bottom: 24px;">
            <span style="font-size: 10px; font-weight: 600; letter-spacing: 0.2em; text-transform: uppercase; color: #737373;">Incoming Signal</span>
          </div>
          <p style="margin: 0 0 4px; font-size: 11px; color: #737373; text-transform: uppercase; letter-spacing: 0.1em;">From</p>
          <p style="margin: 0 0 20px; font-size: 15px; color: #fafafa;">${name} &lt;${email}&gt;</p>
          <p style="margin: 0 0 4px; font-size: 11px; color: #737373; text-transform: uppercase; letter-spacing: 0.1em;">Subject</p>
          <p style="margin: 0 0 20px; font-size: 15px; color: #fafafa;">${subject || '—'}</p>
          <p style="margin: 0 0 4px; font-size: 11px; color: #737373; text-transform: uppercase; letter-spacing: 0.1em;">Message</p>
          <div style="margin: 0; padding: 16px; background: rgba(255,255,255,0.03); border-radius: 8px; border: 1px solid rgba(255,255,255,0.06);">
            <p style="margin: 0; font-size: 14px; line-height: 1.7; color: #d4d4d4; white-space: pre-wrap;">${message}</p>
          </div>
          <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.06);">
            <span style="font-size: 10px; color: #525252;">DEFRAG — The Operating System of the Self</span>
          </div>
        </div>
      `,
    });

    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('Resend error:', error);
    return res.status(500).json({ error: 'Failed to send message. Try again shortly.' });
  }
}
