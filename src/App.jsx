import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
// --- MODIFICATION: Added Menu and X icons for the mobile menu button ---
import { BookOpen, Mail, ExternalLink, Calendar, User, Send, Star, Award, Coffee, Pen, Menu, X, Coins, Zap, Eye, ShoppingCart } from 'lucide-react';
import './App.css';

// --- Import Sanity and PortableText ---
import sanityClient from './sanityClient.js';
import { PortableText } from '@portabletext/react';

// --- Import Page Components ---
import BlogList from './BlogList.jsx';
import BlogPost from './BlogPost.jsx';

// --- Import App Data ---
import { allBooks } from './booksData.js';
import authorPhoto from './assets/authorprofilephoto.png';

// --- Analytics Component ---
const Analytics = () => {
  const GA_MEASUREMENT_ID = 'G-CLVD5YQKWB';
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' || window.gtag) return;
    const script = document.createElement('script');
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    script.async = true;
    document.head.appendChild(script);
    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', GA_MEASUREMENT_ID);
  }, []);
  return null;
};

const trackEvent = (eventName, eventParams) => {
  if (window.gtag) {
    window.gtag('event', eventName, eventParams);
  }
};

// --- Helper Functions ---
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return '';
  return input.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
};

// --- Reusable Components ---
const NewsletterSignup = ({ variant, className }) => {
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null);
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!isValidEmail(email)) { setSubmitStatus('invalid_email'); return; }
      setIsSubmitting(true);
      try {
        const response = await fetch('/api/send-newsletter-welcome', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        if (response.ok) { setSubmitStatus('success'); setEmail(''); trackEvent('newsletter_signup', { method: 'Website Form' }); }
        else if (response.status === 409) { setSubmitStatus('duplicate'); }
        else { setSubmitStatus('error'); }
      } catch (error) { setSubmitStatus('error'); }
      finally { setIsSubmitting(false); }
    };

  const commonProps = { email, setEmail, isSubmitting, submitStatus, handleSubmit };

  return variant === 'footer' ? <NewsletterFooter {...commonProps} /> : <NewsletterCard {...commonProps} isCompact={variant === 'compact'} className={className} />;
};

const NewsletterFooter = ({ email, setEmail, isSubmitting, submitStatus, handleSubmit }) => (
    <div className="max-w-md mx-auto">
        <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-white mb-2">Stay Connected</h3>
            <p className="text-gray-300">Get updates on new releases, exclusive content, and behind-the-scenes insights.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-2">
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="flex-1 px-4 py-3 rounded-lg text-gray-900 border-1 focus:ring-2 focus:ring-accent" placeholder="Enter your email address"/>
                <button type="submit" disabled={isSubmitting} className="gold-button px-6 py-3 rounded-lg font-semibold whitespace-nowrap">{isSubmitting ? 'Subscribing...' : 'Subscribe'}</button>
            </div>
            <SubmitStatusMessage status={submitStatus} />
        </form>
    </div>
);

