import { Resend } from 'resend';
import { supabase } from '../src/supabaseClient';

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
    // --- Enhanced Logging: Check for environment variables ---
    console.log("Newsletter function started.");
    if (!process.env.RESEND_API_KEY) {
        console.error("Server Error: RESEND_API_KEY is not set.");
    }
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
        console.error("Server Error: Supabase environment variables are not set.");
    }
    if (!supabase) {
        console.error("Server Error: Supabase client failed to initialize.");
    }

    const { email, name = '' } = req.body;

    // Validate input
    if (!email) {
      console.log("Validation failed: Email is required.");
      return res.status(400).json({ error: 'Email is required' });
    }

    // --- Step 1: Insert data into Supabase ---
    console.log(`Attempting to insert email: ${email} into 'subscribers' table.`);
    const { data: supabaseData, error: supabaseError } = await supabase
      .from('subscribers')
      .insert([{ email, name }])
      .select()
      .single();

    if (supabaseError) {
      console.error('Supabase Error:', supabaseError.message);
      return res.status(500).json({ error: `Database Error: ${supabaseError.message}` });
    }
    console.log("Successfully inserted into Supabase.");

    // --- Step 2: Send emails (Welcome and Notification) ---
    console.log("Attempting to send emails...");
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

    const emailResults = await Promise.allSettled([welcomeEmailPromise, notificationEmailPromise]);
    console.log("Email sending process completed.");

    emailResults.forEach((result, index) => {
        if (result.status === 'rejected') {
            const emailType = index === 0 ? 'Welcome Email' : 'Notification Email';
            console.error(`${emailType} failed to send:`, result.reason);
        }
    });

    // --- Step 3: Return success response ---
    console.log("Function finished successfully. Sending 200 response.");
    return res.status(200).json({ success: true, data: supabaseData });

  } catch (error) {
    console.error('Unhandled Server Error in newsletter handler:', error);
    return res.status(500).json({ error: 'A server error occurred. Please check the logs.' });
  }
}
