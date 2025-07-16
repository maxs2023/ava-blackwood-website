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
    const { email, name = '' } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Insert data into Supabase
    const { data: supabaseData, error: supabaseError } = await supabase
      .from('subscribers')
      .insert([
        { email, name },
      ]);

    if (supabaseError) {
      console.error('Supabase error:', supabaseError);
      return res.status(500).json({ error: 'Failed to save subscriber to database' });
    }

    // Send welcome email
    const { data, error } = await resend.emails.send({
        from: 'newsletter@avablackwood.com',
        to: [email],
        subject: 'Welcome to Ava Blackwood\'s Dark Academia World',
        html: `<div>...welcome email content...</div>`, // Keeping it brief
    });

     if (error) {
        console.error('Resend welcome email error:', error);
    }

    // Send notification email to owner
    const { error: notificationError } = await resend.emails.send({
        from: 'noreply@avablackwood.com',
        to: ['contact@avablackwood.com'],
        subject: 'New Newsletter Subscriber',
        html: `<p>New subscriber: ${email}</p>`,
    });

    if (notificationError) {
        console.error('Resend notification email error:', notificationError);
    }

    return res.status(200).json({ success: true, data: supabaseData });
  } catch (error) {
    console.error('Newsletter welcome error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
