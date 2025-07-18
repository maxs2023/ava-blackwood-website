import { createClient } from '@sanity/client';
import fetch from 'node-fetch';
import { appendFileSync } from 'fs';

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
  return title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
}

function generateKey(length = 12) {
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

function formatBodyForSanity(bodyArray) {
  const portableTextBody = [];
  const parseInlineFormatting = (text) => {
    const children = [];
    const regex = /(\*\*.*?\*\*)|(\*.*?\*)/g;
    let lastIndex = 0;
    let match;
    while ((match = regex.exec(text)) !== null) {
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
    if (lastIndex < text.length) {
      children.push({ _type: 'span', text: text.substring(lastIndex), _key: generateKey() });
    }
    return children;
  };

  for (const block of bodyArray) {
    const blockKey = generateKey();
    switch (block.type) {
      case 'heading':
        portableTextBody.push({
          _type: 'block',
          style: `h${block.level || 2}`,
          _key: blockKey,
          children: [{ _type: 'span', text: block.content, _key: generateKey() }],
        });
        break;
      case 'paragraph':
        portableTextBody.push({
          _type: 'block',
          style: 'normal',
          _key: blockKey,
          children: parseInlineFormatting(block.content),
        });
        break;
      case 'blockquote':
        portableTextBody.push({
          _type: 'block',
          style: 'blockquote',
          _key: blockKey,
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
  let imageAsset;

  // --- Part 1: Generate Blog Post Text via Gemini ---
  try {
    console.log('Generating blog post with Gemini...');
    const blogPostPrompt = `You are Ava Blackwood, an author of dark academia and spicy romance novels...`; // Your actual blog prompt

    const aiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: blogPostPrompt }] }] }),
    });

    if (!aiResponse.ok) throw new Error(`Gemini API Error (Text): ${await aiResponse.text()}`);
    const aiResult = await aiResponse.json();
    const generatedText = aiResult.candidates[0].content.parts[0].text;
    const jsonString = generatedText.match(/```json\n([\s\S]*?)\n```/)[1];
    postContent = JSON.parse(jsonString);
    console.log(`Generated Blog Title: ${postContent.title}`);
  } catch (error) {
    console.error('Failed during blog post text generation:', error);
    process.exit(1);
  }

  // --- Part 2: Generate Image with Fallback using OpenAI DALL·E 3 ---
  try {
    const lastParagraphs = postContent.body
      .filter(block => block.type === 'paragraph')
      .slice(-3)
      .map(block => block.content)
      .join(' ');

    const sensualObjects = [
      'a bitten fig on a velvet napkin',
      'a black lace glove beside a crystal glass',
      'a silk ribbon tangled on a closed book',
      'a lipstick-smeared wine glass near torn poetry',
      'a velvet choker coiled around a dried rose',
    ];
    const fallbackScene = sensualObjects[Math.floor(Math.random() * sensualObjects.length)];
    const matchedSymbol = lastParagraphs.match(/(a|an) ([^.]{10,80}?)[\.,;]/i);
    const sceneDescription = matchedSymbol ? matchedSymbol[0] : fallbackScene;

    const humanDetails = [
      'a woman’s silhouette behind sheer curtains',
      'a wrist wrapped in lace',
      'fingers tracing a dusty bookshelf',
      'a collarbone lit by candlelight',
    ];
    const gestureDetail = humanDetails[Math.floor(Math.random() * humanDetails.length)];

    let imagePrompt = `
Dark-academia sensual still life in cinematic shadowed light.
Scene: ${sceneDescription.trim()} with ${gestureDetail}, softly implied.
Elements: candlelight, velvet, leather-bound books, silk, shadows.
Moody and atmospheric. No nudity, no explicit content, no text.
`.trim();

    let imageUrl;
    let dalleResponse = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        prompt: imagePrompt,
        n: 1,
        size: "1024x1024",
        model: "dall-e-3"
      }),
    });

    let dalleResult = await dalleResponse.json();
    if (dalleResult?.data?.[0]?.url) {
      imageUrl = dalleResult.data[0].url;
    } else {
      console.warn("Primary prompt failed. Using fallback image prompt...");
      const fallbackPrompt = `
Still life in dark academia style. A closed book on a velvet cloth beside a flickering candle. A single silk glove rests nearby. No people. Poetic atmosphere.
      `.trim();

      dalleResponse = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          prompt: fallbackPrompt,
          n: 1,
          size: "1024x1024",
          model: "dall-e-3"
        }),
      });

      const fallbackResult = await dalleResponse.json();
      if (!fallbackResult?.data?.[0]?.url) throw new Error("Fallback prompt failed.");
      imageUrl = fallbackResult.data[0].url;
    }

    const imageDownloadResponse = await fetch(imageUrl);
    if (!imageDownloadResponse.ok) throw new Error(`Failed to download image from: ${imageUrl}`);
    const imageBuffer = await imageDownloadResponse.arrayBuffer();

    console.log("Uploading image to Sanity...");
    imageAsset = await sanityClient.assets.upload("image", Buffer.from(imageBuffer), {
      filename: `${createSlug(postContent.title)}.png`,
      contentType: "image/png"
    });
    console.log("Image uploaded successfully. Asset ID:", imageAsset._id);
  } catch (error) {
    console.error("Image generation/upload failed:", error);
    process.exit(1);
  }

  // --- Part 3: Publish post and image (your existing logic here) ---
}

generateAndPublish();
