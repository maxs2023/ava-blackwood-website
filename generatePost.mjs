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

// --- Helper Functions ---

function createSlug(title) {
  return title
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

// Helper function to generate a short, unique key
function generateKey(length = 12) {
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

/**
 * This function converts the AI's structured response into
 * Sanity's Portable Text format, including rich formatting and unique keys.
 */
function formatBodyForSanity(bodyArray) {
  const portableTextBody = [];

  // Helper to parse **bold** and *italic* text from a string
  const parseInlineFormatting = (text) => {
    const children = [];
    // Regex to find **bold** or *italic* text
    const regex = /(\*\*.*?\*\*)|(\*.*?\*)/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      // Add plain text before the match
      if (match.index > lastIndex) {
        children.push({ _type: 'span', text: text.substring(lastIndex, match.index), _key: generateKey() });
      }
      
      const matchedText = match[0];
      const marks = [];
      let content = '';

      if (matchedText.startsWith('**')) {
        marks.push('strong');
        content = matchedText.substring(2, matchedText.length - 2);
      } else if (matchedText.startsWith('*')) {
        marks.push('em');
        content = matchedText.substring(1, matchedText.length - 1);
      }
      
      children.push({ _type: 'span', text: content, marks, _key: generateKey() });
      lastIndex = regex.lastIndex;
    }

    // Add any remaining plain text
    if (lastIndex < text.length) {
      children.push({ _type: 'span', text: text.substring(lastIndex), _key: generateKey() });
    }
    
    return children;
  };

  for (const block of bodyArray) {
    switch (block.type) {
      case 'heading':
        portableTextBody.push({
          _type: 'block',
          style: `h${block.level || 2}`,
          _key: generateKey(),
          children: [{ _type: 'span', text: block.content, _key: generateKey() }],
        });
        break;
      case 'paragraph':
        portableTextBody.push({
          _type: 'block',
          style: 'normal',
          _key: generateKey(),
          children: parseInlineFormatting(block.content),
        });
        break;
      case 'blockquote':
         portableTextBody.push({
          _type: 'block',
          style: 'blockquote',
          _key: generateKey(),
          children: [{ _type: 'span', text: block.content, _key: generateKey() }],
        });
        break;
      case 'list':
        for (const item of block.items) {
          portableTextBody.push({
            _type: 'block',
            style: 'normal',
            listItem: 'bullet',
            level: 1,
            _key: generateKey(),
            children: parseInlineFormatting(item),
          });
        }
        break;
    }
  }
  return portableTextBody;
}

// --- Main Script Logic ---

async function generateAndPublish() {
  console.log('Starting content generation process...');
  let postContent;
  let plainTextBodyForSocial;

  // --- Part 1: Generate and Publish Blog Post to Sanity ---
  try {
    console.log("Fetching default author 'Ava Blackwood'...");
    const authors = await sanityClient.fetch(`*[_type == "author" && name == "Ava Blackwood"]`);
    if (!authors || authors.length === 0) {
      throw new Error("Could not find author 'Ava Blackwood' in Sanity.");
    }
    const authorRef = { _type: 'reference', _ref: authors[0]._id };
    console.log(`Found author with reference ID: ${authorRef._ref}`);

    console.log('Generating rich, formatted blog post...');
    // --- UPDATED PROMPT ---
    // This new prompt incorporates the feedback for richer, more thematic content.
    const blogPostPrompt = `
      You are Ava Blackwood, an author of dark academia and **spicy romance** novels.
      Your writing style is evocative, atmospheric, and sensual. It explores themes of forbidden desire, power dynamics, intellectual intimacy, and raw vulnerability.
      Your tone is sophisticated and mysterious, offering genuine insights into the **psychology of intense passion**.

      Generate a new, unique blog post as a guide for real-world romance and intimacy.
      The post must have a catchy, provocative title.
      The body must be an array of JSON objects, following this structure:
      - Use at least one "heading" of level 2.
      - Use multiple "paragraph" blocks. In these paragraphs, use evocative language focusing on **sensory details** (the scent of skin, the heat of a touch, a sharp intake of breath) and the **emotional aftermath of intimacy**. Use markdown for emphasis: **bold** for intense points and *italic* for sensual thoughts.
      - Include one "blockquote" for a powerful, slightly risqué statement about desire.
      - Include one "list" with at least 3 bullet points for actionable, spicy advice.

      CRITICAL CONTENT REQUIREMENTS:
      1. The post must include at least one poetic metaphor for physical desire (e.g., "desire is a fever that breaks in the dark").
      2. The post must use sophisticated language to describe the **tension and release** inherent in a passionate connection, without using explicit terms. Focus on the *feeling*, not the act.

      The final output must be a single, valid JSON object with two keys: "title" and "body".
      Example of a valid body structure:
      "body": [
        { "type": "heading", "level": 2, "content": "The Art of the Unraveling" },
        { "type": "paragraph", "content": "True intimacy isn't about control; it's about the exquisite moment of **surrender**. It’s the sharp intake of breath before a touch, the heat that blooms on the skin where fingers have lingered. *Desire is a fever that breaks in the dark*, leaving you remade." },
        { "type": "blockquote", "content": "The most seductive thing you can wear is the look in your eyes when you're about to lose control." },
        { "type": "list", "items": ["Use a whisper instead of a command.", "Trace the line of their collarbone with one finger.", "Describe what you want, leaving the how to their imagination."] }
      ]
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
    
    // Convert the structured body into Sanity's Portable Text format
    const formattedBody = formatBodyForSanity(postContent.body);
    
    // Create a plain text version for the social media prompt
    plainTextBodyForSocial = postContent.body.map(block => block.content || (block.items && block.items.join(' '))).join('\n');

    const slug = createSlug(postContent.title);
    const postDocument = {
      _type: 'post',
      title: postContent.title,
      slug: { _type: 'slug', current: slug },
      author: authorRef,
      body: formattedBody, // Use the new richly formatted body
      publishedAt: new Date().toISOString(),
    };

    console.log('Publishing document to Sanity with full schema...');
    const result = await sanityClient.create(postDocument);
    console.log('Successfully created Sanity post with ID:', result._id);
    
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
        Create a short, catchy social media post based on her latest blog post.
        The tone should be intriguing and sophisticated.
        Encourage people to read the full post on the blog.
        Include 3-4 relevant hashtags like #DarkAcademia, #SpicyRomance, #ForbiddenLove, #RomanceBooks, #AvaBlackwood.

        Blog Post Title: "${postContent.title}"
        Blog Post Content Summary: "${plainTextBodyForSocial}"

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