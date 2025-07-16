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
    const { email, name = '' } = req.body;

    // Validate input
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // --- Action 1: Send the welcome email to the new subscriber ---
    const sendWelcomeEmail = resend.emails.send({
      from: 'newsletter@avablackwood.com',
      to: [email],
      subject: 'Welcome to Ava Blackwood\'s Dark Academia World',
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #F8F6F0;">
          <div style="background: #8B1538; color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">Welcome to My World</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">Dark Academia Romance by Ava Blackwood</p>
          </div>
          <div style="padding: 30px; background: white;">
            <p style="font-size: 18px; margin: 0 0 20px 0;">Dear ${name || 'Reader'},</p>
            <p style="margin: 0 0 15px 0; line-height: 1.6;">Welcome to my newsletter! I'm thrilled you've joined our community of dark academia romance enthusiasts.</p>
            <p style="margin: 0 0 15px 0; line-height: 1.6;">As a subscriber, you'll be the first to know about:</p>
            <ul style="margin: 0 0 20px 20px; line-height: 1.6;">
              <li>New book releases and exclusive previews</li>
              <li>Behind-the-scenes writing insights</li>
              <li>Character development and world-building secrets</li>
              <li>Special promotions and early access</li>
            </ul>
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://www.avablackwood.com/books" style="background: #8B1538; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Discover My Books</a>
            </div>
          </div>
          <div style="background: #2C2C2C; color: white; padding: 20px; text-align: center;">
            <p style="margin: 0 0 10px 0;">Follow me for more dark academia romance:</p>
            <p style="margin: 0; font-size: 14px;">www.avablackwood.com | newsletter@avablackwood.com</p>
          </div>
        </div>
      `,
    });

    // --- Action 2: Send a notification email to the website owner ---
    const sendNotificationEmail = resend.emails.send({
        from: 'noreply@avablackwood.com',
        to: ['newsletter@avablackwood.com'], // Your email address
        subject: 'New Newsletter Subscriber',
        html: `
            <div style="font-family: sans-serif; padding: 20px;">
                <h2>New Newsletter Subscriber</h2>
                <p>A new user has subscribed to your newsletter:</p>
                <p><strong>Email:</strong> ${email}</p>
            </div>
        `,
    });

    // Wait for both emails to be sent
    const [welcomeResult, notificationResult] = await Promise.all([sendWelcomeEmail, sendNotificationEmail]);

    if (welcomeResult.error) {
        console.error('Resend welcome email error:', welcomeResult.error);
        // Decide if you still want to return an error to the user if only the notification fails
        return res.status(500).json({ error: 'Failed to send welcome email' });
    }
    if (notificationResult.error) {
        // Log the error but don't block the user's success message
        console.error('Resend notification email error:', notificationResult.error);
    }

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('Newsletter handler error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
