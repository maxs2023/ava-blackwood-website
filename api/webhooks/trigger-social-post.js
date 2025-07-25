// Enhanced manual trigger with dual posting options
import { createClient } from '@sanity/client';

const sanityClient = createClient({
  projectId: process.env.SANITY_PROJECT_ID || '8vo1vk23',
  dataset: 'production',
  apiVersion: '2025-07-17',
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
});

// Direct X Poster
class DirectXPoster {
  constructor() {
    this.bearerToken = process.env.X_BEARER_TOKEN;
  }

  async postToX(content) {
    try {
      if (!this.bearerToken) {
        throw new Error('X Bearer Token not configured');
      }

      console.log('🐦 Posting to X:', content.substring(0, 50) + '...');

      const tweetData = { text: content };

      const response = await fetch('https://api.twitter.com/2/tweets', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.bearerToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(tweetData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ X API Error:', errorText);
        throw new Error(`Tweet failed: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Successfully posted to X:', result.data.id);
      
      return {
        success: true,
        tweetId: result.data.id,
        tweetUrl: `https://twitter.com/user/status/${result.data.id}`,
        message: 'Successfully posted to X',
        platform: 'x'
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

  generateXContent(post) {
    const postUrl = `${this.config.baseUrl}/blog/${post.slug.current}`;
    const excerpt = this.createExcerpt(post, 80);

    const content = `🖤 ${post.title}

${excerpt}

Read more: ${postUrl}

#DarkAcademia #Romance #AvaBlackwood`;

    // Ensure under 280 characters for X
    if (content.length > 280) {
      const shorterExcerpt = this.createExcerpt(post, 40);
      return `🖤 ${post.title}

${shorterExcerpt}

${postUrl}

#DarkAcademia #Romance #AvaBlackwood`;
    }

    return content;
  }

  formatForZapier(post) {
    const postUrl = `${this.config.baseUrl}/blog/${post.slug.current}`;
    const excerpt = this.createExcerpt(post, 120);

    return {
      title: post.title,
      content: this.generateXContent(post),
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

    const zapierData = this.formatForZapier(post);

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
    const content = this.generateXContent(post);
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