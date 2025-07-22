// File: /api/social-card/[slug].js

// You'll need to import your existing sanity client.
// Make sure the path is correct relative to the api folder.
import sanityClient from '../src/sanityClient.js'; 

export default async function handler(req, res) {
  // Get the slug from the request URL (e.g., "my-first-post")
  const { slug } = req.query;

  if (!slug) {
    return res.status(400).send('Missing slug');
  }

  try {
    // Fetch the post data from Sanity using the slug
    const post = await sanityClient.fetch(
      `*[_type == "post" && slug.current == $slug][0]{
         title,
         "imageUrl": mainImage.asset->url
       }`,
      { slug }
    );

    if (!post) {
      return res.status(404).send('Post not found');
    }

    // This is the final destination URL for real users
    const finalUrl = `https://www.avablackwood.com/blog/${slug}`;

    // We generate a simple HTML page with the necessary meta tags
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

    // Send the HTML response
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(html);
  } catch (error) {
    console.error('Error fetching post from Sanity:', error);
    res.status(500).send('Internal Server Error');
  }
}