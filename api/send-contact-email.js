import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

// --- Supabase Client Initialization ---
// Initialize the client directly inside the API route.
// Ensure SUPABASE_URL and SUPABASE_ANON_KEY are set in Vercel Environment Variables.
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// --- Resend Client Initialization ---
const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  // Set CORS headers for all responses
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

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
      console.error('Supabase Error in contact form:', supabaseError.message);
      return res.status(500).json({ error: `Database Error: ${supabaseError.message}` });
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
      console.error('Resend failed to send contact notification:', emailError);
      return res.status(500).json({ 
        error: 'Failed to send your message. Please try again.' 
      });
    }
    return res.status(200).json({ success: true, data: supabaseData });

  } catch (error) {
    console.error('Unhandled Server Error in contact form handler:', error);
    return res.status(500).json({ error: 'A server error occurred. Please check the logs.' });
  }
}
