// generatePost.mjs
import { createClient } from '@sanity/client';
import fetch from 'node-fetch';
import { appendFileSync } from 'fs'; // Import the file system module

// --- Configuration ---

const sanityClient = createClient({
  projectId: '8vo1vk23',
  dataset: 'production',
  apiVersion: '2024-07-18',
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
});

// --- Helper Function to create a URL-friendly slug ---
function createSlug(title) {
  return title
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w-]+/g, '') // Remove all non-word chars
    .replace(/--+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
}

// --- Main Script Logic ---

async function generateAndPublish() {
  console.log('Starting content generation process...');
  let postContent;

  // --- Part 1: Generate and Publish Blog Post to Sanity ---
  try {
    // 1a. Fetch the default author reference from Sanity
    console.log("Fetching default author 'Ava Blackwood'...");
    const authors = await sanityClient.fetch(`*[_type == "author" && name == "Ava Blackwood"]`);
    if (!authors || authors.length === 0) {
      throw new Error("Could not find author 'Ava Blackwood' in Sanity. Please create this author in the Studio.");
    }
    const authorRef = { _type: 'reference', _ref: authors[0]._id };
    console.log(`Found author with reference ID: ${authorRef._ref}`);

    // 1b. Generate blog content with AI
    console.log('Generating full blog post...');
    const blogPostPrompt = `
      You are Ava Blackwood, an author of dark academia and spicy romance novels.
      Your writing style is evocative, atmospheric, and explores themes of forbidden desire, power dynamics, and intellectual intimacy.
      Your tone is sophisticated, mysterious, and offers genuine insights into romance.
      Generate a new, unique blog post as a guide for real-world romance.
      It needs a catchy, intriguing title. The body should be 3-4 paragraphs long.
      Do not use markdown. The body must be a single block of text.
      Respond with a JSON object with two keys: "title" and "body".
    `;

    const aiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: blogPostPrompt }] }] }),
      }
    );

    if (!aiResponse.ok) throw new Error(`Gemini API Error: ${await aiResponse.text()}`);

    const aiResult = await aiResponse.json();
    const generatedText = aiResult.candidates[0].content.parts[0].text;
    const jsonString = generatedText.match(/```json\n([\s\S]*?)\n```/)[1];
    postContent = JSON.parse(jsonString);

    console.log(`Generated Blog Title: ${postContent.title}`);

    // 1c. Format the post document to match the Sanity schema
    const slug = createSlug(postContent.title);
    const postDocument = {
      _type: 'post',
      title: postContent.title,
      slug: { _type: 'slug', current: slug },
      author: authorRef,
      body: [{ _type: 'block', style: 'normal', children: [{ _type: 'span', text: postContent.body }] }],
      publishedAt: new Date().toISOString(),
    };

    console.log('Publishing document to Sanity with full schema...');
    const result = await sanityClient.create(postDocument);
    console.log('Successfully created Sanity post with ID:', result._id);
    
    // --- FIXED: Use the modern method for setting GitHub Actions outputs ---
    const GITHUB_OUTPUT = process.env.GITHUB_OUTPUT;
    if (GITHUB_OUTPUT) {
      appendFileSync(GITHUB_OUTPUT, `new_post_id=${result._id}\n`);
      console.log('Successfully set output for verification step.');
    }

  } catch (error) {
    console.error('Failed during blog post generation or publishing:', error);
    process.exit(1);
  }

  // --- Part 2: Generate Social Media Post and Send to Webhook ---
  if (postContent) {
    try {
      console.log('Generating social media post...');
      const socialPostPrompt = `
        You are a social media manager for romance author Ava Blackwood.
        Create a short, catchy social media post (for Twitter/X or Instagram) based on her latest blog post.
        The tone should be intriguing and sophisticated.
        Encourage people to read the full post (without explicitly saying "click the link").
        Include 3-4 relevant hashtags like #DarkAcademia, #SpicyRomance, #ForbiddenLove, #RomanceBooks, #AvaBlackwood.

        Blog Post Title: "${postContent.title}"
        Blog Post Body: "${postContent.body}"

        Based on this, generate a JSON object with one key: "social_post_text".
      `;

      const socialResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: socialPostPrompt }] }] }),
        }
      );

      if (!socialResponse.ok) throw new Error(`Gemini API Error: ${await socialResponse.text()}`);

      const socialResult = await socialResponse.json();
      const socialGeneratedText = socialResult.candidates[0].content.parts[0].text;
      const socialJsonString = socialGeneratedText.match(/```json\n([\s\S]*?)\n```/)[1];
      const socialPost = JSON.parse(socialJsonString);

      console.log('Generated Social Post:', socialPost.social_post_text);

      console.log('Sending post to social media webhook...');
      const webhookResponse = await fetch(process.env.SOCIAL_MEDIA_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: socialPost.social_post_text }),
      });

      if (!webhookResponse.ok) throw new Error(`Webhook failed with status: ${webhookResponse.status}`);
      
      console.log('Successfully sent post to webhook.');

    } catch (error) {
      console.error('Failed during social media post generation or webhook sending:', error);
    }
  }
}

generateAndPublish();