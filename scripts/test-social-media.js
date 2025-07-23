#!/usr/bin/env node

import https from 'https'
import { getBlogPost, getAllBlogPosts, generateBlogPostUrl } from '../lib/blogData.js'

// Social media crawler user agents for testing
const SOCIAL_USER_AGENTS = {
  'Facebook': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
  'Twitter': 'Twitterbot/1.0',
  'LinkedIn': 'LinkedInBot/1.0 (compatible; Mozilla/5.0; Apache-HttpClient +http://www.linkedin.com)',
  'WhatsApp': 'WhatsApp/2.16.7',
  'Telegram': 'TelegramBot (like TwitterBot)',
  'Discord': 'Mozilla/5.0 (compatible; Discordbot/2.0; +https://discordapp.com)',
  'Slack': 'Slackbot-LinkExpanding 1.0 (+https://api.slack.com/robots)',
  'Regular Browser': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
}

function makeRequest(url, userAgent) {
  return new Promise((resolve) => {
    const options = {
      method: 'GET',
      headers: {
        'User-Agent': userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      timeout: 10000
    }

    const req = https.request(url, options, (res) => {
      let data = ''
      
      res.on('data', (chunk) => {
        data += chunk
      })
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
          redirected: res.statusCode >= 300 && res.statusCode < 400
        })
      })
    })
    
    req.on('error', (error) => {
      resolve({ error: error.message })
    })
    
    req.on('timeout', () => {
      req.destroy()
      resolve({ error: 'Request timeout' })
    })
    
    req.end()
  })
}

function extractMetaTags(html) {
  const metaTags = {}
  
  // Extract Open Graph tags
  const ogRegex = /<meta\s+property=["']og:([^"']+)["']\s+content=["']([^"']*)["'][^>]*>/gi
  let match
  while ((match = ogRegex.exec(html)) !== null) {
    metaTags[`og:${match[1]}`] = match[2]
  }
  
  // Extract Twitter tags
  const twitterRegex = /<meta\s+name=["']twitter:([^"']+)["']\s+content=["']([^"']*)["'][^>]*>/gi
  while ((match = twitterRegex.exec(html)) !== null) {
    metaTags[`twitter:${match[1]}`] = match[2]
  }
  
  // Extract basic meta tags
  const basicRegex = /<meta\s+name=["']([^"']+)["']\s+content=["']([^"']*)["'][^>]*>/gi
  while ((match = basicRegex.exec(html)) !== null) {
    metaTags[match[1]] = match[2]
  }
  
  // Extract title
  const titleMatch = html.match(/<title>([^<]*)<\/title>/i)
  if (titleMatch) {
    metaTags.title = titleMatch[1]
  }
  
  return metaTags
}

function validateSocialTags(metaTags, expectedData) {
  const issues = []
  const requirements = {
    'og:title': 'Open Graph title is required for social sharing',
    'og:description': 'Open Graph description is required for social sharing',
    'og:image': 'Open Graph image is required for social sharing',
    'og:url': 'Open Graph URL is required for social sharing',
    'twitter:card': 'Twitter card type is required for Twitter sharing',
    'twitter:image': 'Twitter image is required for Twitter sharing'
  }
  
  for (const [tag, message] of Object.entries(requirements)) {
    if (!metaTags[tag]) {
      issues.push(`❌ Missing ${tag}: ${message}`)
    } else {
      // Validate content
      if (tag === 'og:image' || tag === 'twitter:image') {
        if (!metaTags[tag].startsWith('http')) {
          issues.push(`⚠️  ${tag} should be a full URL: ${metaTags[tag]}`)
        }
      }
    }
  }
  
  if (expectedData) {
    if (metaTags['og:title'] && !metaTags['og:title'].includes(expectedData.title?.split(' ')[0])) {
      issues.push(`⚠️  Title mismatch - Expected: ${expectedData.title}, Got: ${metaTags['og:title']}`)
    }
  }
  
  return issues
}

