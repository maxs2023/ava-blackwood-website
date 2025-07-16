import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, subject, message } = req.body;

    // Validate input
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: 'contact@avablackwood.com',
      to: ['contact@avablackwood.com'],
      subject: `New Contact: ${subject}`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #F8F6F0;">
          <div style="background: #8B1538; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">New Contact Form Message</h1>
          </div>
          <div style="padding: 20px; background: white;">
            <p style="margin: 0 0 10px 0;"><strong>Name:</strong> ${name}</p>
            <p style="margin: 0 0 10px 0;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 0 0 10px 0;"><strong>Subject:</strong> ${subject}</p>
            <div style="margin: 20px 0;">
              <strong>Message:</strong>
              <div style="background: #f8f6f0; padding: 15px; border-left: 4px solid #8B1538; margin-top: 10px;">
                ${message}
              </div>
            </div>
          </div>
          <div style="background: #2C2C2C; color: white; padding: 10px; text-align: center;">
            <p style="margin: 0;">Sent from avablackwood.com contact form</p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(500).json({ error: 'Failed to send email' });
    }

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Contact email error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}