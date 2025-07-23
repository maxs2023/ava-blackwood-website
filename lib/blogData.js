// lib/blogData.js - Centralized blog data management

export const BLOG_POSTS = {
    'ai-generated-content-future': {
      title: 'The Future of AI-Generated Content',
      description: 'Exploring how AI is reshaping content creation and what it means for creators in the digital age.',
      image: '/images/ai-content-future.jpg',
      publishDate: '2024-01-15',
      author: 'Ava Blackwood',
      readTime: '5 min read',
      tags: ['AI', 'Content Creation', 'Future Tech'],
      excerpt: 'As artificial intelligence continues to evolve, the landscape of content creation is undergoing a dramatic transformation...'
    },
    'automation-social-media-workflow': {
      title: 'Automating Your Social Media Workflow',
      description: 'Learn how to create an efficient, automated pipeline from blog creation to social media posting.',
      image: '/images/automation-workflow.jpg',
      publishDate: '2024-01-22',
      author: 'Ava Blackwood',
      readTime: '7 min read',
      tags: ['Automation', 'Social Media', 'Workflow'],
      excerpt: 'Managing social media presence while creating quality content can be overwhelming. Here\'s how to streamline it all...'
    },
    'building-personal-brand-online': {
      title: 'Building Your Personal Brand Online',
      description: 'Essential strategies for establishing and growing your personal brand in the digital landscape.',
      image: '/images/personal-brand.jpg',
      publishDate: '2024-01-29',
      author: 'Ava Blackwood',
      readTime: '6 min read',
      tags: ['Personal Brand', 'Marketing', 'Digital Strategy'],
      excerpt: 'Your personal brand is your most valuable asset in today\'s digital world. Here\'s how to build it effectively...'
    },
    'seo-optimization-2024': {
      title: 'SEO Optimization Strategies for 2024',
      description: 'Stay ahead of the curve with the latest SEO strategies and algorithm updates for maximum visibility.',
      image: '/images/seo-2024.jpg',
      publishDate: '2024-02-05',
      author: 'Ava Blackwood',
      readTime: '8 min read',
      tags: ['SEO', 'Digital Marketing', '2024 Trends'],
      excerpt: 'Search engine algorithms are constantly evolving. Here are the strategies that will keep you visible...'
    },
    'content-marketing-roi': {
      title: 'Measuring Content Marketing ROI',
      description: 'Learn how to track and measure the real impact of your content marketing efforts with actionable metrics.',
      image: '/images/content-roi.jpg',
      publishDate: '2024-02-12',
      author: 'Ava Blackwood',
      readTime: '6 min read',
      tags: ['Content Marketing', 'Analytics', 'ROI'],
      excerpt: 'Content marketing success isn\'t just about views and likes. Here\'s how to measure what really matters...'
    }
  }
  
  // Helper functions for blog data management
  export function getBlogPost(slug) {
    return BLOG_POSTS[slug] || null
  }
  
  export function getAllBlogPosts() {
    return Object.entries(BLOG_POSTS).map(([slug, post]) => ({
      slug,
      ...post
    }))
  }
  
  export function getBlogPostsByTag(tag) {
    return Object.entries(BLOG_POSTS)
      .filter(([_, post]) => post.tags?.includes(tag))
      .map(([slug, post]) => ({ slug, ...post }))
  }
  
  export function getRecentBlogPosts(limit = 5) {
    return Object.entries(BLOG_POSTS)
      .map(([slug, post]) => ({ slug, ...post }))
      .sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate))
      .slice(0, limit)
  }
  
  export function generateBlogPostUrl(slug) {
    return `https://avablackwood.com/blog/${slug}`
  }
  
  export function generateImageUrl(imagePath) {
    if (imagePath.startsWith('http')) {
      return imagePath
    }
    return `https://avablackwood.com${imagePath}`
  }
  
  // Function to add new blog post (for your automation script)
  export function addBlogPost(slug, postData) {
    const requiredFields = ['title', 'description', 'image', 'publishDate', 'author']
    
    for (const field of requiredFields) {
      if (!postData[field]) {
        throw new Error(`Missing required field: ${field}`)
      }
    }
    
    const defaultData = {
      readTime: '5 min read',
      tags: [],
      excerpt: postData.description,
      ...postData
    }
    
    // In a real implementation, you'd save this to your data source
    // For now, we'll just log it
    console.log(`Adding new blog post: ${slug}`, defaultData)
    
    return {
      slug,
      ...defaultData,
      url: generateBlogPostUrl(slug)
    }
  }
  
  // Export for use in edge function
  export { BLOG_POSTS as default }