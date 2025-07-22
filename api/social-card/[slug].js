// File: /api/social-card/[slug].js

// --- MODIFICATION: Change this import ---
import { sanityClientServer } from '../../src/sanity.server.js'; 

export default async function handler(req, res) {
  const { slug } = req.query;

  if (!slug) {
    return res.status(400).send('Missing slug');
  }

  try {
    // --- MODIFICATION: Use the server client ---
    const post = await sanityClientServer.fetch(
      `*[_type == "post" && slug.current == $slug][0]{
         title,
         "imageUrl": mainImage.asset->url
       }`,
      { slug }
    );
    
    // ... the rest of the file remains exactly the same
    if (!post) {
      return res.status(404).send('Post not found');
    }

    const finalUrl = `https://www.avablackwood.com/blog/${slug}`;

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
    console.error('Error fetching post from Sanity:', error);
    res.status(500).send('Internal Server Error');
  }
}