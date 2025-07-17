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
    const { email, name = '' } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // --- Step 1: Insert data into Supabase ---
    const { data: supabaseData, error: supabaseError } = await supabase
      .from('subscribers')
      .insert([{ email, name }])
      .select()
      .single();

    if (supabaseError) {
      console.error('Supabase Error:', supabaseError.message);
      return res.status(500).json({ error: `Database Error: ${supabaseError.message}` });
    }

    // --- Step 2: Send emails ---
    const welcomeEmailPromise = resend.emails.send({
        from: 'newsletter@avablackwood.com',
        to: [email],
        subject: 'Welcome to Ava Blackwood\'s Dark Academia World',
        html: `<div>...welcome email content...</div>`,
    });

    const notificationEmailPromise = resend.emails.send({
        from: 'noreply@avablackwood.com',
        to: ['contact@avablackwood.com'],
        subject: 'New Newsletter Subscriber',
        html: `<p>New subscriber: ${email}</p>`,
    });

    await Promise.allSettled([welcomeEmailPromise, notificationEmailPromise]);

    // --- Step 3: Return success response ---
    return res.status(200).json({ success: true, data: supabaseData });

  } catch (error) {
    console.error('Unhandled Server Error in newsletter handler:', error);
    return res.status(500).json({ error: 'A server error occurred. Please check the logs.' });
  }
}
