// generatePost.mjs
import { createClient } from '@sanity/client';
import fetch from 'node-fetch';
import { appendFileSync } from 'fs';

// --- Configuration --

const sanityClient = createClient({
  projectId: process.env.SANITY_PROJECT_ID,
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
  let plainTextBodyForSocial;
  let imageAsset;

  // --- Part 1: Generate Blog Post Text ---
  try {
    console.log('Generating rich, formatted blog post text...');
    const blogPostPrompt = `
  You are Ava Blackwood, an author of dark academia and spicy romance novels. Your style is evocative, atmospheric, and sensual, exploring themes of forbidden desire, power dynamics, and intellectual intimacy. Your tone is sophisticated and mysterious.

  Generate a new, unique blog post as a guide for real-world romance and intimacy. The post must have a catchy, provocative title and a structured body.

  **TITLE REQUIREMENTS:**
  The title must feel original, emotionally charged, and varied in structure. Do **not** reuse the same phrasing or templates across posts. Avoid overused patterns like "The Art of..." or "How to..." unless you are subverting them in a clever, poetic way.

  Vary the tone, rhythm, and form using one of the following styles:
  - metaphorical titles (e.g., "The Hunger Beneath the Silence")
  - poetic fragments (e.g., "When Fingers Hesitate")
  - emotionally charged imperatives (e.g., "Let Them Ache for You")
  - psychological or literary allusions (e.g., "Liminal Touch")
  - soft provocations or contradictions (e.g., "Undress Me With Words")

  Each title should reflect Ava Blackwood’s voice: refined, suggestive, and rich with emotional gravity.

  The body must be an array of JSON objects with this structure:
  - At least one "heading" of level 2.
  - One or two "paragraph" blocks with markdown for emphasis: **bold** for intense points and *italic* for sensual thoughts.
  - One "blockquote" for a powerful statement about desire.
  - One "list" with 3 bullet points for actionable, spicy advice.

  CRITICAL CONTENT REQUIREMENTS:
  1. Include one poetic metaphor for physical desire (e.g., "desire is a fever that breaks in the dark").
  2. Use one literary or psychological term to describe intimacy (e.g., "psychological resonance," "liminal space").
  3. **The final paragraph must describe a single, evocative, symbolic object or scene that captures the entire post's theme (e.g., a crimson lipstick stain on a porcelain coffee cup, a single black stocking draped over a leather-bound book). This will be used to generate an image.**

  The final output must be a single, valid JSON object with keys: "title" and "body".
  Example of a valid body structure:
  "body": [
    { "type": "heading", "level": 2, "content": "The Art of the Unraveling" },
    { "type": "paragraph", "content": "True intimacy isn't about control; it's about the exquisite moment of **surrender**. It’s the sharp intake of breath before a touch, the heat that blooms on the skin where fingers have lingered. *Desire is a fever that breaks in the dark*, leaving you remade." },
    { "type": "blockquote", "content": "The most seductive thing you can wear is the look in your eyes when you're about to lose control." },
    { "type": "list", "items": ["Use a whisper instead of a command.", "Trace the line of their collarbone with one finger.", "Describe what you want, leaving the how to their imagination."] }
  ]
`;


    const aiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: blogPostPrompt }] }] }),
    });

    if (!aiResponse.ok) throw new Error(`Gemini API Error (Text): ${await aiResponse.text()}`);
    const aiResult = await aiResponse.json();
    // ✅ Guard against missing or malformed content
    if (
      !aiResult?.candidates ||
      !aiResult.candidates[0]?.content?.parts ||
      !aiResult.candidates[0].content.parts[0]?.text
    ) {
      console.error("Invalid Gemini content response:", JSON.stringify(aiResult, null, 2));
      throw new Error("Gemini API response malformed or incomplete");
    }

    const generatedText = aiResult.candidates[0].content.parts[0].text;
    const jsonString = generatedText.match(/```json\n([\s\S]*?)\n```/)[1];
    postContent = JSON.parse(jsonString);
    console.log(`Generated Blog Title: ${postContent.title}`);
  } catch (error) {
    console.error('Failed during blog post text generation:', error);
    process.exit(1);
  }
  
  // --- Part 2: Generate Thematic Image ---
