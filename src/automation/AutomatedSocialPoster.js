// src/automation/AutomatedSocialPoster.js
import sanityClient from './sanityClient.js';

class AutomatedSocialPoster {
  constructor(config = {}) {
    this.config = {
      baseUrl: 'https://www.avablackwood.com',
      zapierWebhookUrl: config.zapierWebhookUrl || process.env.ZAPIER_WEBHOOK_URL,
      twitterApiKey: config.twitterApiKey || process.env.TWITTER_API_KEY,
      twitterApiSecret: config.twitterApiSecret || process.env.TWITTER_API_SECRET,
      twitterAccessToken: config.twitterAccessToken || process.env.TWITTER_ACCESS_TOKEN,
      twitterAccessTokenSecret: config.twitterAccessTokenSecret || process.env.TWITTER_ACCESS_TOKEN_SECRET,
      ...config
    };
  }

  // [Copy the rest of the AutomatedSocialPoster class from automated_social_posting.js]
  // ... (all the methods from the previous file)
}

export default AutomatedSocialPoster;