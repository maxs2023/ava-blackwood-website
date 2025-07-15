import { Resend } from 'resend';

// Initialize Resend with API key from environment variables
const resend = new Resend(process.env.REACT_APP_RESEND_API_KEY || 'YOUR_RESEND_API_KEY_HERE');

// Contact form email service
export const sendContactEmail = async (formData) => {
  try {
    const { data, error } = await resend.emails.send({
      from: 'contact@avablackwood.com',
      to: ['contact@avablackwood.com'],
      subject: `New Contact: ${formData.subject}`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #f8f6f0;">
          <div style="background: #8B1538; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">New Contact Form Message</h1>
          </div>
          <div style="padding: 20px; background: white;">
            <p style="margin: 0 0 10px 0;"><strong>Name:</strong> ${formData.name}</p>
            <p style="margin: 0 0 10px 0;"><strong>Email:</strong> ${formData.email}</p>
            <p style="margin: 0 0 20px 0;"><strong>Subject:</strong> ${formData.subject}</p>
            <div style="margin: 20px 0;">
              <strong>Message:</strong>
              <div style="background: #f8f6f0; padding: 15px; border-left: 4px solid #D4AF37; margin-top: 10px; white-space: pre-wrap;">
${formData.message}
              </div>
            </div>
          </div>
          <div style="background: #2C2C2C; color: white; padding: 10px; text-align: center; font-size: 12px;">
            Sent from avablackwood.com contact form
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      throw new Error(error.message);
    }

    return { success: true, data };
  } catch (error) {
    console.error('Contact email failed:', error);
    return { success: false, error: error.message };
  }
};

// Newsletter welcome email service
export const sendNewsletterWelcome = async (email, name = '') => {
  try {
    const { data, error } = await resend.emails.send({
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
              <a href="https://www.avablackwood.com/books" style="background: #D4AF37; color: #1A1A1A; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Explore My Books</a>
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

    if (error) {
      console.error('Resend error:', error);
      throw new Error(error.message);
    }

    return { success: true, data };
  } catch (error) {
    console.error('Newsletter welcome failed:', error);
    return { success: false, error: error.message };
  }
};

// Book launch announcement email
export const sendBookLaunchEmail = async (subscriberList, bookInfo) => {
  try {
    const emailPromises = subscriberList.map(subscriber => 
      resend.emails.send({
        from: 'books@avablackwood.com',
        to: [subscriber.email],
        subject: `🎉 NEW RELEASE: ${bookInfo.title} is now available!`,
        html: `
          <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #f8f6f0;">
            <div style="background: #8B1538; color: white; padding: 30px; text-align: center;">
              <h1 style="margin: 0;">New Book Release! 📚</h1>
              <h2 style="color: #D4AF37; margin: 10px 0;">${bookInfo.title}</h2>
            </div>
            
            <div style="padding: 30px; background: white;">
              <div style="text-align: center; margin-bottom: 20px;">
                <img src="${bookInfo.coverUrl}" alt="${bookInfo.title}" style="max-width: 200px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.2);">
              </div>
              
              <p>Dear ${subscriber.name || 'Reader'},</p>
              
              <p>I'm thrilled to announce that my latest dark academia romance, <strong>${bookInfo.title}</strong>, is now available!</p>
              
              <div style="background: #f8f6f0; padding: 20px; border-left: 4px solid #D4AF37; margin: 20px 0;">
                <p style="font-style: italic; margin: 0;">${bookInfo.description}</p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${bookInfo.amazonUrl}" style="background: #D4AF37; color: #1A1A1A; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; margin: 0 10px 10px 0;">Get on Amazon</a>
                <a href="https://www.avablackwood.com/books" style="background: #8B1538; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">View All Books</a>
              </div>
              
              <p>Thank you for being part of this journey. Your support means everything to me.</p>
              
              <p>Happy reading!<br><strong>Ava</strong></p>
            </div>
          </div>
        `,
      })
    );

    const results = await Promise.all(emailPromises);
    return { success: true, sent: results.length };
  } catch (error) {
    console.error('Book launch email failed:', error);
    return { success: false, error: error.message };
  }
};

// Utility function to validate email format
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Utility function to sanitize form input
export const sanitizeInput = (input) => {
  return input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
              .replace(/[<>]/g, '');
};

