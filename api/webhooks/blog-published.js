// Enhanced blog-published webhook with dual posting
import { createClient } from '@sanity/client';
import crypto from 'crypto';

const sanityClient = createClient({
  projectId: process.env.SANITY_PROJECT_ID || '8vo1vk23',
  dataset: 'production',
  apiVersion: '2025-07-17',
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
});

// Direct X Poster with OAuth 1.0a

// Direct X Poster with improved OAuth 1.0a for X API v2
class DirectXPoster {
  constructor() {
    this.apiKey = process.env.X_API_KEY;
    this.apiSecret = process.env.X_API_SECRET;
    this.accessToken = process.env.X_ACCESS_TOKEN;
    this.accessTokenSecret = process.env.X_ACCESS_TOKEN_SECRET;
  }

  // Generate OAuth 1.0a signature (improved for X API v2)
  generateOAuthSignature(method, url, oauthParams) {
    // Sort OAuth parameters only (no JSON body for X API v2)
    const sortedParams = Object.keys(oauthParams)
      .sort()
      .map(key => `${this.percentEncode(key)}=${this.percentEncode(oauthParams[key])}`)
      .join('&');

    // Create signature base string
    const signatureBaseString = [
      method.toUpperCase(),
      this.percentEncode(url),
      this.percentEncode(sortedParams)
    ].join('&');

    console.log('🔐 OAuth signature base string:', signatureBaseString);

    // Create signing key
    const signingKey = `${this.percentEncode(this.apiSecret)}&${this.percentEncode(this.accessTokenSecret)}`;

    // Generate signature
    const signature = crypto
      .createHmac('sha1', signingKey)
      .update(signatureBaseString)
      .digest('base64');

    return signature;
  }

  // Proper percent encoding for OAuth
  percentEncode(str) {
    return encodeURIComponent(str)
      .replace(/!/g, '%21')
      .replace(/'/g, '%27')
      .replace(/\(/g, '%28')
      .replace(/\)/g, '%29')
      .replace(/\*/g, '%2A');
  }

  // Generate OAuth 1.0a header (X API v2 compatible)
  generateOAuthHeader(method, url) {
    const timestamp = Math.floor(Date.now() / 1000);
    const nonce = crypto.randomBytes(16).toString('hex');

    // OAuth parameters only (no JSON body content)
    const oauthParams = {
      oauth_consumer_key: this.apiKey,
      oauth_nonce: nonce,
      oauth_signature_method: 'HMAC-SHA1',
      oauth_timestamp: timestamp.toString(),
      oauth_token: this.accessToken,
      oauth_version: '1.0'
    };

    // Generate signature using only OAuth params
    const signature = this.generateOAuthSignature(method, url, oauthParams);
    oauthParams.oauth_signature = signature;

    // Build authorization header
    const authHeader = 'OAuth ' + Object.keys(oauthParams)
      .sort()
      .map(key => `${this.percentEncode(key)}="${this.percentEncode(oauthParams[key])}"`)
      .join(', ');

    console.log('🔑 OAuth header generated:', authHeader.substring(0, 100) + '...');

    return authHeader;
  }

  async postToX(content) {
    try {
      if (!this.apiKey || !this.apiSecret || !this.accessToken || !this.accessTokenSecret) {
        throw new Error('X OAuth 1.0a credentials not configured');
      }

      console.log('🐦 Posting to X with improved OAuth 1.0a:', content.substring(0, 50) + '...');

      const url = 'https://api.twitter.com/2/tweets';
      const method = 'POST';
      const tweetData = { text: content };

      // Generate OAuth header (without including JSON body in signature)
      const authHeader = this.generateOAuthHeader(method, url);

      console.log('📡 Making request to X API...');

      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(tweetData)
      });

      console.log('📊 X API response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ X API Error Response:', errorText);
        throw new Error(`Tweet failed: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Successfully posted to X:', result.data?.id || 'Tweet created');
      
      return {
        success: true,
        tweetId: result.data?.id,
        tweetUrl: result.data?.id ? `https://twitter.com/user/status/${result.data.id}` : null,
        message: 'Successfully posted to X',
        platform: 'x',
        response: result
      };

    } catch (error) {
      console.error('❌ X posting failed:', error.message);
      return {
        success: false,
        error: error.message,
        platform: 'x'
      };
    }
  }
}

