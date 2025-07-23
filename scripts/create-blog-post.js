#!/usr/bin/env node

import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Configuration
const BLOG_DATA_FILE = path.join(__dirname, '..', 'lib', 'blogData.js')
const EDGE_FUNCTION_FILE = path.join(__dirname, '..', 'api', 'blog', '[slug].js')

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim()
}

function estimateReadTime(content) {
  const wordsPerMinute = 200
  const wordCount = content.split(/\s+/).length
  const readTime = Math.ceil(wordCount / wordsPerMinute)
  return `${readTime} min read`
}

async function updateBlogDataFile(newPost) {
  try {
    // Read the current blog data file
    const currentContent = await fs.readFile(BLOG_DATA_FILE, 'utf-8')
    
    // Find the BLOG_POSTS object and add the new post
    const postEntry = `  '${newPost.slug}': {
    title: '${newPost.title}',
    description: '${newPost.description}',
    image: '${newPost.image}',
    publishDate: '${newPost.publishDate}',
    author: '${newPost.author}',
    readTime: '${newPost.readTime}',
    tags: ${JSON.stringify(newPost.tags)},
    excerpt: '${newPost.excerpt}'
  },`
    
    // Insert the new post at the beginning of the BLOG_POSTS object
    const insertionPoint = currentContent.indexOf('export const BLOG_POSTS = {') + 'export const BLOG_POSTS = {'.length
    const updatedContent = [
      currentContent.slice(0, insertionPoint),
      '\n' + postEntry,
      currentContent.slice(insertionPoint)
    ].join('')
    
    // Write back to file
    await fs.writeFile(BLOG_DATA_FILE, updatedContent, 'utf-8')
    console.log('✅ Updated blogData.js with new post')
    
  } catch (error) {
    console.error('❌ Error updating blog data file:', error.message)
    throw error
  }
}

async function updateEdgeFunction(newPost) {
  try {
    // Read the current edge function file
    const currentContent = await fs.readFile(EDGE_FUNCTION_FILE, 'utf-8')
    
    // Find the BLOG_POSTS object and add the new post
    const postEntry = `  '${newPost.slug}': {
    title: '${newPost.title}',
    description: '${newPost.description}',
    image: '${newPost.image}',
    publishDate: '${newPost.publishDate}',
    author: '${newPost.author}',
    readTime: '${newPost.readTime}'
  },`
    
    // Insert the new post at the beginning of the BLOG_POSTS object in the edge function
    const insertionPoint = currentContent.indexOf('const BLOG_POSTS = {') + 'const BLOG_POSTS = {'.length
    const updatedContent = [
      currentContent.slice(0, insertionPoint),
      '\n' + postEntry,
      currentContent.slice(insertionPoint)
    ].join('')
    
    // Write back to file
    await fs.writeFile(EDGE_FUNCTION_FILE, updatedContent, 'utf-8')
    console.log('✅ Updated edge function with new post')
    
  } catch (error) {
    console.error('❌ Error updating edge function:', error.message)
    throw error
  }
}

async function generateSocialMediaPost(blogPost) {
  const platforms = {
    twitter: {
      template: `🚀 New blog post is live!

${blogPost.title}

${blogPost.description}

Read more: https://avablackwood.com/blog/${blogPost.slug}

#${blogPost.tags.join(' #').replace(/\s/g, '')}`,
      characterLimit: 280
    },
    linkedin: {
      template: `I just published a new article: "${blogPost.title}"

${blogPost.description}

In this ${blogPost.readTime} article, I explore key insights that can help you stay ahead in today's digital landscape.

What are your thoughts on this topic? I'd love to hear your perspective in the comments.

Read the full article: https://avablackwood.com/blog/${blogPost.slug}

#${blogPost.tags.join(' #').replace(/\s/g, '')} #ContentCreation #DigitalStrategy`,
      characterLimit: 3000
    }
  }
  
  console.log('\n📱 Generated Social Media Posts:')
  console.log('=' .repeat(50))
  
  for (const [platform, config] of Object.entries(platforms)) {
    const post = config.template
    const isWithinLimit = post.length <= config.characterLimit
    
    console.log(`\n${platform.toUpperCase()}:`)
    console.log(`📏 Length: ${post.length}/${config.characterLimit} ${isWithinLimit ? '✅' : '❌'}`)
    console.log(`${'-'.repeat(30)}`)
    console.log(post)
    
    if (!isWithinLimit) {
      console.log(`⚠️  WARNING: Post exceeds ${platform} character limit!`)
    }
  }
  
  return platforms
}

