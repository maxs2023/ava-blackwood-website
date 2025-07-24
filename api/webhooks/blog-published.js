// Complete self-contained webhook for blog publishing
import { createClient } from '@sanity/client';

// Create Sanity client directly in the webhook
const sanityClient = createClient({
  projectId: process.env.SANITY_PROJECT_ID || '8vo1vk23',
  dataset: 'production',
  apiVersion: '2025-07-17',
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
});

// Self-contained automation logic
class AutomatedSocialPoster {
  constructor(config = {}) {
    this.config = {
      baseUrl: 'https://www.avablackwood.com',
      zapierWebhookUrl: config.zapierWebhookUrl || process.env.ZAPIER_WEBHOOK_URL,
      ...config
    };
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
    
    return `Explore the depths of desire and forbidden attraction in this captivating piece from Ava Blackwood's collection.`;
  }

  generateTwitterContent(post) {
    const postUrl = `${this.config.baseUrl}/blog/${post.slug.current}`;
    const excerpt = this.createExcerpt(post, 100);

    return `🖤 ${post.title}

${excerpt}

The art of seduction lives in the pause before the touch...

Read more: ${postUrl}

#DarkAcademia #Romance #BlogPost #AvaBlackwood`;
  }

  formatForZapier(post) {
    const postUrl = `${this.config.baseUrl}/blog/${post.slug.current}`;
    const excerpt = this.createExcerpt(post, 120);

    return {
      title: post.title,
      content: this.generateTwitterContent(post),
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
      throw new Error('Zapier webhook URL not configured');
    }

    const zapierData = this.formatForZapier(post);

    try {
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

      return {
        success: true,
        message: 'Successfully sent to Zapier',
        data: zapierData
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        data: zapierData
      };
    }
  }

  async automatePost(slug) {
    try {
      const post = await this.getBlogPost(slug);

      if (!post) {
        throw new Error('No blog post found');
      }

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
        zapier: await this.sendToZapier(post)
      };

      return results;
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default async function handler(req, res) {
  // Set CORS headers
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
    
    // Verify this is a blog post publication
    if (_type !== 'post' || !slug?.current) {
      return res.status(400).json({
        success: false,
        error: 'Invalid webhook data - not a blog post',
        received_data: { _type, slug, title, _id }
      });
    }

    console.log(`📝 New blog post published: ${title} (${slug.current})`);

    // Initialize the social poster
    const socialPoster = new AutomatedSocialPoster({
      zapierWebhookUrl: process.env.ZAPIER_WEBHOOK_URL
    });

    // Trigger automated posting
    const result = await socialPoster.automatePost(slug.current);

    console.log('🚀 Automation result:', JSON.stringify(result, null, 2));

    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Social media automation triggered successfully',
      blog_post: {
        title: title,
        slug: slug.current,
        id: _id
      },
      automation_result: result
    });

  } catch (error) {
    console.error('❌ Webhook error:', error);
    
    // Return error response
    return res.status(500).json({
      success: false,
      error: error.message,
      details: 'Check server logs for more information'
    });
  }
}