// Enhanced Social Media Automation
class EnhancedAutomatedSocialPoster {
  constructor(config = {}) {
    this.config = {
      baseUrl: 'https://www.avablackwood.com',
      zapierWebhookUrl: config.zapierWebhookUrl || process.env.ZAPIER_WEBHOOK_URL,
      ...config
    };
    
    this.xPoster = new DirectXPoster();
  }

  async getBlogPost(slug) {
    const post = await sanityClient.fetch(`*[_type == "post" && slug.current == $slug][0]{
      _id,
      title,
      slug,
      publishedAt,
      "mainImageUrl": mainImage.asset->url,
      "excerpt": pt::text(body[0...3]),
      body,
      author->{name}
    }`, { slug });

    return post;
  }

  createExcerpt(post, maxLength = 150) {
    if (post.excerpt && post.excerpt.trim()) {
      const cleanExcerpt = post.excerpt
        .replace(/\n/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      if (cleanExcerpt.length > maxLength) {
        return cleanExcerpt.substring(0, maxLength).trim() + '...';
      }
      return cleanExcerpt;
    }
    
    return `Explore the depths of desire and forbidden attraction in this captivating piece.`;
  }

  async generateXContent(post) {
    const postUrl = `${this.config.baseUrl}/blog/${post.slug.current}`;
    
    // Create plain text summary for AI
    const plainTextBodyForSocial = this.createExcerpt(post, 200);
    
    console.log('🤖 Generating social media post with Gemini...');
    const socialPostPrompt = `
      You are a social media manager for spicy romance author Ava Blackwood.
      Create a short, catchy, and intriguing social media post based on her latest blog post.
      The tone should be sophisticated and tempting.
      Hint at the spicy advice in the post to encourage clicks.
      *** Include this link at the end: [Link to blog post]
      Include 3 relevant hashtags like #SpicyRomance, #RomanceAuthor, #AvaBlackwood.
      *** Keep the output text under 280 characters for posting on X.

      Blog Post Title: "${post.title}"
      Blog Post Content Summary: "${plainTextBodyForSocial}"

      Based on this, generate a JSON object with one key: "social_post_text".
    `;

    try {
      const socialResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: socialPostPrompt }] }] }),
      });

      if (!socialResponse.ok) throw new Error(`Gemini API Error: ${await socialResponse.text()}`);
      
      const socialResult = await socialResponse.json();
      const socialGeneratedText = socialResult.candidates[0].content.parts[0].text;
      const socialJsonString = socialGeneratedText.match(/```json\n([\s\S]*?)\n```/)?.[1];
      
      if (socialJsonString) {
        const socialPost = JSON.parse(socialJsonString);
        
        // Replace placeholder with actual URL
        if (socialPost.social_post_text.includes('[Link to blog post]')) {
          socialPost.social_post_text = socialPost.social_post_text.replace('[Link to blog post]', postUrl);
        } else {
          const withLink = `${socialPost.social_post_text} ${postUrl}`;
          socialPost.social_post_text = withLink.length <= 280 ? withLink : socialPost.social_post_text;
        }
        
        console.log('✅ Generated AI social post:', socialPost.social_post_text);
        return socialPost.social_post_text;
      }
    } catch (error) {
      console.warn('⚠️ AI generation failed, using fallback:', error.message);
    }

    // Fallback to original format if AI fails
    const excerpt = this.createExcerpt(post, 80);
    const content = `🖤 ${post.title}

${excerpt}

Read more: ${postUrl}

#SpicyRomance #RomanceAuthor #AvaBlackwood`;

    if (content.length > 280) {
      const shorterExcerpt = this.createExcerpt(post, 40);
      return `🖤 ${post.title}

${shorterExcerpt}

${postUrl}

#SpicyRomance #RomanceAuthor #AvaBlackwood`;
    }

    return content;
  }

  async formatForZapier(post) {
    const postUrl = `${this.config.baseUrl}/blog/${post.slug.current}`;
    const excerpt = this.createExcerpt(post, 120);
    const content = await this.generateXContent(post);

    return {
      title: post.title,
      content: content,
      image_url: post.mainImageUrl,
      link_url: postUrl,
      blog_post: {
        id: post._id,
        title: post.title,
        slug: post.slug.current,
        excerpt: excerpt,
        published_at: post.publishedAt,
        author: post.author?.name || 'Ava Blackwood',
        image_url: post.mainImageUrl,
        blog_url: postUrl
      },
      social_card_url: `${this.config.baseUrl}/api/social-card/${post.slug.current}`,
    };
  }

  async sendToZapier(post) {
    if (!this.config.zapierWebhookUrl) {
      return {
        success: false,
        error: 'Zapier webhook URL not configured',
        skipped: true,
        platform: 'zapier'
      };
    }

    const zapierData = await this.formatForZapier(post);

    try {
      console.log('📤 Sending to Zapier...');
      
      const response = await fetch(this.config.zapierWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(zapierData)
      });

      if (!response.ok) {
        throw new Error(`Zapier webhook failed: ${response.statusText}`);
      }

      console.log('✅ Successfully sent to Zapier');

      return {
        success: true,
        message: 'Successfully sent to Zapier',
        data: zapierData,
        platform: 'zapier'
      };
    } catch (error) {
      console.error('❌ Zapier failed:', error.message);
      return {
        success: false,
        error: error.message,
        data: zapierData,
        platform: 'zapier'
      };
    }
  }

  async postDirectlyToX(post) {
    const content = await this.generateXContent(post);
    return await this.xPoster.postToX(content);
  }

  async automatePost(slug, options = {}) {
    const {
      useZapier = true,
      useDirectPosting = false
    } = options;

    try {
      const post = await this.getBlogPost(slug);

      if (!post) {
        throw new Error('No blog post found');
      }

      console.log(`📝 Processing: ${post.title}`);
      console.log(`⚙️ Methods: Zapier=${useZapier}, Direct=${useDirectPosting}`);

      const results = {
        success: true,
        post: {
          title: post.title,
          slug: post.slug.current,
          imageUrl: post.mainImageUrl,
          blogUrl: `${this.config.baseUrl}/blog/${post.slug.current}`,
          socialCardUrl: `${this.config.baseUrl}/api/social-card/${post.slug.current}`,
          publishedAt: post.publishedAt
        },
        zapier: null,
        directPosting: null,
        summary: {
          attempted: [],
          successful: [],
          failed: []
        }
      };

      // Send to Zapier if enabled
      if (useZapier) {
        results.summary.attempted.push('zapier');
        results.zapier = await this.sendToZapier(post);
        
        if (results.zapier.success) {
          results.summary.successful.push('zapier');
        } else {
          results.summary.failed.push('zapier');
        }
      }

      // Direct posting if enabled
      if (useDirectPosting) {
        results.summary.attempted.push('direct_x');
        results.directPosting = await this.postDirectlyToX(post);
        
        if (results.directPosting.success) {
          results.summary.successful.push('direct_x');
        } else {
          results.summary.failed.push('direct_x');
        }
      }

      // Overall success if at least one method succeeded
      results.success = results.summary.successful.length > 0;

      console.log(`📊 Results: ${results.summary.successful.length}/${results.summary.attempted.length} successful`);

      return results;
    } catch (error) {
      console.error('❌ Automation error:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

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
    const { _type, slug, title, _id } = req.body;
    
    if (_type !== 'post' || !slug?.current) {
      return res.status(400).json({
        success: false,
        error: 'Invalid webhook data - not a blog post',
        received_data: { _type, slug, title, _id }
      });
    }

    console.log(`📝 New blog post published: ${title} (${slug.current})`);

    const socialPoster = new EnhancedAutomatedSocialPoster();

    // Determine posting methods based on available credentials
    const hasZapier = !!process.env.ZAPIER_WEBHOOK_URL;
    const hasDirectX = !!process.env.X_BEARER_TOKEN;

    console.log(`🔧 Available methods: Zapier=${hasZapier}, DirectX=${hasDirectX}`);

    // Use both methods for maximum reliability
    const result = await socialPoster.automatePost(slug.current, {
      useZapier: hasZapier,
      useDirectPosting: hasDirectX
    });

    console.log('🚀 Automation result:', JSON.stringify(result, null, 2));

    return res.status(200).json({
      success: true,
      message: 'Social media automation triggered successfully',
      blog_post: {
        title: title,
        slug: slug.current,
        id: _id
      },
      automation_result: result,
      methods_available: {
        zapier: hasZapier,
        direct_x: hasDirectX
      }
    });

  } catch (error) {
    console.error('❌ Webhook error:', error);
    
    return res.status(500).json({
      success: false,
      error: error.message,
      details: 'Check server logs for more information'
    });
  }
}