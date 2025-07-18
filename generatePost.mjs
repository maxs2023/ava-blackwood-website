// verifyPost.mjs
import { createClient } from '@sanity/client';

// This script uses a read-only token for security
const sanityClient = createClient({
  projectId: '8vo1vk23',
  dataset: 'production',
  apiVersion: '2024-07-18',
  useCdn: false,
  token: process.env.SANITY_API_READ_TOKEN, // A secret token with read-only permissions
});

async function verifyPost() {
  const postId = process.env.NEW_POST_ID;
  if (!postId) {
    console.error('Error: No post ID provided to verify.');
    process.exit(1);
  }

  console.log(`Verifying post with ID: ${postId}...`);

  try {
    const post = await sanityClient.getDocument(postId);

    if (!post) {
      throw new Error('Post document was not found in Sanity.');
    }

    // --- Verification Checks ---
    let errors = [];
    if (!post.title) errors.push('Missing title');
    if (!post.slug || !post.slug.current) errors.push('Missing slug');
    if (!post.author || !post.author._ref) errors.push('Missing author reference');
    if (!post.body || post.body.length === 0) errors.push('Missing body content');
    if (!post.publishedAt) errors.push('Missing publishedAt date');

    if (errors.length > 0) {
      throw new Error(`Verification failed. The post has schema errors: ${errors.join(', ')}`);
    }

    console.log('Verification successful! The post matches the required schema.');
    console.log(`Title: ${post.title}`);
    console.log(`Slug: ${post.slug.current}`);
    console.log(`Author Ref: ${post.author._ref}`);

  } catch (error) {
    console.error('An error occurred during verification:', error);
    process.exit(1);
  }
}

verifyPost();
