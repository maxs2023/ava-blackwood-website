import { createClient } from '@sanity/client';

export default createClient({
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID || 
             import.meta.env.REACT_APP_SANITY_PROJECT_ID || 
             '8vo1vk23', // fallback
  dataset: 'production',
  apiVersion: '2025-07-17',
  useCdn: true,
});