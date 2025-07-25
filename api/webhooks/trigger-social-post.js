// Enhanced manual trigger with dual posting options
import { createClient } from '@sanity/client';

// [Copy the same DirectXPoster and EnhancedAutomatedSocialPoster classes from above]

export default async function handler(req, res) {
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
    const { 
      slug, 
      method = 'both' // 'zapier', 'direct', 'both'
    } = req.body;

    if (!slug) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameter: slug'
      });
    }

    // Determine methods based on parameter
    let useZapier = false;
    let useDirectPosting = false;

    if (method === 'zapier') {
      useZapier = true;
    } else if (method === 'direct') {
      useDirectPosting = true;
    } else if (method === 'both') {
      useZapier = true;
      useDirectPosting = true;
    }

    console.log(`📱 Manual trigger: ${slug} (method: ${method})`);

    const socialPoster = new EnhancedAutomatedSocialPoster();
    
    const result = await socialPoster.automatePost(slug, {
      useZapier,
      useDirectPosting
    });

    console.log('🚀 Manual trigger result:', JSON.stringify(result, null, 2));

    res.status(200).json({
      success: true,
      message: 'Social media post triggered successfully',
      data: result,
      methods_used: {
        zapier: useZapier,
        direct_posting: useDirectPosting,
        method: method
      }
    });

  } catch (error) {
    console.error('❌ Manual trigger error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}