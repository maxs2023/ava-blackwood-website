import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { BookOpen, Mail, ExternalLink, Calendar, User, Heart, Send, Star, Award, Coffee, Pen } from 'lucide-react'
import './App.css'

// --- ADDED: Import the Sanity client and PortableText component ---
import sanityClient from './sanityClient.js'
import { PortableText } from '@portabletext/react'

// Import book cover images
import playingWithFireCover from './assets/Playing with Fire.jpg'
import controlAndReleaseCover from './assets/Control and Release.jpg'
import preludesOfDesireCover from './assets/Beneath the Scholar\'s Veil.jpg'
import enPointeCover from './assets/En Pointe.jpg'
import underSurgicalLightsCover from './assets/Under Surgical Lights.jpg'
import volleyOfTemptationCover from './assets/Volley of Temptation.jpg'

// Import author profile photo
// import authorPhoto from './src/assets/authorprofilephoto.png'

// --- Analytics Component ----
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

// --- Book Data ---
const booksData = {
  darkAcademia: [
    { 
      id: 1, 
      title: "Playing with Fire", 
      fullTitle: "Playing with Fire: A Dark-Academia Romance of Power, Desire, and Restraint",
      description: "Delve into Playing with Fire, where the forbidden allure of a professor-student romance ignites amidst the storied halls of Blackwood Academy. A Dark-Academia Romance of Power, Desire, and Restraint that explores the dangerous territory between mentorship and desire.", 
      amazonUrl: "https://www.amazon.com/Playing-Fire-Dark-Academia-Romance-Restraint-ebook/dp/B0F99HK62", 
      publishDate: "2024", 
      series: "Dark Academia", 
      cover: playingWithFireCover,
      rating: 4.5,
      genre: "Dark Academia Romance"
    },
    { 
      id: 2, 
      title: "Control and Release", 
      fullTitle: "Control and Release: A Dark Academia Romance",
      description: "Control and Release is an electrifying exploration of forbidden attraction and the intricate dance of power dynamics in academia. When boundaries blur between professor and student, passion becomes a dangerous game of control.", 
      amazonUrl: "https://www.amazon.com/Control-Release-Ava-Blackwood-ebook/dp/B0F9FQMW9L", 
      publishDate: "2024", 
      series: "Dark Academia", 
      cover: controlAndReleaseCover,
      rating: 4.3,
      genre: "Dark Academia Romance"
    },
    { 
      id: 3, 
      title: "Preludes of Desire", 
      fullTitle: "Preludes of Desire: A Dark Academia Romance",
      description: "Seventeen-year-old piano prodigy Evelina Moreau has always used her music to control the world around her. But when she meets her enigmatic composition professor, she discovers that some melodies are too dangerous to play.", 
      amazonUrl: "https://www.amazon.com/Preludes-Desire-Ava-Blackwood/dp/B0F91VK6GX", 
      publishDate: "2024", 
      series: "Dark Academia", 
      cover: preludesOfDesireCover,
      rating: 4.4,
      genre: "Dark Academia Romance"
    },
    { 
      id: 4, 
      title: "En Pointe", 
      fullTitle: "En Pointe: Romance Edition",
      description: "En Pointe is a story of passion, ambition, and forbidden love set against the backdrop of the illustrious Opéra Garnier. When ballet meets desire, every movement becomes a dance of seduction.", 
      amazonUrl: "https://www.amazon.com/En-Pointe-Ava-Blackwood-ebook/dp/B0F9PQNGSG", 
      publishDate: "2024", 
      series: "Standalone", 
      cover: enPointeCover,
      rating: 4.6,
      genre: "Romance"
    }
  ],
  medical: [
    { 
      id: 5, 
      title: "Under Surgical Lights", 
      fullTitle: "Under Surgical Lights: A Medical Romance",
      description: "A provocative medical romance exploring power dynamics in the high-stakes world of surgery. When Dr. Sarah Chen meets the enigmatic Chief of Surgery, their professional relationship becomes dangerously personal.", 
      amazonUrl: "https://www.amazon.com/Under-Surgical-Lights-Ava-Blackwood/dp/B0F9FTLSC3", 
      publishDate: "2024", 
      series: "Medical Romance", 
      cover: underSurgicalLightsCover,
      rating: 4.2,
      genre: "Medical Romance"
    }
  ],
  sports: [
    { 
      id: 6, 
      title: "Volley of Temptation", 
      fullTitle: "Volley of Temptation: A Dark-Academia Sports Romance",
      description: "A dark academia sports romance that explores the tension between competition and desire on the volleyball court. When winning becomes secondary to the game of hearts, every serve is a shot at love.", 
      amazonUrl: "https://www.amazon.com/Volley-Temptation-Romance-Ava-Blackwood-ebook/dp/B0F9Q1K3GD", 
      publishDate: "2024", 
      series: "Dark Academia Sports", 
      cover: volleyOfTemptationCover,
      rating: 4.1,
      genre: "Sports Romance"
    }
  ]
};

