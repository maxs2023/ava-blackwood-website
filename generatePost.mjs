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
    You are **Ava Blackwood**, an author of dark academia and sensual romance. Your prose is evocative, mysterious, and magnetic—laced with *forbidden longing, power play, and intellectual seduction*. You understand that intimacy lives not just in the body, but in the pause between words, the gaze that lingers too long, and the secrets we yearn to speak but never do.

    ---

    **TASK:**  
    Write a **new, original blog post** that reads as a **guide to real-world romance and intimacy**, framed in Ava’s voice. It must include:

    - A **catchy, emotionally resonant, and provocative title**
    - A structured **JSON body** with the following format  
    - An **evocative, sensual image description** in the final paragraph, which will drive AI image generation

    ---

    **TITLE REQUIREMENTS:**
    Each title must reflect Ava Blackwood’s literary, sensual tone. It should feel **refined, emotionally potent, and artistically composed**, never formulaic. Avoid overused formats unless you're **intentionally subverting** them.

    Try one of these styles:
    - **Metaphorical**: “The Taste of a Lie Between the Sheets”
    - **Poetic Fragments**: “When Thighs Betray the Mind”
    - **Emotional Imperatives**: “Let Them Ache for You”
    - **Literary/Psychological Allusions**: “The Pleasure Principle Rewritten”
    - **Sensual Contradictions**: “Bare Without Touch”

    ---

    **BODY FORMAT:**
    Output the body as a JSON array with **at least one of each** of the following:

    - { "type": "heading", "level": 2, "content": "..." }
    - { "type": "paragraph", "content": "..." } (1–2 total, use **bold** and *italic* for emphasis)
    - { "type": "blockquote", "content": "..." } (1 max)
    - { "type": "list", "items": ["...", "...", "..."] } (spicy, actionable)

    **Mandatory creative content within the body:**
    1. One **poetic metaphor** for physical desire (e.g., *“desire is a fever that blooms beneath the ribs”*)
    2. One **literary or psychological term** describing intimacy (e.g., *"transference," "liminal space," "interpersonal mirroring"*)
    3. A **final paragraph** featuring a **single, symbolic, sensual image**—this should be **either a human detail** (e.g., a woman’s back in silk, parted lips in candlelight) or a **symbolic object** (e.g., a velvet ribbon on a leather journal, a silk glove on marble)

    ---

    **IMAGE PROMPT:**
    From the final paragraph, extract this JSON key:
    \`\`\`json
    "image_prompt": "A [object or sensual detail] [setting or texture], under 15 words"
    \`\`\`
    Examples:
    - "A single black stocking draped over a velvet armchair"
    - "A woman’s bare back, bathed in golden candlelight"
    - "Silk gloves resting on an open book with red wine stains"

    ---

    **FINAL OUTPUT FORMAT**
    Return one **valid JSON object** with keys:
    - "title": the blog post title
    - "body": the JSON array of structured blocks
    - "image_prompt": the visual scene
    `.trim();


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
    // Use the new, dedicated image prompt from the AI response.
    const imageSceneDescription = postContent.image_prompt;

    if (!imageSceneDescription) {
      throw new Error("AI response did not include the required 'image_prompt' field.");
    }
    
    const primaryPrompt = `
      Photorealistic still life, dark academia aesthetic, cinematic lighting with deep shadows.
      Focus on: ${imageSceneDescription}.
      The scene should feel intimate, evocative, and poetic.
      No people, no text, no logos. Emphasis on texture and mood.
    `.trim();

    console.log(`Generating image with prompt: "${primaryPrompt}"`);

    let base64ImageData;
    let imageGenerated = false;

    // Try OpenAI DALL-E first
    if (process.env.OPENAI_API_KEY) {
      try {
        console.log('🎨 Attempting image generation with OpenAI DALL-E...');
        
        const openaiResponse = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: 'dall-e-3',
            prompt: primaryPrompt,
            n: 1,
            size: '1792x1024',
            response_format: 'b64_json',
            quality: 'hd'
          })
        });

        if (openaiResponse.ok) {
          const openaiResult = await openaiResponse.json();
          if (openaiResult?.data?.[0]?.b64_json) {
            base64ImageData = openaiResult.data[0].b64_json;
            imageGenerated = true;
            console.log('✅ Image successfully generated with OpenAI DALL-E');
          }
        } else {
          const errorText = await openaiResponse.text();
          console.warn('⚠️ OpenAI DALL-E failed:', errorText);
        }
      } catch (openaiError) {
        console.warn('⚠️ OpenAI DALL-E error:', openaiError.message);
      }
    } else {
      console.log('⚠️ OPENAI_API_KEY not found, skipping OpenAI image generation');
    }

    // Fallback to Gemini if OpenAI failed
    if (!imageGenerated && process.env.GEMINI_API_KEY) {
      try {
        console.log('🔄 Falling back to Gemini Imagen...');
        
        const imageResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${process.env.GEMINI_API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            instances: [{ prompt: primaryPrompt }],
            parameters: {
              "sampleCount": 1,
              "aspectRatio": "16:9"
            }
          }),
        });
        
        if (imageResponse.ok) {
          const imageResult = await imageResponse.json();
          if (imageResult?.predictions?.[0]?.bytesBase64Encoded) {
            base64ImageData = imageResult.predictions[0].bytesBase64Encoded;
            imageGenerated = true;
            console.log('✅ Image successfully generated with Gemini Imagen (fallback)');
          }
        } else {
          const errorText = await imageResponse.text();
          console.error("❌ Gemini Imagen fallback failed:", errorText);
        }
      } catch (geminiError) {
        console.error('❌ Gemini fallback error:', geminiError.message);
      }
    }

    if (!imageGenerated) {
      throw new Error("Both OpenAI and Gemini image generation failed");
    }

    console.log('📤 Uploading generated image to Sanity...');
    const imageBuffer = Buffer.from(base64ImageData, 'base64');
    imageAsset = await sanityClient.assets.upload('image', imageBuffer, {
      filename: `${createSlug(postContent.title)}.png`,
      contentType: 'image/png'
    });
    console.log('✅ Successfully uploaded image asset with ID:', imageAsset._id);
  } catch (error) {
    console.error('❌ Failed during image generation or upload:', error);
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