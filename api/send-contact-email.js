import { Resend } from 'resend';
import { supabase } from '../../src/supabaseClient';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  // CORS headers
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

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Insert data into Supabase
    const { data: supabaseData, error: supabaseError } = await supabase
      .from('contacts')
      .insert([
        { name, email, subject, message },
      ]);

    if (supabaseError) {
      console.error('Supabase error:', supabaseError);
      return res.status(500).json({ error: 'Failed to save contact to database' });
    }

    // Send email notification
    const { data, error } = await resend.emails.send({
      from: 'contact@avablackwood.com',
      to: ['contact@avablackwood.com'],
      subject: `New Contact: ${subject}`,
      html: `<div>...email content...</div>`, // Keeping it brief for the example
    });

    if (error) {
      console.error('Resend error:', error);
      // Even if email fails, the data is in Supabase. You might not want to fail the request.
    }

    return res.status(200).json({ success: true, data: supabaseData });
  } catch (error) {
    console.error('Contact email error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
