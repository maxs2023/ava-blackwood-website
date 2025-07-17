import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { BookOpen, Mail, ExternalLink, Calendar, User, Heart, Send, Star } from 'lucide-react'
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

// --- Analytics Component (Unchanged) ---
const Analytics = () => { /* ... */ };
const trackEvent = (eventName, eventParams) => { /* ... */ };
const isValidEmail = (email) => { /* ... */ };
const sanitizeInput = (input) => { /* ... */ };

// --- Book Data (Unchanged) ---
const booksData = { /* ... */ };

// --- REMOVED: The hardcoded blogPostsData array is no longer needed ---

// --- NewsletterSignup Component (Unchanged) ---
const NewsletterSignup = ({ variant, className }) => { /* ... */ };

// --- Contact Form Component (Unchanged) ---
const ContactForm = () => { /* ... */ };


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

  const HomePage = () => ( <div>{/*... Home Page Code Unchanged ...*/}</div> );
  const BooksPage = () => ( <div>{/*... Books Page Code Unchanged ...*/}</div> );
  const AboutPage = () => ( <div>...</div> );

  // --- START: UPDATED BLOG PAGE COMPONENT ---
  const BlogPage = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedPost, setSelectedPost] = useState(null);

    useEffect(() => {
      // GROQ query to fetch all documents of type 'post'
      // and order them by the published date in descending order.
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
    }, []); // The empty array ensures this effect runs only once

    const handlePostClick = (post) => {
      setSelectedPost(post);
      window.scrollTo(0, 0);
    };

    const handleBackClick = () => {
      setSelectedPost(null);
    };

    // --- Loading and Error States ---
    if (loading) {
      return <div className="text-center py-20">Loading posts...</div>;
    }
    if (error) {
      return <div className="text-center py-20 text-red-500">{error}</div>;
    }
    
    // --- Single Post View ---
    if (selectedPost) {
      return (
        <div className="min-h-screen py-12 px-4 bg-muted">
          <div className="max-w-3xl mx-auto">
            <Button variant="outline" onClick={handleBackClick} className="mb-8 bg-white">
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
                {/* Use PortableText to render rich text from Sanity */}
                <div className="blog-content text-lg text-charcoal">
                  <PortableText value={selectedPost.body} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }

    // --- Main Blog List View ---
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
                  {/* Note: The blog schema from Sanity doesn't have a summary field by default. You can add one! */}
                  <p className="text-gray-700 text-sm line-clamp-4">A look inside the latest musings from Ava Blackwood...</p>
                </CardContent>
                <div className="p-6 pt-0 mt-auto">
                  <Button variant="link" onClick={() => handlePostClick(post)} className="p-0 text-burgundy font-semibold">
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
  // --- END: UPDATED BLOG PAGE COMPONENT ---

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

// NOTE: I've left the HomePage and BooksPage components collapsed (`{/* ... */}`) 
// for brevity, as they were not changed. You should keep your original code for those.

export { ContactForm, NewsletterSignup };
export default App;