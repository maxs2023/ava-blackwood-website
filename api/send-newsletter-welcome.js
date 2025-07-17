import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

// --- Supabase Client Initialization ---
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
      // --- Handle duplicate email error ---
      // PostgreSQL error code '23505' is for unique_violation
      if (supabaseError.code === '23505') {
        console.log('Duplicate email subscription attempt:', email);
        // Return a 409 Conflict status
        return res.status(409).json({ error: 'This email address is already subscribed.' });
      }

      // For any other database error, return a 500
      console.error('Supabase Error:', supabaseError.message);
      return res.status(500).json({ error: `Database Error: ${supabaseError.message}` });
    }

    // --- Step 2: Send emails ---
    const welcomeEmailPromise = resend.emails.send({
        from: 'newsletter@avablackwood.com',
        to: [email],
        subject: 'Welcome to the Dark Academia Circle! 📚',
        html: `
          <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #f8f6f0;">
            <div style="background: linear-gradient(135deg, #8B1538 0%, #6B1129 100%); color: white; padding: 30px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px;">Welcome to the Dark Academia Circle!</h1>
              <p style="margin: 10px 0 0 0; color: #D4AF37; font-size: 16px;">Where forbidden knowledge meets passionate romance</p>
            </div>
            
            <div style="padding: 30px; background: white; margin: 0;">
              <p style="font-size: 16px; line-height: 1.6;">Dear ${name || 'Fellow Scholar'},</p>
              
              <p style="font-size: 16px; line-height: 1.6;">Welcome to my inner circle of dark academia enthusiasts! I'm thrilled you've decided to join this exclusive community where we explore the shadows between knowledge and desire.</p>
              
              <div style="background: #f8f6f0; padding: 20px; border-left: 4px solid #8B1538; margin: 20px 0;">
                <h3 style="color: #8B1538; margin-top: 0;">As a subscriber, you'll receive:</h3>
                <ul style="line-height: 1.8;">
                  <li><strong>Early access</strong> to new book announcements and pre-orders</li>
                  <li><strong>Exclusive content</strong> including deleted scenes and character insights</li>
                  <li><strong>Behind-the-scenes</strong> glimpses into my writing process</li>
                  <li><strong>Special promotions</strong> and subscriber-only discounts</li>
                  <li><strong>Dark academia inspiration</strong> - books, aesthetics, and more</li>
                </ul>
              </div>
              
              <p style="font-size: 16px; line-height: 1.6;">I believe in the power of stories to transport us to worlds where intellect and passion collide, where ancient libraries hold secrets, and where forbidden love blooms in the shadows of academia.</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://www.avablackwood.com" style="background: #D4AF37; color: #1A1A1A; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Explore My Books</a>
              </div>
              
              <p style="font-size: 16px; line-height: 1.6;">Thank you for joining me on this journey through the darker corridors of romance.</p>
              
              <p style="font-size: 16px; line-height: 1.6;">Yours in literary darkness,<br>
              <strong style="color: #8B1538;">Ava Blackwood</strong></p>
            </div>
            
            <div style="background: #2C2C2C; color: #D1CFC7; padding: 20px; text-align: center; font-size: 12px;">
              <p style="margin: 0;">You're receiving this because you subscribed at <a href="https://www.avablackwood.com" style="color: #D4AF37;">avablackwood.com</a></p>
              <p style="margin: 5px 0 0 0;">Ava Blackwood • Dark Academia Romance Author</p>
            </div>
          </div>
        `,
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
