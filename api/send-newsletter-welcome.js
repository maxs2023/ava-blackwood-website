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
    const { email, name = '' } = req.body;

    // Validate input
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // --- Step 1: Insert data into Supabase ---
    // This is the most critical step. If it fails, we stop.
    const { data: supabaseData, error: supabaseError } = await supabase
      .from('subscribers')
      .insert([{ email, name }])
      .select() // Use .select() to get the inserted data back
      .single(); // Expecting a single record

    if (supabaseError) {
      // Log the detailed error for debugging
      console.error('Supabase error:', supabaseError.message);
      // Provide a generic error to the client
      return res.status(500).json({ error: 'Failed to save subscriber to the database.' });
    }

    // --- Step 2: Send emails (Welcome and Notification) ---
    // These are secondary. We can attempt to send them even if one fails.
    const welcomeEmailPromise = resend.emails.send({
        from: 'newsletter@avablackwood.com',
        to: [email],
        subject: 'Welcome to Ava Blackwood\'s Dark Academia World',
        html: `<div>...welcome email content...</div>`, // Keeping it brief
    });

    const notificationEmailPromise = resend.emails.send({
        from: 'noreply@avablackwood.com',
        to: ['contact@avablackwood.com'],
        subject: 'New Newsletter Subscriber',
        html: `<p>New subscriber: ${email}</p>`,
    });

    // Use Promise.allSettled to wait for both emails, regardless of success or failure
    const emailResults = await Promise.allSettled([welcomeEmailPromise, notificationEmailPromise]);

    // Optional: Log any email sending failures for monitoring
    emailResults.forEach((result, index) => {
        if (result.status === 'rejected') {
            const emailType = index === 0 ? 'Welcome Email' : 'Notification Email';
            console.error(`${emailType} failed to send:`, result.reason);
        }
    });

    // --- Step 3: Return success response ---
    // The primary operation (database insert) was successful.
    return res.status(200).json({ success: true, data: supabaseData });

  } catch (error) {
    console.error('A server error occurred in newsletter handler:', error);
    return res.status(500).json({ error: 'A server error occurred. Please try again later.' });
  }
}
