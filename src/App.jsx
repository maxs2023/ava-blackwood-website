import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { BookOpen, Mail, ExternalLink, Calendar, User, Heart, Send } from 'lucide-react'
import './App.css'

// --- Analytics Component ---
const Analytics = () => {
  // IMPORTANT: Replace with your actual Google Analytics Measurement ID
  const GA_MEASUREMENT_ID = 'G-CLVD5YQKWB';

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' || window.gtag) {
      return;
    }
    const script = document.createElement('script');
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    script.async = true;
    document.head.appendChild(script);
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', GA_MEASUREMENT_ID);
  }, []);

  return null;
};

const trackEvent = (eventName, eventParams) => {
  if (window.gtag) {
    window.gtag('event', eventName, eventParams);
  } else {
    console.log(`Analytics event (not sent): ${eventName}`, eventParams);
  }
};

// --- Helper Functions ---
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const sanitizeInput = (input) => {
  if (typeof input !== 'string') return '';
  const scriptRegex = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
  return input.trim().replace(scriptRegex, '');
};


// --- Sample Book Data ---
const booksData = {
  darkAcademia: [
    { id: 1, title: "Playing with Fire", description: "Delve into Playing with Fire, where the forbidden allure of a professor-student romance ignites amidst the storied halls of Blackwood Academy.", amazonUrl: "https://www.amazon.com/Playing-Fire-Romance-Ava-Blackwood-ebook/dp/B0F9PYXD8R", publishDate: "2024", series: "Blackwood Academy", cover: "https://placehold.co/300x450/231F20/FFFFFF?text=Playing+with+Fire" },
    { id: 2, title: "Control and Release", description: "Control and Release is an electrifying exploration of forbidden attraction and the intricate dance of power dynamics in academia.", amazonUrl: "https://www.amazon.com/Control-Release-Ava-Blackwood-ebook/dp/B0F9FQMW9L", publishDate: "2024", series: "Blackwood Academy", cover: "https://placehold.co/300x450/800020/FFFFFF?text=Control+and+Release" },
    { id: 3, title: "Preludes of Desire", description: "Seventeen-year-old piano prodigy Evelina Moreau has always used her music to control the world around her.", amazonUrl: "https://www.amazon.com/Preludes-Desire-Ava-Blackwood/dp/B0F91VK6GX", publishDate: "2024", series: "Standalone", cover: "https://placehold.co/300x450/4A4A4A/FFFFFF?text=Preludes+of+Desire" },
    { id: 4, title: "En Pointe", description: "En Pointe is a story of passion, ambition, and forbidden love set against the backdrop of the illustrious Opéra Garnier.", amazonUrl: "https://www.amazon.com/En-Pointe-Ava-Blackwood-ebook/dp/B0F9PQNGSG", publishDate: "2024", series: "Standalone", cover: "https://placehold.co/300x450/D3D3D3/000000?text=En+Pointe" }
  ],
  medical: [
    { id: 5, title: "Under Surgical Lights", description: "A provocative medical romance exploring power dynamics in the high-stakes world of surgery.", amazonUrl: "https://www.amazon.com/Under-Surgical-Lights-Ava-Blackwood/dp/B0F9FTLSC3", publishDate: "2024", series: "Medical Romance", cover: "https://placehold.co/300x450/ADD8E6/000000?text=Under+Surgical+Lights" }
  ],
  sports: [
    { id: 6, title: "Volley of Temptation", description: "A dark academia sports romance that explores the tension between competition and desire.", amazonUrl: "https://www.amazon.com/Volley-Temptation-Romance-Ava-Blackwood-ebook/dp/B0F9Q1K3GD", publishDate: "2024", series: "Sports Romance", cover: "https://placehold.co/300x450/006400/FFFFFF?text=Volley+of+Temptation" }
  ]
};