// --- Newsletter Signup Component ---
const NewsletterSignup = ({ variant, className }) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus(null);

    if (!isValidEmail(email)) {
      setSubmitStatus('invalid_email');
      return;
    }

    setIsSubmitting(true);

    try {
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
        setSubmitStatus('duplicate');
      } else {
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
  const isFooter = variant === 'footer';

  if (isFooter) {
    return (
      <div className="max-w-md mx-auto">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-white mb-2">Stay Connected</h3>
          <p className="text-gray-300">Get updates on new releases, exclusive content, and behind-the-scenes insights.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 border-0 focus:ring-2 focus:ring-accent"
              placeholder="Enter your email address"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="gold-button px-6 py-3 rounded-lg font-semibold whitespace-nowrap"
            >
              {isSubmitting ? 'Subscribing...' : 'Subscribe'}
            </button>
          </div>

          {submitStatus === 'success' && (
            <div className="text-green-400 text-center text-sm">
              Welcome! Check your email for confirmation.
            </div>
          )}
          {submitStatus === 'error' && (
            <div className="text-red-400 text-center text-sm">
              Sorry, there was an error. Please try again.
            </div>
          )}
          {submitStatus === 'invalid_email' && (
             <div className="text-yellow-400 text-center text-sm">
              Please enter a valid email address.
            </div>
          )}
          {submitStatus === 'duplicate' && (
             <div className="text-yellow-400 text-center text-sm">
              This email address is already subscribed.
            </div>
          )}
        </form>
      </div>
    );
  }

  return (
    <div className={`${isCompact ? '' : 'bg-gray-800 text-white p-8 rounded-lg'} ${className || ''}`}>
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
            className="w-full px-4 py-3 rounded-lg text-gray-900"
            placeholder="Enter your email address"
          />
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full gold-button py-3 px-6 rounded-lg font-semibold"
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
        {submitStatus === 'duplicate' && (
           <div className="text-yellow-400 text-center mt-2">
            This email address is already subscribed.
          </div>
        )}
      </form>
    </div>
  );
};

