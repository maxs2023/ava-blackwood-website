// src/sanity.server.js
import { createClient } from '@sanity/client';

// These variables MUST be set in your Vercel project settings
const projectId = process.env.SANITY_PROJECT_ID;
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || !token) {
  throw new Error('Missing SANITY_PROJECT_ID or SANITY_API_WRITE_TOKEN in environment variables.');
}

// This is a server-side only client
export const sanityClientServer = createClient({
  projectId,
  dataset: 'production',
  apiVersion: '2024-07-18',
  useCdn: false, // Server-side should always get fresh data
  token, // Use the API token for authenticated requests
});