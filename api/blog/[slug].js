// api/blog/[slug].js - Place this file in your project's api/blog/ directory

export const config = {
    runtime: 'edge',
  }
  
  // Social media crawler user agents (comprehensive list)
  const SOCIAL_CRAWLERS = [
    'facebookexternalhit',
    'Twitterbot',
    'LinkedInBot',
    'WhatsApp',
    'TelegramBot',
    'DiscordBot',
    'SlackBot',
    'SkypeUriPreview',
    'MicrosoftPreview',
    'RedditBot',
    'PinterestBot',
    'GoogleBot',
    'bingbot',
    'YandexBot',
    'DuckDuckBot'
  ]
  
  // Blog posts data - In production, you might want to fetch this from a CMS, database, or API
  // For now, this demonstrates the structure you'd need
  const BLOG_POSTS = {
    'ai-generated-content-future': {
      title: 'The Future of AI-Generated Content',
      description: 'Exploring how AI is reshaping content creation and what it means for creators in the digital age.',
      image: '/images/ai-content-future.jpg',
      publishDate: '2024-01-15',
      author: 'Ava Blackwood',
      readTime: '5 min read'
    },
    'automation-social-media-workflow': {
      title: 'Automating Your Social Media Workflow',
      description: 'Learn how to create an efficient, automated pipeline from blog creation to social media posting.',
      image: '/images/automation-workflow.jpg',
      publishDate: '2024-01-22',
      author: 'Ava Blackwood',
      readTime: '7 min read'
    },
    'building-personal-brand-online': {
      title: 'Building Your Personal Brand Online',
      description: 'Essential strategies for establishing and growing your personal brand in the digital landscape.',
      image: '/images/personal-brand.jpg',
      publishDate: '2024-01-29',
      author: 'Ava Blackwood',
      readTime: '6 min read'
    }
    // Add more blog posts as needed
  }
  
  function isSocialCrawler(userAgent) {
    if (!userAgent) return false
    const lowerUserAgent = userAgent.toLowerCase()
    return SOCIAL_CRAWLERS.some(crawler => 
      lowerUserAgent.includes(crawler.toLowerCase())
    )
  }
  
  function generateSocialHTML(post, slug) {
    const fullUrl = `https://avablackwood.com/blog/${slug}`
    const imageUrl = post.image.startsWith('http') ? post.image : `https://avablackwood.com${post.image}`
    
    return `<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      
      <!-- Basic Meta Tags -->
      <title>${post.title} | Ava Blackwood</title>
      <meta name="description" content="${post.description}">
      <meta name="author" content="${post.author}">
      <meta name="robots" content="index, follow">
      
      <!-- Open Graph / Facebook -->
      <meta property="og:type" content="article">
      <meta property="og:site_name" content="Ava Blackwood">
      <meta property="og:url" content="${fullUrl}">
      <meta property="og:title" content="${post.title}">
      <meta property="og:description" content="${post.description}">
      <meta property="og:image" content="${imageUrl}">
      <meta property="og:image:secure_url" content="${imageUrl}">
      <meta property="og:image:width" content="1200">
      <meta property="og:image:height" content="630">
      <meta property="og:image:alt" content="${post.title}">
      <meta property="og:image:type" content="image/jpeg">
      
      <!-- Article specific Open Graph -->
      <meta property="article:published_time" content="${post.publishDate}T00:00:00.000Z">
      <meta property="article:author" content="${post.author}">
      <meta property="article:section" content="Blog">
      
      <!-- Twitter Card -->
      <meta name="twitter:card" content="summary_large_image">
      <meta name="twitter:site" content="@avablackwood">
      <meta name="twitter:creator" content="@avablackwood">
      <meta name="twitter:url" content="${fullUrl}">
      <meta name="twitter:title" content="${post.title}">
      <meta name="twitter:description" content="${post.description}">
      <meta name="twitter:image" content="${imageUrl}">
      <meta name="twitter:image:alt" content="${post.title}">
      
      <!-- LinkedIn specific -->
      <meta property="og:locale" content="en_US">
      
      <!-- Additional Meta -->
      <link rel="canonical" href="${fullUrl}">
      <meta name="theme-color" content="#000000">
      
      <!-- Structured Data for better SEO -->
      <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": "${post.title}",
        "description": "${post.description}",
        "image": "${imageUrl}",
        "author": {
          "@type": "Person",
          "name": "${post.author}"
        },
        "publisher": {
          "@type": "Person",
          "name": "${post.author}"
        },
        "datePublished": "${post.publishDate}T00:00:00.000Z",
        "dateModified": "${post.publishDate}T00:00:00.000Z",
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": "${fullUrl}"
        }
      }
      </script>
      
      <!-- Redirect script for browsers (not crawlers) -->
      <script>
          // Only redirect if this isn't a crawler and JavaScript is enabled
          (function() {
              var userAgent = navigator.userAgent.toLowerCase();
              var isCrawler = /bot|crawler|spider|crawling|facebookexternalhit|twitterbot|linkedinbot|whatsapp|telegram|discord|slack/i.test(userAgent);
              
              if (!isCrawler) {
                  // Small delay to ensure crawlers have time to read the meta tags
                  setTimeout(function() {
                      window.location.replace('${fullUrl}');
                  }, 100);
              }
          })();
      </script>
      
      <!-- Fallback meta redirect (as backup) -->
      <noscript>
          <meta http-equiv="refresh" content="2; url=${fullUrl}">
      </noscript>
      
      <style>
          body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
              max-width: 600px;
              margin: 50px auto;
              padding: 20px;
              background: #f9f9f9;
              color: #333;
          }
          .card {
              background: white;
              border-radius: 8px;
              padding: 30px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
              text-align: center;
          }
          .loading {
              color: #666;
              margin-bottom: 20px;
          }
          .title {
              color: #2c3e50;
              margin: 20px 0;
          }
          .description {
              color: #7f8c8d;
              line-height: 1.6;
              margin-bottom: 30px;
          }
          .cta {
              display: inline-block;
              background: #3498db;
              color: white;
              padding: 12px 24px;
              text-decoration: none;
              border-radius: 5px;
              font-weight: bold;
              transition: background 0.3s;
          }
          .cta:hover {
              background: #2980b9;
          }
          .meta {
              margin-top: 20px;
              color: #95a5a6;
              font-size: 14px;
          }
      </style>
  </head>
  <body>
      <div class="card">
          <div class="loading">Loading article...</div>
          <h1 class="title">${post.title}</h1>
          <p class="description">${post.description}</p>
          <a href="${fullUrl}" class="cta">Read Full Article</a>
          <div class="meta">
              By ${post.author} • ${post.readTime} • ${new Date(post.publishDate).toLocaleDateString()}
          </div>
      </div>
      
      <!-- Debug info (remove in production) -->
      <!--
      <div style="margin-top: 50px; padding: 20px; background: #ecf0f1; border-radius: 5px; font-size: 12px; color: #7f8c8d;">
          <strong>Debug Info:</strong><br>
          Slug: ${slug}<br>
          Image URL: ${imageUrl}<br>
          Generated for crawler
      </div>
      -->
  </body>
  </html>`
  }
  
  export default async function handler(request) {
    try {
      const url = new URL(request.url)
      const pathParts = url.pathname.split('/')
      const slug = pathParts[pathParts.length - 1] || pathParts[pathParts.length - 2]
      
      // Get user agent from headers
      const userAgent = request.headers.get('user-agent') || ''
      
      // Log for debugging (remove in production)
      console.log(`Blog request - Slug: ${slug}, User-Agent: ${userAgent.substring(0, 50)}...`)
      
      // Check if this is a social media crawler
      const isCrawler = isSocialCrawler(userAgent)
      
      if (isCrawler) {
        // Look up the blog post
        const post = BLOG_POSTS[slug]
        
        if (post) {
          console.log(`Serving crawler content for: ${slug}`)
          const html = generateSocialHTML(post, slug)
          
          return new Response(html, {
            status: 200,
            headers: {
              'Content-Type': 'text/html; charset=utf-8',
              'Cache-Control': 'public, max-age=3600, s-maxage=86400', // Cache for 1 hour, CDN for 24 hours
              'X-Served-By': 'Edge-Function-Crawler'
            }
          })
        } else {
          console.log(`Blog post not found for slug: ${slug}`)
          // Return 404 for crawlers if post doesn't exist
          return new Response('Blog post not found', { 
            status: 404,
            headers: {
              'Content-Type': 'text/plain',
              'X-Served-By': 'Edge-Function-404'
            }
          })
        }
      }
      
      // For regular users (browsers), redirect to the main site
      const mainSiteUrl = `https://avablackwood.com/blog/${slug}`
      console.log(`Redirecting user to: ${mainSiteUrl}`)
      
      return Response.redirect(mainSiteUrl, 302)
      
    } catch (error) {
      console.error('Edge function error:', error)
      
      // Fallback: redirect to main site
      const fallbackUrl = `https://avablackwood.com${url.pathname}`
      return Response.redirect(fallbackUrl, 302)
    }
  }