try {
  const symbolicParagraphs = postContent.body
    .filter(block => block.type === 'paragraph')
    .slice(-3)
    .map(block => block.content)
    .join(' ');

  const sensualObjects = [
    'a bitten fig on a velvet napkin',
    'a lace glove resting beside a crystal decanter',
    'a single black stocking draped over a candle stub',
    'a corset ribbon left untied on a leather-bound book',
    'a lipstick-smeared wine glass near torn poetry',
    'reading glasses tangled with a silk scarf',
    'a velvet choker coiled on a handwritten letter',
    'a single red rose on a bed of old parchment'
  ];
  const fallbackScene = sensualObjects[Math.floor(Math.random() * sensualObjects.length)];

  const matchedSymbol = symbolicParagraphs.match(/(a|an) ([^.]{10,80}?)[\.,;]/i);
  const imageSceneDescription = matchedSymbol ? matchedSymbol[0] : fallbackScene;

  const humanDetails = [
    'a bare shoulder touched by morning light',
    'a thigh emerging beneath a fallen silk slip',
    'fingers slipping slowly into a velvet glove',
    'a nape exposed as hair is gathered high',
    'lips parted under the flicker of candlelight',
    'knees drawn close beneath moonlit linen',
    'the hollow of a collarbone dusted with shimmer',
    'an ankle flexed as a heel dangles midair',
    'a curved back traced by strands of undone hair',
    'eyes glancing sideways in a mirror’s hush',
    'a wrist resting limp over tangled sheets',
    'hips shifting beneath a half-buttoned blouse',
    'a strand of pearls trailing down bare skin',
    'the pale inside of a forearm near red lipstick',
    'a flushed cheek brushing a crystal glass'
  ];
  const gestureDetail = humanDetails[Math.floor(Math.random() * humanDetails.length)];

  const safePrompt = `
Photorealistic still life, cinematic lighting, dark academia mood.
Focus: ${fallbackScene}.
Textural setting: antique books, silk, and shadow. 
No people, no body parts. Only suggestion through objects and mood.
No visible text or logos. Emotionally evocative, intimate, and poetic.
  `.trim();

  const primaryPrompt = `
Hyper-realistic with cinematic shadows and a shallow depth of field.  
A sensational, poetic, scene suffused with longing and quiet tension.  
Main focus: ${imageSceneDescription.trim()}, rendered as a subtle metaphor for restrained desire.  
Secondary detail: ${gestureDetail}, evoking intimacy through implication, never exposure.  
Style: Artful intimacy in soft, directional lighting—framed with European elegance and cinematic precision.  
No human figures. No visible text, letters, or watermarks.
  `.trim();

  console.log(`Generating image with primary prompt: "${primaryPrompt}"`);

  const tryImageGeneration = async (promptToTry) => {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        instances: [{ prompt: promptToTry }],
        parameters: {
          "sampleCount": 1,
          "aspectRatio": "16:9"
        }
      }),
    });
    return response.ok ? await response.json() : null;
  };

  let imageResult = await tryImageGeneration(primaryPrompt);
  if (!imageResult) {
    console.warn('Primary image prompt failed or was rejected. Trying safe fallback...');
    imageResult = await tryImageGeneration(safePrompt);
    if (!imageResult) throw new Error('Both primary and fallback prompts failed Gemini compliance.');
  }

  if (!imageResult?.predictions || imageResult.predictions.length === 0) {
    console.error("Image generation failed: no predictions returned.");
    console.log("Full response:", JSON.stringify(imageResult, null, 2));
    throw new Error("No image predictions available from Gemini.");
  }
  
  const base64ImageData = imageResult.predictions[0].bytesBase64Encoded;
 

  console.log('Image generated, now uploading to Sanity...');
  const imageBuffer = Buffer.from(base64ImageData, 'base64');
  imageAsset = await sanityClient.assets.upload('image', imageBuffer, {
    filename: `${createSlug(postContent.title)}.png`,
    contentType: 'image/png'
  });
  console.log('Successfully uploaded image asset with ID:', imageAsset._id);
} catch (error) {
  console.error('Failed during image generation or upload:', error);
  process.exit(1);
}


  // --- Part 3: Publish to Sanity & Social Media ---
  try {
    console.log("Fetching default author 'Ava Blackwood'...");
    const authors = await sanityClient.fetch(`*[_type == "author" && name == "Ava Blackwood"]`);
    if (!authors || authors.length === 0) throw new Error("Could not find author 'Ava Blackwood' in Sanity.");
    const authorRef = { _type: 'reference', _ref: authors[0]._id };

    const formattedBody = formatBodyForSanity(postContent.body);
    const slug = createSlug(postContent.title);
    
    const postDocument = {
      _type: 'post',
      title: postContent.title,
      slug: { _type: 'slug', current: slug },
      author: authorRef,
      mainImage: {
        _type: 'image',
        asset: {
          _type: 'reference',
          _ref: imageAsset._id
        }
      },
      body: formattedBody,
      publishedAt: new Date().toISOString(),
    };

    console.log('Publishing document with image to Sanity...');
    const result = await sanityClient.create(postDocument);
    const blogPostUrl = `https://www.avablackwood.com/blog/${slug}`;
    console.log('Successfully created Sanity post with ID:', result._id);
    
    const GITHUB_OUTPUT = process.env.GITHUB_OUTPUT;
    if (GITHUB_OUTPUT) {
      appendFileSync(GITHUB_OUTPUT, `new_post_id=${result._id}\n`);
      console.log('Successfully set output for verification step.');
    }

    // --- Part 4: Social Media Post Generation ---
    plainTextBodyForSocial = postContent.body.map(block => block.content || (block.items && block.items.join(' '))).join('\n');
    
    console.log('Generating social media post...');
    const socialPostPrompt = `
      You are a social media manager for spicy romance author Ava Blackwood.
      Create a short, catchy, and intriguing social media post based on her latest blog post.
      The tone should be sophisticated and tempting.
      Hint at the spicy advice in the post to encourage clicks.
      *** Include this link at the end: [Link to blog post]
      Include 3 relevant hashtags like #SpicyRomance, #RomanceAuthor, #AvaBlackwood.
      *** Keep the output text under 280 characters for posting on X.

      Blog Post Title: "${postContent.title}"
      Blog Post Content Summary: "${plainTextBodyForSocial}"

      Based on this, generate a JSON object with one key: "social_post_text".
    `;

    const socialResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: socialPostPrompt }] }] }),
    });

    if (!socialResponse.ok) throw new Error(`Gemini API Error (Social): ${await socialResponse.text()}`);
    
    const socialResult = await socialResponse.json();
    const socialGeneratedText = socialResult.candidates[0].content.parts[0].text;
    const socialJsonString = socialGeneratedText.match(/```json\n([\s\S]*?)\n```/)[1];
    const socialPost = JSON.parse(socialJsonString);
    if (socialPost.social_post_text.includes('[Link to blog post]')) {
      socialPost.social_post_text = socialPost.social_post_text.replace('[Link to blog post]', blogPostUrl);
    } else {
      const withLink = `${socialPost.social_post_text} ${blogPostUrl}`;
      socialPost.social_post_text = withLink.length <= 280 ? withLink : socialPost.social_post_text;
    }
    
    
    console.log('Generated Social Post:', socialPost.social_post_text);
    
    if (process.env.SOCIAL_MEDIA_WEBHOOK_URL) {
      console.log('Sending post to social media webhook...');
      
      // ✨ --- REVISED PAYLOAD --- ✨
      // The payload now includes both the text and the public URL of the image from Sanity.
      const webhookPayload = {
        text: socialPost.social_post_text,
        image_url: imageAsset.url, // The public URL from the Sanity asset object
        slug: slug
      };

      // ✨ Note: The key 'image_url' is a common convention for services like Zapier or IFTTT.
      // You may need to change this key to 'media_url', 'picture', 'photo_url', etc.,
      // depending on the requirements of your specific webhook receiver.

      const webhookResponse = await fetch(process.env.SOCIAL_MEDIA_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(webhookPayload),
      });
    
      if (!webhookResponse.ok) {
        console.warn(`Webhook failed with status: ${webhookResponse.status}`);
      } else {
        console.log('Successfully sent post with image to webhook.');
      }
    } else {
      console.log('SOCIAL_MEDIA_WEBHOOK_URL not set. Skipping social media post.');
    }

  } catch (error) {
    console.error('Failed during final publishing/social media steps:', error);
  }
}

generateAndPublish();