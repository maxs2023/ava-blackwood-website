import { createClient } from '@sanity/client';

export default createClient({
  // Find this in your sanity.config.js file or at manage.sanity.io
  projectId: '2f58nbxb', 
  
  // The name of your dataset, usually "production"
  dataset: 'production', 
  
  // Use the current date for the API version
  apiVersion: '2025-07-17', 
  
  // Set to `true` for faster 'read' performance
  useCdn: true, 
});