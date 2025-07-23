// api/webhooks/trigger-social-post.js
import AutomatedSocialPoster from '../../src/automation/AutomatedSocialPoster.js';

export default async function handler(req, res) {
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
    const { slug, useZapier = true, useDirectPosting = false, platforms = ['twitter'] } = req.body;

    const socialPoster = new AutomatedSocialPoster();
    
    const result = await socialPoster.automatePost({
      useZapier,
      useDirectPosting,
      platforms,
      slug
    });

    res.json({
      success: true,
      message: 'Social media post triggered',
      data: result
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}