async function testBlogPost(slug) {
  const url = `https://avablackwood.com/blog/${slug}`  // Change this to your actual domain
  const expectedData = getBlogPost(slug)
  
  console.log(`\n📝 Testing Blog Post: ${slug}`)
  console.log(`🔗 URL: ${url}`)
  console.log('=' .repeat(80))
  
  if (!expectedData) {
    console.log('❌ Blog post data not found in blogData.js')
    return
  }
  
  console.log(`📖 Expected Title: ${expectedData.title}`)
  console.log(`🖼️  Expected Image: ${expectedData.image}`)
  console.log(`📄 Expected Description: ${expectedData.description.substring(0, 100)}...`)
  
  for (const [platform, userAgent] of Object.entries(SOCIAL_USER_AGENTS)) {
    console.log(`\n🤖 Testing ${platform}:`)
    
    const response = await makeRequest(url, userAgent)
    
    if (response.error) {
      console.log(`   ❌ Error: ${response.error}`)
      continue
    }
    
    console.log(`   📊 Status: ${response.statusCode}`)
    console.log(`   🎯 Served by: ${response.headers['x-served-by'] || 'Unknown'}`)
    
    if (response.redirected) {
      console.log(`   🔄 Redirected (Status: ${response.statusCode})`)
      if (platform !== 'Regular Browser') {
        console.log(`   ⚠️  WARNING: Social crawler was redirected! This will break social sharing.`)
      }
      continue
    }
    
    const metaTags = extractMetaTags(response.body)
    const issues = validateSocialTags(metaTags, expectedData)
    
    // Key tags check
    const hasTitle = !!metaTags['og:title']
    const hasImage = !!metaTags['og:image']
    const hasDescription = !!metaTags['og:description']
    const hasUrl = !!metaTags['og:url']
    
    console.log(`   ✅ Title: ${hasTitle ? '✓' : '❌'} ${metaTags['og:title'] || 'Missing'}`)
    console.log(`   ✅ Image: ${hasImage ? '✓' : '❌'} ${metaTags['og:image'] || 'Missing'}`)
    console.log(`   ✅ Description: ${hasDescription ? '✓' : '❌'} ${metaTags['og:description']?.substring(0, 50) || 'Missing'}...`)
    console.log(`   ✅ URL: ${hasUrl ? '✓' : '❌'} ${metaTags['og:url'] || 'Missing'}`)
    
    if (issues.length > 0) {
      console.log(`   🔍 Issues found:`)
      issues.forEach(issue => console.log(`      ${issue}`))
    } else {
      console.log(`   🎉 All social media tags look good!`)
    }
  }
}

async function testImageAccess() {
  console.log('\n🖼️  Testing Image Access:')
  console.log('=' .repeat(50))
  
  const posts = getAllBlogPosts().slice(0, 3) // Test first 3 posts
  
  for (const post of posts) {
    const imageUrl = post.image.startsWith('http') ? post.image : `https://avablackwood.com${post.image}`
    console.log(`\n🖼️  Testing: ${imageUrl}`)
    
    const response = await makeRequest(imageUrl, SOCIAL_USER_AGENTS['Facebook'])
    
    if (response.error) {
      console.log(`   ❌ Error accessing image: ${response.error}`)
    } else if (response.statusCode === 200) {
      console.log(`   ✅ Image accessible (Status: 200)`)
      console.log(`   📏 Content-Length: ${response.headers['content-length'] || 'Unknown'}`)
      console.log(`   🎨 Content-Type: ${response.headers['content-type'] || 'Unknown'}`)
    } else {
      console.log(`   ❌ Image not accessible (Status: ${response.statusCode})`)
    }
  }
}

function displaySummary() {
  console.log('\n📋 Test Summary & Next Steps:')
  console.log('=' .repeat(50))
  console.log('1. ✅ Verify all social media crawlers receive proper meta tags')
  console.log('2. ✅ Verify regular browsers are redirected to your main site')
  console.log('3. ✅ Verify all images are accessible')
  console.log('4. 🧪 Test with actual social media validators:')
  console.log('   • Facebook: https://developers.facebook.com/tools/debug/')
  console.log('   • Twitter: https://cards-dev.twitter.com/validator')
  console.log('   • LinkedIn: https://www.linkedin.com/post-inspector/')
  console.log('\n💡 Pro Tips:')
  console.log('   • Clear social media caches if you make changes')
  console.log('   • Image dimensions should be 1200x630 for best results')
  console.log('   • Keep titles under 60 characters for Twitter')
  console.log('   • Keep descriptions under 160 characters')
}

// Main execution
async function runTests() {
  const args = process.argv.slice(2)
  const testSlug = args[0]
  
  console.log('🚀 Social Media Sharing Test Suite')
  console.log('==================================')
  
  if (testSlug) {
    // Test specific blog post
    await testBlogPost(testSlug)
  } else {
    // Test all blog posts
    const allPosts = getAllBlogPosts()
    console.log(`📚 Found ${allPosts.length} blog posts to test\n`)
    
    for (const post of allPosts.slice(0, 3)) { // Test first 3 posts
      await testBlogPost(post.slug)
      
      // Add small delay between tests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }
  
  // Test image accessibility
  await testImageAccess()
  
  // Display summary and next steps
  displaySummary()
}

// Error handling
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled rejection at:', promise, 'reason:', reason)
  process.exit(1)
})

// Run the tests
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(console.error)
}