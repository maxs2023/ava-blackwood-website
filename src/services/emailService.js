// Client-side email service that calls Vercel API functions

export const sendContactEmail = async (formData) => {
  try {
    const response = await fetch('/api/send-contact-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to send email');
    }

    return { success: true, data: result.data };
  } catch (error) {
    console.error('Contact email failed:', error);
    return { success: false, error: error.message };
  }
};

export const sendNewsletterWelcome = async (email, name = '') => {
  try {
    const response = await fetch('/api/send-newsletter-welcome', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, name }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to send welcome email');
    }

    return { success: true, data: result.data };
  } catch (error) {
    console.error('Newsletter welcome failed:', error);
    return { success: false, error: error.message };
  }
};

// Utility functions
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return '';
  return input.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
};