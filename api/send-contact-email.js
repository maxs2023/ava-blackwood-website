import { Resend } from 'resend';
import { supabase } from '../../src/supabaseClient';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  // Set CORS headers for all responses
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Ensure the request method is POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { name, email, subject, message } = req.body;

    // Validate input
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // --- Step 1: Insert data into Supabase 'contacts' table ---
    const { data: supabaseData, error: supabaseError } = await supabase
      .from('contacts')
      .insert([{ name, email, subject, message }])
      .select()
      .single();

    if (supabaseError) {
      console.error('Supabase error in contact form:', supabaseError.message);
      return res.status(500).json({ error: 'Failed to save contact message to the database.' });
    }

    // --- Step 2: Send email notification ---
    // This is a secondary action. We'll still return success even if this fails.
    try {
      await resend.emails.send({
        from: 'contact@avablackwood.com',
        to: ['contact@avablackwood.com'],
        subject: `New Contact Form Message: ${subject}`,
        reply_to: email,
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
                  <p style="margin:0;">${message}</p>
                </div>
              </div>
            </div>
          </div>
        `,
      });
    } catch (emailError) {
      // Log the email error for monitoring but don't fail the request
      console.error('Resend failed to send contact notification:', emailError);
    }

    // --- Step 3: Return success response ---
    return res.status(200).json({ success: true, data: supabaseData });

  } catch (error) {
    console.error('A server error occurred in contact form handler:', error);
    return res.status(500).json({ error: 'A server error occurred. Please try again later.' });
  }
}