async function createBlogPost(postData) {
  try {
    // Validate required fields
    const requiredFields = ['title', 'description', 'content']
    for (const field of requiredFields) {
      if (!postData[field]) {
        throw new Error(`Missing required field: ${field}`)
      }
    }
    
    // Generate post metadata
    const slug = postData.slug || generateSlug(postData.title)
    const publishDate = postData.publishDate || new Date().toISOString().split('T')[0]
    const author = postData.author || 'Ava Blackwood'
    const readTime = postData.readTime || estimateReadTime(postData.content)
    const tags = postData.tags || ['Blog']
    const excerpt = postData.excerpt || postData.description
    const image = postData.image || `/images/blog-${slug}.jpg`
    
    const newPost = {
      slug,
      title: postData.title,
      description: postData.description,
      image,
      publishDate,
      author,
      readTime,
      tags,
      excerpt,
      content: postData.content
    }
    
    console.log('🚀 Creating new blog post...')
    console.log(`📝 Title: ${newPost.title}`)
    console.log(`🔗 Slug: ${newPost.slug}`)
    console.log(`📅 Publish Date: ${newPost.publishDate}`)
    console.log(`🖼️  Image: ${newPost.image}`)
    console.log(`🏷️  Tags: ${newPost.tags.join(', ')}`)
    console.log(`⏱️  Read Time: ${newPost.readTime}`)
    
    // Update the blog data file
    await updateBlogDataFile(newPost)
    
    // Update the edge function
    await updateEdgeFunction(newPost)
    
    // Generate social media posts
    const socialPosts = await generateSocialMediaPost(newPost)
    
    console.log('\n✅ Blog post created successfully!')
    console.log(`🌐 URL: https://avablackwood.com/blog/${newPost.slug}`)
    
    // Save social media posts to a file
    const socialPostsFile = path.join(__dirname, '..', 'generated', `social-posts-${slug}.json`)
    await fs.mkdir(path.dirname(socialPostsFile), { recursive: true })
    await fs.writeFile(socialPostsFile, JSON.stringify({
      blogPost: newPost,
      socialPosts: socialPosts,
      generatedAt: new Date().toISOString()
    }, null, 2))
    
    console.log(`💾 Social media posts saved to: ${socialPostsFile}`)
    
    return {
      blogPost: newPost,
      socialPosts,
      success: true
    }
    
  } catch (error) {
    console.error('❌ Error creating blog post:', error.message)
    throw error
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2)
  
  if (args.length === 0) {
    console.log(`
📝 Blog Post Creation Tool

Usage:
  node scripts/create-blog-post.js --interactive
  node scripts/create-blog-post.js --file path/to/blog-data.json
  node scripts/create-blog-post.js --example

Examples:
  # Interactive mode
  node scripts/create-blog-post.js --interactive
  
  # From JSON file
  node scripts/create-blog-post.js --file ./blog-posts/new-post.json
  
  # Generate example
  node scripts/create-blog-post.js --example
`)
    return
  }
  
  if (args[0] === '--example') {
    const examplePost = {
      title: 'Advanced Automation Strategies for Content Creators',
      description: 'Discover cutting-edge automation techniques that can transform your content creation workflow and boost productivity.',
      content: 'Content creators today face an overwhelming challenge: producing high-quality content consistently while managing multiple platforms and engaging with audiences. The solution lies in strategic automation that amplifies your efforts without sacrificing authenticity...',
      tags: ['Automation', 'Content Creation', 'Productivity', 'Workflow'],
      image: '/images/advanced-automation-strategies.jpg'
    }
    
    console.log('📄 Example blog post data:')
    console.log(JSON.stringify(examplePost, null, 2))
    
    const result = await createBlogPost(examplePost)
    console.log('\n🎉 Example blog post created!')
    return result
  }
  
  if (args[0] === '--file') {
    const filePath = args[1]
    if (!filePath) {
      console.error('❌ Please provide a file path')
      return
    }
    
    try {
      const fileContent = await fs.readFile(filePath, 'utf-8')
      const postData = JSON.parse(fileContent)
      
      const result = await createBlogPost(postData)
      console.log('\n🎉 Blog post created from file!')
      return result
      
    } catch (error) {
      console.error('❌ Error reading file:', error.message)
      return
    }
  }
  
  if (args[0] === '--interactive') {
    console.log('🔄 Interactive mode not implemented yet. Please use --file or --example.')
    console.log('💡 Create a JSON file with your blog post data and use --file option.')
    return
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error)
}

export { createBlogPost, generateSocialMediaPost }