const NewsletterCard = ({ email, setEmail, isSubmitting, submitStatus, handleSubmit, isCompact, className }) => (
    <div className={`${isCompact ? '' : 'bg-gray-800 text-white p-8 rounded-lg'} ${className || ''}`}>
        {!isCompact && (
            <>
                <h3 className="text-2xl font-bold mb-4">Join My Newsletter</h3>
                <p className="mb-6">Get updates on new releases, exclusive content, and behind-the-scenes insights.</p>
            </>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-3 rounded-lg text-gray-900" placeholder="Enter your email address"/>
            <button type="submit" disabled={isSubmitting} className="w-full gold-button py-3 px-6 rounded-lg font-semibold">{isSubmitting ? 'Subscribing...' : 'Subscribe'}</button>
            <SubmitStatusMessage status={submitStatus} />
        </form>
    </div>
);

const SubmitStatusMessage = ({ status }) => {
    if (!status) return null;
    const messages = {
        success: { text: 'Welcome! Check your email for confirmation.', color: 'text-green-400' },
        error: { text: 'Sorry, there was an error. Please try again.', color: 'text-red-400' },
        invalid_email: { text: 'Please enter a valid email address.', color: 'text-yellow-400' },
        duplicate: { text: 'This email address is already subscribed.', color: 'text-yellow-400' },
    };
    return <div className={`${messages[status].color} text-center text-sm`}>{messages[status].text}</div>;
};


// --- REVISED NAVIGATION COMPONENT ---
const Navigation = () => {
    const location = useLocation();
    // --- MODIFICATION: State to manage mobile menu visibility ---
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navLinks = [
        { path: '/', label: 'Home' },
        { path: '/books', label: 'Books' },
        { path: '/nft', label: 'NFT' },
        { path: '/about', label: 'About' },
        { path: '/blog', label: 'Blog' },
        { path: '/contact', label: 'Contact' },
    ];

    return (
        <nav className="bg-white shadow-sm border-b border-border sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <Link to="/" className="text-2xl font-serif text-burgundy font-bold" onClick={() => setIsMobileMenuOpen(false)}>
                        Ava Blackwood
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-8">
                            {navLinks.map(({ path, label }) => (
                                <Link
                                    key={path}
                                    to={path}
                                    className={`px-3 py-2 text-sm font-medium capitalize transition-colors ${
                                        location.pathname === path
                                            ? 'text-burgundy border-b-2 border-accent'
                                            : 'text-gray-700 hover:text-burgundy'
                                    }`}
                                >
                                    {label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* --- MODIFICATION: Hamburger Button for mobile --- */}
                    <div className="md:hidden flex items-center">
                        <Button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            variant="ghost"
                            size="icon"
                        >
                            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                            <span className="sr-only">Open main menu</span>
                        </Button>
                    </div>
                </div>
            </div>

            {/* --- MODIFICATION: Mobile Menu Panel --- */}
            {isMobileMenuOpen && (
                <div className="md:hidden" id="mobile-menu">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        {navLinks.map(({ path, label }) => (
                            <Link
                                key={path}
                                to={path}
                                onClick={() => setIsMobileMenuOpen(false)} // Close menu on link click
                                className={`block px-3 py-2 rounded-md text-base font-medium capitalize ${
                                    location.pathname === path
                                        ? 'bg-accent text-accent-foreground'
                                        : 'text-gray-700 hover:bg-gray-100'
                                }`}
                            >
                                {label}
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </nav>
    );
};


const HomePage = () => {
    const handleAmazonClick = (book) => {
        trackEvent('click_amazon_link', { book_title: book.title });
        window.open(book.amazonUrl, '_blank');
    };
    
    // Use the first book from the imported list as the hero book
    const heroBook = allBooks[0];
    // Use the first 3 books for the featured section
    const featuredBooks = allBooks.slice(0, 3);

    return (
        <div className="min-h-screen">
          <section className="hero-section py-20 px-4">
            <div className="max-w-7xl mx-auto">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="text-center md:text-left">
                  <h1 className="text-5xl md:text-6xl font-serif text-white mb-6">Unlock the Secrets of the Heart</h1>
                  <p className="text-xl text-gray-200 mb-8 leading-relaxed">Discover dark and enchanting tales where passion and mystery entwine.</p>
                  <Button as={Link} to="/books" className="gold-button text-lg px-8 py-3">View Books</Button>
                </div>
                <div className="flex justify-center">
                  <div className="book-card bg-white p-4 rounded-lg shadow-2xl max-w-sm">
                    <div className="w-full h-80 bg-gray-100 rounded-md overflow-hidden">
                      <img src={heroBook.cover} alt="Latest Book" className="w-full h-full object-contain"/>
                    </div>
                    <h3 className="text-xl font-serif text-burgundy mt-4 text-center">{heroBook.title}</h3>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <section className="py-16 px-4 bg-muted">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-4xl font-serif text-burgundy text-center mb-12">Featured Books</h2>
              <div className="grid md:grid-cols-3 gap-8">
                {featuredBooks.map((book) => (
                  <Card key={book.id} className="book-card cursor-pointer">
                    <CardContent className="p-6">
                      <div className="w-full h-64 bg-gray-100 rounded-md overflow-hidden mb-4">
                        <img src={book.cover} alt={book.title} className="w-full h-full object-contain"/>
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
};

const BooksPage = () => {
    const [selectedGenre, setSelectedGenre] = useState('all');
    
    // Dynamically generate the list of unique genres from the book data
    const genres = ['all', ...new Set(allBooks.map(book => book.genre))];

    const getFilteredBooks = () => {
        if (selectedGenre === 'all') return allBooks;
        return allBooks.filter(book => book.genre === selectedGenre);
    };

    const handleAmazonClick = (book) => {
        trackEvent('click_amazon_link', { book_title: book.title });
        window.open(book.amazonUrl, '_blank');
    };

    return (
        <div className="min-h-screen py-12 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-5xl font-serif text-burgundy mb-4">My Books</h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">Explore my collection of dark academia romances, medical dramas, and sports romances.</p>
            </div>
            <div className="flex justify-center flex-wrap gap-2 mb-8">
              {genres.map(genre => (
                  <Button 
                    key={genre} 
                    variant={selectedGenre === genre ? 'default' : 'outline'} 
                    onClick={() => setSelectedGenre(genre)} 
                    className={selectedGenre === genre ? 'bg-primary text-white' : 'text-gray-700 border-gray-300 hover:text-burgundy'}
                  >
                      {genre.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} 
                      ({genre === 'all' ? allBooks.length : allBooks.filter(b => b.genre === genre).length})
                  </Button>
              ))}
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {getFilteredBooks().map((book) => (
                <Card key={book.id} className="book-card hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-6">
                    <div className="relative mb-4">
                      <div className="w-full h-80 bg-gray-100 rounded-md overflow-hidden"><img src={book.cover} alt={book.title} className="w-full h-full object-contain shadow-md"/></div>
                      <Badge className="absolute top-2 right-2 bg-primary text-white">{book.genre}</Badge>
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-xl font-serif text-burgundy font-bold line-clamp-2">{book.title}</h3>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center">{[...Array(5)].map((_, i) => (<Star key={i} size={16} className={i < Math.floor(book.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}/>))}</div>
                        <span className="text-sm text-gray-600">({book.rating})</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500"><Calendar size={14} /><span>{book.publishDate}</span><span>•</span><span>{book.series}</span></div>
                      <p className="text-gray-600 text-sm line-clamp-4 leading-relaxed">{book.description}</p>
                      <Button className="w-full bg-primary hover:bg-primary/90 text-white" onClick={() => handleAmazonClick(book)}><ExternalLink size={16} className="mr-2" />Buy on Amazon</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      );
};

const AboutPage = () => (
    <div className="min-h-screen py-12 px-4">
        <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
                <h1 className="text-5xl font-serif text-burgundy mb-4">About Ava Blackwood</h1>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">Crafting tales of passion, power, and forbidden desire.</p>
            </div>
            <div className="grid lg:grid-cols-3 gap-12">
                <div className="lg:col-span-1">
                    <div className="sticky top-24">
                        <img src={authorPhoto} alt="Ava Blackwood" className="w-full rounded-lg shadow-2xl"/>
                        <div className="mt-8 space-y-4">
                            <div className="flex items-center gap-3 text-gray-700"><BookOpen size={20} className="text-burgundy" /><span>{allBooks.length} Published Books</span></div>
                            <div className="flex items-center gap-3 text-gray-700"><Award size={20} className="text-burgundy" /><span>Dark Academia Specialist</span></div>
                            <div className="flex items-center gap-3 text-gray-700"><Pen size={20} className="text-burgundy" /><span>Romance Author</span></div>
                        </div>
                    </div>
                </div>
                <div className="lg:col-span-2 space-y-8">
                    <div>
                        <h2 className="text-3xl font-serif text-burgundy mb-6">Welcome to My World</h2>
                        <div className="prose prose-lg text-gray-700 space-y-6">
                            <p className="text-lg leading-relaxed">Welcome to the shadowy halls of academia, where passion and intellect collide. I'm Ava Blackwood, and I invite you to explore worlds where forbidden desires unfold.</p>
                            <p className="leading-relaxed">My stories delve deep into the complexities of power dynamics, the intoxicating allure of the forbidden, and the delicate dance between mentorship and desire.</p>
                        </div>
                    </div>
                    <div className="bg-burgundy text-white p-8 rounded-lg flex flex-col sm:flex-row gap-4">
                        <Button as={Link} to="/books" className="gold-button flex-1"><BookOpen size={16} className="mr-2" />Explore My Books</Button>
                        <Button as={Link} to="/contact" variant="outline" className="gold-button flex-1"><Mail size={16} className="mr-2" />Get In Touch</Button>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const ContactPage = () => {
    const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null);

    const handleInputChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isValidEmail(formData.email)) { setSubmitStatus('invalid_email'); return; }
        setIsSubmitting(true);
        const sanitizedData = { name: sanitizeInput(formData.name), email: sanitizeInput(formData.email), subject: sanitizeInput(formData.subject), message: sanitizeInput(formData.message) };
        try {
            const response = await fetch('/api/send-contact-email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(sanitizedData) });
            if (response.ok) { setSubmitStatus('success'); setFormData({ name: '', email: '', subject: '', message: '' }); }
            else { setSubmitStatus('error'); }
        } catch (error) { setSubmitStatus('error'); }
        finally { setIsSubmitting(false); }
    };

    return (
        <div className="max-w-2xl mx-auto p-6">
            <h2 className="text-3xl font-bold text-burgundy mb-6">Contact Me</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div><label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Name *</label><Input id="name" name="name" value={formData.name} onChange={handleInputChange} required placeholder="Your full name" /></div>
                <div><label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email *</label><Input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} required placeholder="your.email@example.com" /></div>
                <div><label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">Subject *</label><Input id="subject" name="subject" value={formData.subject} onChange={handleInputChange} required placeholder="What's this about?" /></div>
                <div><label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">Message *</label><Textarea id="message" name="message" value={formData.message} onChange={handleInputChange} required rows={6} placeholder="Your message..." /></div>
                <button type="submit" disabled={isSubmitting} className="w-full bg-primary text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary/90">{isSubmitting ? 'Sending...' : 'Send Message'}</button>
                <SubmitStatusMessage status={submitStatus} />
            </form>
        </div>
    );
};

const NFTPage = () => {
    const [selectedCategory, setSelectedCategory] = useState('all');
    
    // Mock NFT data - replace with actual blockchain integration
    const nftCollections = [
        {
            id: 1,
            title: "Dark Academia Character Portraits",
            description: "Exclusive character art from my Dark Academia series",
            price: "0.05 ETH",
            image: "/api/placeholder/300/400",
            edition: "Limited Edition - 100 pieces",
            category: "character-art",
            book: "Playing with Fire",
            rarity: "rare",
            status: "available"
        },
        {
            id: 2,
            title: "First Edition Book Covers",
            description: "Original digital book cover art as collectible NFTs",
            price: "0.08 ETH",
            image: "/api/placeholder/300/400",
            edition: "Ultra Rare - 25 pieces",
            category: "book-covers",
            book: "Control and Release",
            rarity: "ultra-rare",
            status: "available"
        },
        {
            id: 3,
            title: "Behind-the-Scenes Manuscripts",
            description: "Handwritten notes and deleted scenes from my writing process",
            price: "0.12 ETH",
            image: "/api/placeholder/300/400",
            edition: "Legendary - 10 pieces",
            category: "manuscripts",
            book: "En Pointe",
            rarity: "legendary",
            status: "sold-out"
        },
        {
            id: 4,
            title: "Romance Scene Audio NFTs",
            description: "Exclusive audio readings of steamy scenes by Ava Blackwood",
            price: "0.06 ETH",
            image: "/api/placeholder/300/400",
            edition: "Limited Edition - 50 pieces",
            category: "audio",
            book: "Under Surgical Lights",
            rarity: "rare",
            status: "available"
        },
        {
            id: 5,
            title: "Interactive Story Experiences",
            description: "Choose-your-own-adventure style interactive story NFTs",
            price: "0.15 ETH",
            image: "/api/placeholder/300/400",
            edition: "Exclusive - 5 pieces",
            category: "interactive",
            book: "Volley of Temptation",
            rarity: "legendary",
            status: "coming-soon"
        }
    ];

    const categories = [
        { key: 'all', label: 'All NFTs', count: nftCollections.length },
        { key: 'character-art', label: 'Character Art', count: nftCollections.filter(n => n.category === 'character-art').length },
        { key: 'book-covers', label: 'Book Covers', count: nftCollections.filter(n => n.category === 'book-covers').length },
        { key: 'manuscripts', label: 'Manuscripts', count: nftCollections.filter(n => n.category === 'manuscripts').length },
        { key: 'audio', label: 'Audio', count: nftCollections.filter(n => n.category === 'audio').length },
        { key: 'interactive', label: 'Interactive', count: nftCollections.filter(n => n.category === 'interactive').length }
    ];

    const filteredNFTs = selectedCategory === 'all' 
        ? nftCollections 
        : nftCollections.filter(nft => nft.category === selectedCategory);

    const getRarityColor = (rarity) => {
        switch(rarity) {
            case 'common': return 'bg-gray-500';
            case 'rare': return 'bg-blue-500';
            case 'ultra-rare': return 'bg-purple-500';
            case 'legendary': return 'bg-yellow-500';
            default: return 'bg-gray-500';
        }
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'available': return 'text-green-600 bg-green-100';
            case 'sold-out': return 'text-red-600 bg-red-100';
            case 'coming-soon': return 'text-blue-600 bg-blue-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const handlePurchaseClick = (nft) => {
        trackEvent('nft_purchase_click', { nft_title: nft.title, price: nft.price });
        // Here you would integrate with Web3 wallet and NFT marketplace
        alert(`Purchase functionality coming soon!\n\nNFT: ${nft.title}\nPrice: ${nft.price}`);
    };

    return (
        <div className="min-h-screen py-12 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-serif text-burgundy mb-4">Exclusive Book NFTs</h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                        Own a piece of literary history with exclusive digital collectibles from Ava Blackwood's romance universe. 
                        Character art, manuscript excerpts, and unique experiences await.
                    </p>
                    <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                            <Zap className="w-4 h-4 text-burgundy" />
                            <span>Blockchain Verified</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Eye className="w-4 h-4 text-burgundy" />
                            <span>Limited Editions</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Coins className="w-4 h-4 text-burgundy" />
                            <span>ETH & Credit Cards</span>
                        </div>
                    </div>
                </div>

                {/* Category Filter */}
                <div className="flex justify-center flex-wrap gap-2 mb-8">
                    {categories.map(category => (
                        <Button 
                            key={category.key} 
                            variant={selectedCategory === category.key ? 'default' : 'outline'} 
                            onClick={() => setSelectedCategory(category.key)} 
                            className={selectedCategory === category.key ? 'bg-primary text-white' : 'text-gray-700 border-gray-300 hover:text-burgundy'}
                        >
                            {category.label} ({category.count})
                        </Button>
                    ))}
                </div>

                {/* NFT Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredNFTs.map((nft) => (
                        <Card key={nft.id} className="book-card hover:shadow-xl transition-all duration-300 overflow-hidden">
                            <CardContent className="p-0">
                                {/* NFT Image */}
                                <div className="relative h-80 bg-gradient-to-br from-burgundy/10 to-accent/10">
                                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                                        <div className="text-center">
                                            <BookOpen size={48} className="mx-auto mb-2" />
                                            <p className="text-sm">NFT Preview</p>
                                        </div>
                                    </div>
                                    {/* Rarity Badge */}
                                    <Badge className={`absolute top-3 left-3 ${getRarityColor(nft.rarity)} text-white capitalize`}>
                                        {nft.rarity}
                                    </Badge>
                                    {/* Status Badge */}
                                    <Badge className={`absolute top-3 right-3 ${getStatusColor(nft.status)} capitalize`}>
                                        {nft.status.replace('-', ' ')}
                                    </Badge>
                                </div>
                                
                                {/* NFT Details */}
                                <div className="p-6 space-y-4">
                                    <div>
                                        <h3 className="text-xl font-serif text-burgundy font-bold mb-2">{nft.title}</h3>
                                        <p className="text-gray-600 text-sm mb-2">{nft.description}</p>
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <BookOpen size={12} />
                                            <span>From: {nft.book}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-2xl font-bold text-burgundy">{nft.price}</p>
                                            <p className="text-xs text-gray-500">{nft.edition}</p>
                                        </div>
                                        <Button 
                                            className={`${nft.status === 'available' ? 'bg-primary hover:bg-primary/90' : 'bg-gray-400 cursor-not-allowed'} text-white`}
                                            onClick={() => handlePurchaseClick(nft)}
                                            disabled={nft.status !== 'available'}
                                        >
                                            <ShoppingCart size={16} className="mr-2" />
                                            {nft.status === 'available' ? 'Buy Now' : 
                                             nft.status === 'sold-out' ? 'Sold Out' : 
                                             'Coming Soon'}
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Newsletter Signup for NFT Updates */}
                <div className="mt-16">
                    <Card className="bg-burgundy text-white">
                        <CardContent className="p-8 text-center">
                            <h3 className="text-2xl font-bold mb-4">Get NFT Drop Notifications</h3>
                            <p className="mb-6 text-gray-200">
                                Be the first to know about new NFT releases, exclusive drops, and special collector events.
                            </p>
                            <NewsletterSignup variant="compact" className="max-w-md mx-auto" />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

const Footer = () => (
  <footer className="burgundy-section py-16 px-4 mt-16">
      <div className="max-w-7xl mx-auto">
          {/* Main footer content area */}
          <div className="grid md:grid-cols-2 gap-12 mb-12">
              
              {/* Left Side: Author Info & Links */}
              <div className="space-y-8">
                  <div>
                      <h3 className="text-2xl font-serif font-bold text-white mb-2">Ava Blackwood</h3>
                      <p className="text-gray-300 max-w-md">
                          Crafting tales of passion, power, and forbidden desire.
                      </p>
                  </div>
                  <div>
                      <h4 className="text-lg font-semibold mb-4 text-white">Quick Links</h4>
                      <ul className="space-y-2">
                          {['/', '/books', '/nft', '/about', '/blog', '/contact'].map(path => (
                              <li key={path}>
                                  <Link 
                                      to={path} 
                                      className="text-gray-300 underline hover:no-underline hover:text-white transition-colors capitalize"
                                  >
                                      {path.substring(1) || 'home'}
                                  </Link>
                              </li>
                          ))}
                      </ul>
                  </div>
              </div>

              {/* Right Side: Newsletter Signup */}
              <div>
                  <NewsletterSignup variant="footer" />
              </div>

          </div>

          {/* Bottom copyright bar */}
          <div className="border-t border-gray-600 pt-8 text-center text-gray-400">
              <p>&copy; {new Date().getFullYear()} Ava Blackwood. All rights reserved.</p>
          </div>
      </div>
  </footer>
);

// --- Main App Component ---
function App() {
    return (
        <Router>
            <Analytics />
            <div className="min-h-screen bg-background flex flex-col">
                <Navigation />
                <main className="flex-grow">
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/books" element={<BooksPage />} />
                        <Route path="/nft" element={<NFTPage />} />
                        <Route path="/about" element={<AboutPage />} />
                        <Route path="/contact" element={<ContactPage />} />
                        <Route path="/blog" element={<BlogList />} />
                        <Route path="/blog/:slug" element={<BlogPost />} />
                    </Routes>
                </main>
                <Footer />
            </div>
        </Router>
    );
}

export default App;