// api/webhooks/blog-published.js
import AutomatedSocialPoster from '../../src/automation/AutomatedSocialPoster.js';

export default async function handler(req, res) {
  // Set CORS headers
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
    const { _type, slug, title } = req.body;
    
    // Verify this is a blog post publication
    if (_type !== 'post' || !slug?.current) {
      return res.status(400).json({
        success: false,
        error: 'Invalid webhook data - not a blog post'
      });
    }

    console.log(`📝 New blog post published: ${title} (${slug.current})`);

    // Initialize the social poster
    const socialPoster = new AutomatedSocialPoster();

    // Trigger automated posting
    const result = await socialPoster.automatePost({
      useZapier: true,           // Send to your Zapier workflow
      useDirectPosting: false,   // Set to true if you want direct posting
      platforms: ['twitter'],    // Platforms for direct posting
      slug: slug.current
    });

    console.log('🚀 Automation result:', result);

    res.json({
      success: true,
      message: 'Social media automation triggered',
      data: result
    });

  } catch (error) {
    console.error('❌ Webhook error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}