// --- Newsletter Signup Component (Updated) ---
const NewsletterSignup = ({ variant, className }) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  // --- NEW: Added 'duplicate' status ---
  const [submitStatus, setSubmitStatus] = useState(null); // null, 'success', 'error', 'invalid_email', 'duplicate'

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus(null);

    if (!isValidEmail(email)) {
      setSubmitStatus('invalid_email');
      return;
    }

    setIsSubmitting(true);

    try {
      // --- NEW: Fetching directly to handle specific error codes ---
      const response = await fetch('/api/send-newsletter-welcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setSubmitStatus('success');
        setEmail('');
        trackEvent('newsletter_signup', { method: 'Website Form' });
      } else if (response.status === 409) {
        // --- NEW: Handle duplicate email case ---
        setSubmitStatus('duplicate');
      } else {
        // Handle other server errors
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Newsletter signup error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isCompact = variant === 'compact';

  return (
    <div className={`${isCompact ? '' : 'bg-charcoal text-cream p-8 rounded-lg'} ${className || ''}`}>
      {!isCompact && (
        <>
          <h3 className="text-2xl font-bold mb-4">Join My Newsletter</h3>
          <p className="mb-6">Get updates on new releases, exclusive content, and behind-the-scenes insights.</p>
        </>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-lg text-charcoal"
            placeholder="Enter your email address"
          />
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gold text-charcoal py-3 px-6 rounded-lg font-semibold hover:bg-opacity-90 transition-colors disabled:opacity-50"
        >
          {isSubmitting ? 'Subscribing...' : 'Subscribe'}
        </button>

        {submitStatus === 'success' && (
          <div className="text-green-400 text-center mt-2">
            Welcome! Check your email for confirmation.
          </div>
        )}
        {submitStatus === 'error' && (
          <div className="text-red-400 text-center mt-2">
            Sorry, there was an error. Please try again.
          </div>
        )}
        {submitStatus === 'invalid_email' && (
           <div className="text-yellow-400 text-center mt-2">
            Please enter a valid email address.
          </div>
        )}
        {/* --- NEW: Message for duplicate email --- */}
        {submitStatus === 'duplicate' && (
           <div className="text-yellow-400 text-center mt-2">
            This email address is already subscribed.
          </div>
        )}
      </form>
    </div>
  );
};


// --- Contact Form Component (Unchanged) ---
const ContactForm = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValidEmail(formData.email)) {
      setSubmitStatus('invalid_email');
      return;
    }
    setIsSubmitting(true);
    const sanitizedData = {
      name: sanitizeInput(formData.name),
      email: sanitizeInput(formData.email),
      subject: sanitizeInput(formData.subject),
      message: sanitizeInput(formData.message),
    };
    try {
      const response = await fetch('/api/send-contact-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sanitizedData),
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-burgundy mb-6">Contact Me</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-charcoal mb-2">Name *</label>
          <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg" placeholder="Your full name" />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-charcoal mb-2">Email *</label>
          <input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg" placeholder="your.email@example.com" />
        </div>
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-charcoal mb-2">Subject *</label>
          <input type="text" id="subject" name="subject" value={formData.subject} onChange={handleInputChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg" placeholder="What's this about?" />
        </div>
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-charcoal mb-2">Message *</label>
          <textarea id="message" name="message" value={formData.message} onChange={handleInputChange} required rows={6} className="w-full px-4 py-3 border border-gray-300 rounded-lg" placeholder="Your message..."></textarea>
        </div>
        <button type="submit" disabled={isSubmitting} className="w-full bg-burgundy text-cream py-3 px-6 rounded-lg font-semibold">
          {isSubmitting ? 'Sending...' : 'Send Message'}
        </button>
        {submitStatus === 'success' && <div className="p-4 bg-green-100 text-green-700 rounded-lg">Thank you! Your message has been sent.</div>}
        {submitStatus === 'error' && <div className="p-4 bg-red-100 text-red-700 rounded-lg">Sorry, there was an error.</div>}
        {submitStatus === 'invalid_email' && <div className="p-4 bg-yellow-100 text-yellow-700 rounded-lg">Please enter a valid email.</div>}
      </form>
    </div>
  );
};

// --- Main App Component and Page Structure ---
function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const handleAmazonClick = (book) => {
    trackEvent('click_amazon_link', { book_title: book.title });
    window.open(book.amazonUrl, '_blank');
  };
  const Navigation = () => (
    <nav className="bg-white shadow-sm border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-serif text-burgundy font-bold cursor-pointer" onClick={() => setCurrentPage('home')}>
              Ava Blackwood
            </h1>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {['home', 'books', 'about', 'blog', 'contact'].map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 text-sm font-medium capitalize transition-colors ${
                    currentPage === page 
                      ? 'text-burgundy border-b-2 border-accent' 
                      : 'text-gray-700 hover:text-burgundy'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
  const HomePage = () => (
    <div className="min-h-screen">
      <section className="hero-section py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="text-center md:text-left">
              <h1 className="text-5xl md:text-6xl font-serif text-white mb-6">Unlock the Secrets of the Heart</h1>
              <p className="text-xl text-gray-200 mb-8 leading-relaxed">Discover dark and enchanting tales where passion and mystery entwine.</p>
              <Button className="gold-button text-lg px-8 py-3" onClick={() => setCurrentPage('books')}>View Books</Button>
            </div>
            <div className="flex justify-center">
              <div className="book-card bg-white p-4 rounded-lg shadow-2xl max-w-sm">
                <img src="https://placehold.co/300x450/231F20/FFFFFF?text=Playing+with+Fire" alt="Latest Book" className="w-full rounded-md" />
                <h3 className="text-xl font-serif text-burgundy mt-4 text-center">Playing with Fire</h3>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="py-16 px-4 bg-muted">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-serif text-burgundy text-center mb-12">Featured Books</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {booksData.darkAcademia.slice(0, 3).map((book) => (
              <Card key={book.id} className="book-card cursor-pointer">
                <CardContent className="p-6">
                  <img src={book.cover} alt={book.title} className="w-full h-64 object-cover rounded-md mb-4" />
                  <h3 className="text-xl font-serif text-burgundy mb-2">{book.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">{book.description}</p>
                  <Button className="w-full gold-button" onClick={() => handleAmazonClick(book)}>
                    <ExternalLink size={16} className="mr-2" /> Buy on Amazon
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
  const BooksPage = () => ( <div>...</div> );
  const AboutPage = () => ( <div>...</div> );
  const BlogPage = () => ( <div>...</div> );
  const ContactPage = () => ( <div><ContactForm /></div> );
  const Footer = () => ( <footer>...</footer> );
  const renderPage = () => {
    switch(currentPage) {
      case 'home': return <HomePage />;
      case 'books': return <BooksPage />;
      case 'about': return <AboutPage />;
      case 'blog': return <BlogPage />;
      case 'contact': return <ContactPage />;
      default: return <HomePage />;
    }
  };
  return (
    <div className="min-h-screen bg-background">
      <Analytics />
      <Navigation />
      {renderPage()}
      <Footer />
    </div>
  );
}

export { ContactForm, NewsletterSignup };
export default App;
