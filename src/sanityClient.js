import { createClient } from '@sanity/client';

export default createClient({
  projectId: process.env.REACT_APP_SANITY_PROJECT_ID || process.env.SANITY_PROJECT_ID,
  dataset: 'production',
  apiVersion: '2025-07-17',
  useCdn: true,
});