// File: /api/social-card/[slug].js
import { sanityClientServer } from '../../src/sanity.server.js'; 

export default async function handler(req, res) {
  const { slug } = req.query;

  // --- DEBUG LOG 1 --
  console.log(`Step 1: Function triggered for slug: ${slug}`);

  if (!slug) {
    return res.status(400).send('Missing slug');
  }

  try {
    const post = await sanityClientServer.fetch(
      `*[_type == "post" && slug.current == $slug][0]{
         title,
         "imageUrl": mainImage.asset->url
       }`,
      { slug }
    );

    // --- DEBUG LOG 2 ---
    console.log('Step 2: Post data received from Sanity:', JSON.stringify(post, null, 2));

    if (!post) {
      // --- DEBUG LOG 3 ---
      console.log('Step 3: Post not found for this slug. The function will now exit with a 404.');
      return res.status(404).send('Post not found');
    }

    const finalUrl = `https://www.avablackwood.com/blog/${slug}`;
    
    // --- DEBUG LOG 4 ---
    console.log('Step 4: Post found! Generating and sending HTML redirect page.');

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta http-equiv="X-UA-Compatible" content="IE=edge" />
          <title>${post.title}</title>
          
          <meta property="og:title" content="${post.title}" />
          <meta property="og:type" content="article" />
          <meta property="og:url" content="${finalUrl}" />
          <meta property="og:image" content="${post.imageUrl}" />
          <meta name="twitter:card" content="summary_large_image">
          
          <meta http-equiv="refresh" content="0;url=${finalUrl}" />
          <script type="text/javascript">
            window.location.href = "${finalUrl}";
          </script>
        </head>
        <body>
          <p>Redirecting you to the post...</p>
        </body>
      </html>
    `;

    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(html);
  } catch (error) {
    // This will now catch any other errors
    console.error('CRITICAL ERROR:', error);
    res.status(500).send('Internal Server Error');
  }
}