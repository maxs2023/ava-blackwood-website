# 🚀 Ava Blackwood Website - Deployment Instructions

## 📋 Prerequisites

Before deploying, ensure you have:
- Domain name (avablackwood.com) purchased and configured
- Cloudflare account with domain added
- Resend account created and domain verified
- GitHub account for code hosting

## 🔧 Environment Setup

### 1. Create Environment Variables

Create a `.env.local` file in the project root:

```bash
# Resend API Configuration
REACT_APP_RESEND_API_KEY=re_your_actual_api_key_here

# Email Configuration (Optional - defaults are set)
REACT_APP_FROM_EMAIL=contact@avablackwood.com
REACT_APP_TO_EMAIL=contact@avablackwood.com
REACT_APP_NEWSLETTER_FROM=newsletter@avablackwood.com

# Website Configuration (Optional)
REACT_APP_SITE_URL=https://www.avablackwood.com
REACT_APP_SITE_NAME=Ava Blackwood - Dark Academia Romance Author
```

### 2. Get Your Resend API Key

1. Log into your Resend dashboard
2. Go to "API Keys" section
3. Create a new API key named "Author Website"
4. Copy the key (starts with "re_")
5. Replace `re_your_actual_api_key_here` in your `.env.local` file

## 🛠️ Local Development

### Install Dependencies
```bash
npm install
# or
pnpm install
```

### Run Development Server
```bash
npm run dev
# or
pnpm run dev
```

### Test Email Functionality
1. Open the website locally (usually http://localhost:5173)
2. Navigate to the Contact page
3. Fill out and submit the contact form
4. Check your email for the contact form submission
5. Test newsletter signup on any page
6. Verify welcome email is received

## 🌐 Deployment Options

### Option 1: Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Add email functionality"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Go to vercel.com and sign in with GitHub
   - Click "New Project"
   - Import your repository
   - Add environment variables in Vercel dashboard:
     - `REACT_APP_RESEND_API_KEY` = your Resend API key
   - Deploy

3. **Configure Custom Domain**
   - In Vercel project settings, go to "Domains"
   - Add `www.avablackwood.com`
   - Follow DNS configuration instructions

### Option 2: Netlify

1. **Build the Project**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify**
   - Go to netlify.com and sign in
   - Drag and drop the `dist` folder to deploy
   - Or connect GitHub repository for automatic deployments

3. **Add Environment Variables**
   - In Netlify dashboard, go to Site Settings → Environment Variables
   - Add `REACT_APP_RESEND_API_KEY` with your API key

4. **Configure Custom Domain**
   - In Netlify dashboard, go to Domain Settings
   - Add custom domain `www.avablackwood.com`

### Option 3: GitHub Pages

1. **Install gh-pages**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Update package.json**
   Add to scripts section:
   ```json
   "predeploy": "npm run build",
   "deploy": "gh-pages -d dist"
   ```

3. **Deploy**
   ```bash
   npm run deploy
   ```

   Note: GitHub Pages doesn't support environment variables, so you'll need to hardcode the API key or use a different deployment method.

## 🔗 DNS Configuration

### Cloudflare DNS Settings

Ensure these records are configured in Cloudflare:

| Type | Name | Content | Purpose |
|------|------|---------|---------|
| A | @ | [Your hosting IP] | Root domain |
| CNAME | www | @ | WWW subdomain |
| MX | @ | route.mx.cloudflare.net | Email routing |
| TXT | @ | v=spf1 include:_spf.mx.cloudflare.net include:spf.resend.com ~all | SPF record |
| TXT | resend._domainkey | [DKIM key from Resend] | Email authentication |
| TXT | _dmarc | v=DMARC1; p=quarantine; rua=mailto:contact@avablackwood.com | DMARC policy |

## ✅ Post-Deployment Checklist

### Website Functionality
- [ ] Website loads correctly at www.avablackwood.com
- [ ] All pages navigate properly (Home, Books, About, Blog, Contact)
- [ ] Responsive design works on mobile and desktop
- [ ] Book links redirect to Amazon correctly
- [ ] Images load properly

### Email Functionality
- [ ] Contact form submits successfully
- [ ] Contact emails arrive at contact@avablackwood.com
- [ ] Newsletter signup works
- [ ] Welcome emails are sent to subscribers
- [ ] Emails don't go to spam folder
- [ ] Email formatting looks professional

### Performance
- [ ] Page load times are fast (< 3 seconds)
- [ ] Images are optimized
- [ ] No console errors in browser
- [ ] SEO meta tags are present

## 🔧 Troubleshooting

### Email Issues

**Emails not sending:**
- Check API key is correct in environment variables
- Verify domain is verified in Resend dashboard
- Check browser console for error messages

**Emails going to spam:**
- Verify SPF, DKIM, and DMARC records in Cloudflare
- Check email content for spam trigger words
- Warm up domain by sending emails gradually

**Contact form not working:**
- Check network tab in browser developer tools
- Verify API key has correct permissions
- Test with a simple email first

### Deployment Issues

**Build failures:**
- Check all dependencies are installed
- Verify environment variables are set
- Check for TypeScript/JavaScript errors

**Domain not working:**
- Verify DNS records are correct
- Wait for DNS propagation (up to 24 hours)
- Check domain is pointed to correct hosting service

## 📊 Monitoring

### Email Analytics
- Monitor email delivery rates in Resend dashboard
- Track open rates and engagement
- Watch for bounce rates and spam complaints

### Website Analytics
- Set up Google Analytics (optional)
- Monitor page views and user behavior
- Track contact form submissions and newsletter signups

## 🔄 Updates and Maintenance

### Adding New Books
1. Edit the `booksData` object in `src/App.jsx`
2. Add book cover images to `src/assets/`
3. Update book information and Amazon links
4. Test locally, then deploy

### Email Template Updates
1. Modify templates in `src/services/emailService.js`
2. Test email sending locally
3. Deploy changes

### Content Updates
1. Update text content in respective page components
2. Test changes locally
3. Deploy to production

## 🎯 Success Metrics

After successful deployment, you should have:
- Professional author website at www.avablackwood.com
- Functional contact form with email notifications
- Newsletter signup with automated welcome emails
- Professional email addresses (contact@, newsletter@, etc.)
- Mobile-responsive design
- Fast loading times
- SEO-optimized content

Your website is now ready to serve as your professional author platform! 🌟