// --- Contact Form Component ---
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
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
          <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900" placeholder="Your full name" />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
          <input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900" placeholder="your.email@example.com" />
        </div>
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
          <input type="text" id="subject" name="subject" value={formData.subject} onChange={handleInputChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900" placeholder="What's this about?" />
        </div>
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">Message *</label>
          <textarea id="message" name="message" value={formData.message} onChange={handleInputChange} required rows={6} className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900" placeholder="Your message..."></textarea>
        </div>
        <button type="submit" disabled={isSubmitting} className="w-full bg-primary text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary/90">
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
  const [selectedGenre, setSelectedGenre] = useState('all');
  
  const handleAmazonClick = (book) => {
    trackEvent('click_amazon_link', { book_title: book.title });
    window.open(book.amazonUrl, '_blank');
  };

  const getAllBooks = () => {
    return [
      ...booksData.darkAcademia,
      ...booksData.medical,
      ...booksData.sports
    ];
  };

  const getFilteredBooks = () => {
    if (selectedGenre === 'all') {
      return getAllBooks();
    }
    return booksData[selectedGenre] || [];
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
                <div className="w-full h-80 bg-gray-100 rounded-md overflow-hidden">
                  <img 
                    src={booksData.darkAcademia[0].cover} 
                    alt="Latest Book" 
                    className="w-full h-full object-contain"
                  />
                </div>
                <h3 className="text-xl font-serif text-burgundy mt-4 text-center">{booksData.darkAcademia[0].title}</h3>
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
                  <div className="w-full h-64 bg-gray-100 rounded-md overflow-hidden mb-4">
                    <img 
                      src={book.cover} 
                      alt={book.title} 
                      className="w-full h-full object-contain"
                    />
                  </div>
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

  const BooksPage = () => (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-serif text-burgundy mb-4">My Books</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore my collection of dark academia romances, medical dramas, and sports romances. 
            Each story weaves passion, power, and forbidden desire into unforgettable tales.
          </p>
        </div>

        <div className="flex justify-center mb-8">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedGenre === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedGenre('all')}
              className={selectedGenre === 'all' ? 'bg-primary text-white' : 'text-gray-700 border-gray-300 hover:text-burgundy'}
            >
              All Books ({getAllBooks().length})
            </Button>
            <Button
              variant={selectedGenre === 'darkAcademia' ? 'default' : 'outline'}
              onClick={() => setSelectedGenre('darkAcademia')}
              className={selectedGenre === 'darkAcademia' ? 'bg-primary text-white' : 'text-gray-700 border-gray-300 hover:text-burgundy'}
            >
              Dark Academia ({booksData.darkAcademia.length})
            </Button>
            <Button
              variant={selectedGenre === 'medical' ? 'default' : 'outline'}
              onClick={() => setSelectedGenre('medical')}
              className={selectedGenre === 'medical' ? 'bg-primary text-white' : 'text-gray-700 border-gray-300 hover:text-burgundy'}
            >
              Medical Romance ({booksData.medical.length})
            </Button>
            <Button
              variant={selectedGenre === 'sports' ? 'default' : 'outline'}
              onClick={() => setSelectedGenre('sports')}
              className={selectedGenre === 'sports' ? 'bg-primary text-white' : 'text-gray-700 border-gray-300 hover:text-burgundy'}
            >
              Sports Romance ({booksData.sports.length})
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {getFilteredBooks().map((book) => (
            <Card key={book.id} className="book-card hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="relative mb-4">
                  <div className="w-full h-80 bg-gray-100 rounded-md overflow-hidden">
                    <img 
                      src={book.cover} 
                      alt={book.title} 
                      className="w-full h-full object-contain shadow-md"
                    />
                  </div>
                  <Badge className="absolute top-2 right-2 bg-primary text-white">
                    {book.genre}
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-xl font-serif text-burgundy font-bold line-clamp-2">
                    {book.title}
                  </h3>
                  
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          className={i < Math.floor(book.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">({book.rating})</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar size={14} />
                    <span>{book.publishDate}</span>
                    <span>•</span>
                    <span>{book.series}</span>
                  </div>
                  
                  <p className="text-gray-600 text-sm line-clamp-4 leading-relaxed">
                    {book.description}
                  </p>
                  
                  <Button 
                    className="w-full bg-primary hover:bg-primary/90 text-white" 
                    onClick={() => handleAmazonClick(book)}
                  >
                    <ExternalLink size={16} className="mr-2" />
                    Buy on Amazon
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );

  const AboutPage = () => ( 
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-serif text-burgundy mb-4">About Ava Blackwood</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Crafting tales of passion, power, and forbidden desire in the shadows of academia.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-12 mb-16">
          {/* Author Photo */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="relative">
                <img 
                  src={authorPhoto} 
                  alt="Ava Blackwood" 
                  className="w-full rounded-lg shadow-2xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg"></div>
              </div>
              
              {/* Quick Stats */}
              <div className="mt-8 space-y-4">
                <div className="flex items-center gap-3 text-gray-700">
                  <BookOpen size={20} className="text-burgundy" />
                  <span className="font-medium">{getAllBooks().length} Published Books</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <Award size={20} className="text-burgundy" />
                  <span className="font-medium">Dark Academia Specialist</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <Pen size={20} className="text-burgundy" />
                  <span className="font-medium">Romance Author</span>
                </div>
              </div>
            </div>
          </div>

          {/* Biography Content */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h2 className="text-3xl font-serif text-burgundy mb-6">Welcome to My World</h2>
              <div className="prose prose-lg text-gray-700 space-y-6">
                <p className="text-lg leading-relaxed">
                  Welcome to the shadowy halls of academia, where passion and intellect collide in the most unexpected ways. 
                  I'm Ava Blackwood, and I invite you to explore worlds where forbidden desires unfold against the backdrop 
                  of prestigious institutions, ancient libraries, and moonlit courtyards.
                </p>
                
                <p className="leading-relaxed">
                  My stories delve deep into the complexities of power dynamics, the intoxicating allure of the forbidden, 
                  and the delicate dance between mentorship and desire. Each tale is carefully crafted to explore the 
                  psychological depths of human connection, where every glance carries weight and every word holds power.
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-serif text-burgundy mb-4">My Writing Journey</h3>
              <div className="prose text-gray-700 space-y-4">
                <p>
                  Drawing from my background in literature and behavioral psychology, I bring a unique perspective to 
                  the romance genre. My fascination with the intricate workings of the human psyche, combined with 
                  a deep appreciation for academic settings, naturally led me to the dark academia genre.
                </p>
                
                <p>
                  I believe that the most compelling stories are born from the tension between what we desire and 
                  what we're told we cannot have. In my novels, you'll find characters who challenge boundaries, 
                  question authority, and ultimately discover that the heart wants what it wants—regardless of 
                  the consequences.
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-serif text-burgundy mb-4">What Drives My Stories</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-muted p-6 rounded-lg">
                  <h4 className="font-semibold text-burgundy mb-3">Dark Academia</h4>
                  <p className="text-gray-700 text-sm">
                    The mysterious allure of ancient institutions, secret societies, and the pursuit of forbidden knowledge.
                  </p>
                </div>
                <div className="bg-muted p-6 rounded-lg">
                  <h4 className="font-semibold text-burgundy mb-3">Power Dynamics</h4>
                  <p className="text-gray-700 text-sm">
                    Exploring the complex interplay between authority and submission, mentorship and desire.
                  </p>
                </div>
                <div className="bg-muted p-6 rounded-lg">
                  <h4 className="font-semibold text-burgundy mb-3">Psychological Depth</h4>
                  <p className="text-gray-700 text-sm">
                    Characters with rich inner lives, complex motivations, and authentic emotional journeys.
                  </p>
                </div>
                <div className="bg-muted p-6 rounded-lg">
                  <h4 className="font-semibold text-burgundy mb-3">Slow-Burn Romance</h4>
                  <p className="text-gray-700 text-sm">
                    Building tension through meaningful glances, charged conversations, and emotional intimacy.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-serif text-burgundy mb-4">Beyond the Page</h3>
              <div className="prose text-gray-700 space-y-4">
                <p>
                  When I'm not crafting tales of forbidden romance, you'll find me exploring historic libraries, 
                  studying in cozy coffee shops, or wandering through university campuses that inspire my settings. 
                  I'm an avid reader of classical literature, psychology texts, and contemporary romance.
                </p>
                
                <p>
                  I believe in the power of stories to help us understand ourselves and others more deeply. 
                  Through my work, I hope to create a safe space where readers can explore complex emotions 
                  and relationships, finding both escape and insight within the pages.
                </p>
              </div>
            </div>

            {/* Call to Action */}
            <div className="bg-burgundy text-white p-8 rounded-lg">
              <h3 className="text-2xl font-serif mb-4">Join My Literary Journey</h3>
              <p className="mb-6">
                Stay connected for exclusive content, behind-the-scenes insights, and early access to new releases. 
                Let's explore the shadows of academia together.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  className="gold-button flex-1" 
                  onClick={() => setCurrentPage('books')}
                >
                  <BookOpen size={16} className="mr-2" />
                  Explore My Books
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1 border-white text-white hover:bg-white hover:text-burgundy"
                  onClick={() => setCurrentPage('contact')}
                >
                  <Mail size={16} className="mr-2" />
                  Get In Touch
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const BlogPage = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedPost, setSelectedPost] = useState(null);

    useEffect(() => {
      const query = `*[_type == "post"] | order(publishedAt desc)`;
      
      sanityClient.fetch(query)
        .then((data) => {
          setPosts(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching blog posts from Sanity:", err);
          setError("Failed to load blog posts.");
          setLoading(false);
        });
    }, []);

    const handlePostClick = (post) => {
      setSelectedPost(post);
      window.scrollTo(0, 0);
    };

    const handleBackClick = () => {
      setSelectedPost(null);
    };

    if (loading) {
      return <div className="text-center py-20 text-gray-600">Loading posts...</div>;
    }
    if (error) {
      return <div className="text-center py-20 text-red-500">{error}</div>;
    }
    
    if (selectedPost) {
      return (
        <div className="min-h-screen py-12 px-4 bg-muted">
          <div className="max-w-3xl mx-auto">
            <Button variant="outline" onClick={handleBackClick} className="mb-8 bg-white text-gray-700 border-gray-300 hover:text-burgundy">
              &larr; Back to All Posts
            </Button>
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-4xl font-serif text-burgundy">{selectedPost.title}</CardTitle>
                <CardDescription className="flex items-center gap-4 text-sm text-gray-500 pt-2">
                  {selectedPost.author?.name && <span className="flex items-center gap-2"><User size={14} /> {selectedPost.author.name}</span>}
                  {selectedPost.publishedAt && <span className="flex items-center gap-2"><Calendar size={14} /> {new Date(selectedPost.publishedAt).toLocaleDateString()}</span>}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="blog-content text-lg text-gray-700">
                  <PortableText value={selectedPost.body} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-serif text-burgundy mb-4">From the Desk of Ava Blackwood</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Musings on writing, romance, and the shadows in between.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
            {posts.map((post) => (
              <Card key={post._id} className="flex flex-col hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-2xl font-serif text-burgundy line-clamp-2">{post.title}</CardTitle>
                  <CardDescription className="text-xs text-gray-500">
                    {new Date(post.publishedAt).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-gray-700 text-sm line-clamp-4">A look inside the latest musings from Ava Blackwood...</p>
                </CardContent>
                <div className="p-6 pt-0 mt-auto">
                  <Button variant="link" onClick={() => handlePostClick(post)} className="p-0 text-burgundy font-semibold hover:text-burgundy/80">
                    Read More &rarr;
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const ContactPage = () => ( <div><ContactForm /></div> );
  
  // --- Footer Component ---
  const Footer = () => (
    <footer className="burgundy-section py-16 px-4 mt-16">
      <div className="max-w-7xl mx-auto">
        {/* Newsletter Section */}
        <div className="mb-12">
          <NewsletterSignup variant="footer" />
        </div>
        
        {/* Footer Content */}
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-2xl font-serif font-bold mb-4 text-white">Ava Blackwood</h3>
            <p className="text-gray-300 mb-4">
              Crafting tales of passion, power, and forbidden desire in the shadows of academia.
            </p>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">Quick Links</h4>
            <ul className="space-y-2">
              <li><button onClick={() => setCurrentPage('home')} className="text-gray-300 hover:text-white transition-colors">Home</button></li>
              <li><button onClick={() => setCurrentPage('books')} className="text-gray-300 hover:text-white transition-colors">Books</button></li>
              <li><button onClick={() => setCurrentPage('about')} className="text-gray-300 hover:text-white transition-colors">About</button></li>
              <li><button onClick={() => setCurrentPage('blog')} className="text-gray-300 hover:text-white transition-colors">Blog</button></li>
              <li><button onClick={() => setCurrentPage('contact')} className="text-gray-300 hover:text-white transition-colors">Contact</button></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">Connect</h4>
            <p className="text-gray-300 mb-4">
              Follow my journey and get the latest updates on new releases and exclusive content.
            </p>
            <div className="flex items-center gap-2 text-gray-300">
              <Mail size={16} />
              <span className="text-sm">Newsletter subscribers get first access to new releases</span>
            </div>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="border-t border-gray-600 pt-8 text-center text-gray-300">
          <p>&copy; 2024 Ava Blackwood. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
  
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
