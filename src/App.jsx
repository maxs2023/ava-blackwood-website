import React, { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { BookOpen, Mail, ExternalLink, Calendar, User, Heart, Send, CheckCircle, AlertCircle } from 'lucide-react'
import { sendContactEmail, sendNewsletterWelcome, isValidEmail, sanitizeInput } from './services/emailService'
import './App.css'

// Sample book data based on research
const booksData = {
  darkAcademia: [
    {
      id: 1,
      title: "Playing with Fire",
      description: "Delve into Playing with Fire, where the forbidden allure of a professor-student romance ignites amidst the storied halls of Blackwood Academy.",
      amazonUrl: "https://www.amazon.com/Playing-Fire-Romance-Ava-Blackwood-ebook/dp/B0F9PYXD8R",
      publishDate: "2024",
      series: "Blackwood Academy",
      cover: "/api/placeholder/300/450"
    },
    {
      id: 2,
      title: "Control and Release",
      description: "Control and Release is an electrifying exploration of forbidden attraction and the intricate dance of power dynamics in academia.",
      amazonUrl: "https://www.amazon.com/Control-Release-Ava-Blackwood-ebook/dp/B0F9FQMW9L",
      publishDate: "2024",
      series: "Blackwood Academy",
      cover: "/api/placeholder/300/450"
    },
    {
      id: 3,
      title: "Preludes of Desire",
      description: "Seventeen-year-old piano prodigy Evelina Moreau has always used her music to control the world around her.",
      amazonUrl: "https://www.amazon.com/Preludes-Desire-Ava-Blackwood/dp/B0F91VK6GX",
      publishDate: "2024",
      series: "Standalone",
      cover: "/api/placeholder/300/450"
    },
    {
      id: 4,
      title: "En Pointe",
      description: "En Pointe is a story of passion, ambition, and forbidden love set against the backdrop of the illustrious Opéra Garnier.",
      amazonUrl: "https://www.amazon.com/En-Pointe-Ava-Blackwood-ebook/dp/B0F9PQNGSG",
      publishDate: "2024",
      series: "Standalone",
      cover: "/api/placeholder/300/450"
    }
  ],
  medical: [
    {
      id: 5,
      title: "Under Surgical Lights",
      description: "A provocative medical romance exploring power dynamics in the high-stakes world of surgery.",
      amazonUrl: "https://www.amazon.com/Under-Surgical-Lights-Ava-Blackwood/dp/B0F9FTLSC3",
      publishDate: "2024",
      series: "Medical Romance",
      cover: "/api/placeholder/300/450"
    }
  ],
  sports: [
    {
      id: 6,
      title: "Volley of Temptation",
      description: "A dark academia sports romance that explores the tension between competition and desire.",
      amazonUrl: "https://www.amazon.com/Volley-Temptation-Romance-Ava-Blackwood-ebook/dp/B0F9Q1K3GD",
      publishDate: "2024",
      series: "Sports Romance",
      cover: "/api/placeholder/300/450"
    }
  ]
}

// Newsletter Signup Component
const NewsletterSignup = ({ className = "", variant = "default" }) => {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!isValidEmail(email)) {
      setStatus('invalid-email')
      return
    }

    setIsSubmitting(true)
    setStatus(null)

    try {
      const result = await sendNewsletterWelcome(email, sanitizeInput(name))
      
      if (result.success) {
        setStatus('success')
        setEmail('')
        setName('')
      } else {
        setStatus('error')
      }
    } catch (error) {
      console.error('Newsletter signup error:', error)
      setStatus('error')
    }
    
    setIsSubmitting(false)
  }

  if (status === 'success') {
    return (
      <div className={`text-center p-6 bg-green-50 border border-green-200 rounded-lg ${className}`}>
        <CheckCircle className="mx-auto mb-3 text-green-600" size={32} />
        <h3 className="text-lg font-serif text-green-800 mb-2">Welcome to the Circle! 🎉</h3>
        <p className="text-green-700">
          Check your email for a welcome message with exclusive content and updates.
        </p>
      </div>
    )
  }

  const isCompact = variant === "compact"

  return (
    <div className={className}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className={isCompact ? "flex flex-col sm:flex-row gap-2" : "grid grid-cols-1 sm:grid-cols-2 gap-4"}>
          {!isCompact && (
            <Input
              type="text"
              placeholder="Your name (optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-white"
            />
          )}
          <Input
            type="email"
            placeholder="Your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-white"
          />
        </div>
        
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className={`${isCompact ? 'w-full sm:w-auto' : 'w-full'} gold-button`}
        >
          {isSubmitting ? (
            <>
              <span className="animate-spin mr-2">⏳</span>
              Subscribing...
            </>
          ) : (
            <>
              <Mail size={16} className="mr-2" />
              Join the Dark Academia Circle
            </>
          )}
        </Button>
        
        {status === 'error' && (
          <div className="flex items-center text-red-600 text-sm">
            <AlertCircle size={16} className="mr-2" />
            Something went wrong. Please try again.
          </div>
        )}
        
        {status === 'invalid-email' && (
          <div className="flex items-center text-red-600 text-sm">
            <AlertCircle size={16} className="mr-2" />
            Please enter a valid email address.
          </div>
        )}
      </form>
      
      {!isCompact && (
        <p className="text-xs text-gray-500 text-center mt-2">
          No spam, ever. Unsubscribe anytime with one click.
        </p>
      )}
    </div>
  )
}

// Contact Form Component
const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: sanitizeInput(value)
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!isValidEmail(formData.email)) {
      setSubmitStatus('invalid-email')
      return
    }

    setIsSubmitting(true)
    setSubmitStatus(null)

    try {
      const result = await sendContactEmail(formData)
      
      if (result.success) {
        setSubmitStatus('success')
        setFormData({ name: '', email: '', subject: '', message: '' })
      } else {
        setSubmitStatus('error')
        console.error('Contact form error:', result.error)
      }
    } catch (error) {
      console.error('Contact form error:', error)
      setSubmitStatus('error')
    }
    
    setIsSubmitting(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-burgundy">Send a Message</CardTitle>
        <CardDescription>
          I'd love to hear from you! Whether it's about my books, collaboration opportunities, or just to say hello.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Name *</label>
              <Input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Your full name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email *</label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="your.email@example.com"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Subject *</label>
            <Input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
              placeholder="What's this about?"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Message *</label>
            <Textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              placeholder="Your message here..."
              rows="6"
            />
          </div>
          
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full gold-button"
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Sending...
              </>
            ) : (
              <>
                <Send size={16} className="mr-2" />
                Send Message
              </>
            )}
          </Button>
          
          {submitStatus === 'success' && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-md">
              <div className="flex items-center">
                <CheckCircle className="text-green-600 mr-2" size={20} />
                <p className="text-green-800">
                  Message sent successfully! I'll get back to you soon.
                </p>
              </div>
            </div>
          )}
          
          {submitStatus === 'error' && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center">
                <AlertCircle className="text-red-600 mr-2" size={20} />
                <p className="text-red-800">
                  Failed to send message. Please try again or email me directly at contact@avablackwood.com
                </p>
              </div>
            </div>
          )}
          
          {submitStatus === 'invalid-email' && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center">
                <AlertCircle className="text-red-600 mr-2" size={20} />
                <p className="text-red-800">
                  Please enter a valid email address.
                </p>
              </div>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}

function App() {
  const [currentPage, setCurrentPage] = useState('home')

  const Navigation = () => (
    <nav className="bg-white shadow-sm border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-serif text-burgundy font-bold cursor-pointer" 
                onClick={() => setCurrentPage('home')}>
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
          <div className="md:hidden">
            <button className="text-gray-700 hover:text-burgundy">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )

  const HomePage = () => (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-section py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="text-center md:text-left">
              <h1 className="text-5xl md:text-6xl font-serif text-white mb-6">
                Unlock the Secrets of the Heart
              </h1>
              <p className="text-xl text-gray-200 mb-8 leading-relaxed">
                Discover dark and enchanting tales where passion and mystery entwine. 
                Journey through shadowy halls and hidden pasts, where forbidden love defies the darkness.
              </p>
              <Button 
                className="gold-button text-lg px-8 py-3"
                onClick={() => setCurrentPage('books')}
              >
                View Books
              </Button>
            </div>
            <div className="flex justify-center">
              <div className="book-card bg-white p-4 rounded-lg shadow-2xl max-w-sm">
                <img 
                  src="/api/placeholder/300/450" 
                  alt="Latest Book" 
                  className="w-full rounded-md"
                />
                <h3 className="text-xl font-serif text-burgundy mt-4 text-center">
                  Playing with Fire
                </h3>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <h2 className="text-4xl font-serif text-burgundy mb-6">About Ava</h2>
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                Ava Blackwood weaves tales of romance and intrigue set against the backdrop of dark academia. 
                With a passion for stories that explore the complexities of power, desire, and restraint, 
                her novels are a journey into worlds both beautiful and mysterious.
              </p>
              <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                Drawing from her background in literature and behavioral psychology, Ava brings psychological 
                insight and slow-burn tension to every page. Her stories explore the forbidden allure of 
                academic settings and the intricate dance of human connection.
              </p>
              <Button 
                variant="outline" 
                className="border-burgundy text-burgundy hover:bg-burgundy hover:text-white"
                onClick={() => setCurrentPage('about')}
              >
                Learn More
              </Button>
            </div>
            <div className="order-1 md:order-2 flex justify-center">
              <div className="w-80 h-80 bg-gray-200 rounded-lg flex items-center justify-center">
                <User size={80} className="text-gray-400" />
                <span className="ml-4 text-gray-500">Author Photo</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Books */}
      <section className="py-16 px-4 bg-muted">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-serif text-burgundy text-center mb-12">Featured Books</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {booksData.darkAcademia.slice(0, 3).map((book) => (
              <Card key={book.id} className="book-card cursor-pointer">
                <CardContent className="p-6">
                  <img 
                    src={book.cover} 
                    alt={book.title}
                    className="w-full h-64 object-cover rounded-md mb-4"
                  />
                  <h3 className="text-xl font-serif text-burgundy mb-2">{book.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">{book.description}</p>
                  <Button 
                    className="w-full gold-button"
                    onClick={() => window.open(book.amazonUrl, '_blank')}
                  >
                    <ExternalLink size={16} className="mr-2" />
                    Buy on Amazon
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="burgundy-section py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-serif text-white mb-6">Join the Dark Academia Circle</h2>
          <p className="text-xl text-gray-200 mb-8">
            Subscribe to receive exclusive content, early access to new releases, and behind-the-scenes insights into the world of dark academia romance.
          </p>
          <div className="max-w-md mx-auto">
            <NewsletterSignup variant="compact" />
          </div>
        </div>
      </section>
    </div>
  )

  const BooksPage = () => (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-serif text-burgundy text-center mb-12">Books by Ava Blackwood</h1>
        
        {/* Dark Academia Series */}
        <section className="mb-16">
          <h2 className="text-3xl font-serif text-burgundy mb-8">Dark Academia Series</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {booksData.darkAcademia.map((book) => (
              <Card key={book.id} className="book-card">
                <CardContent className="p-4">
                  <img 
                    src={book.cover} 
                    alt={book.title}
                    className="w-full h-64 object-cover rounded-md mb-4"
                  />
                  <h3 className="text-lg font-serif text-burgundy mb-2">{book.title}</h3>
                  <Badge variant="secondary" className="mb-2">{book.series}</Badge>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">{book.description}</p>
                  <div className="flex items-center text-xs text-gray-500 mb-4">
                    <Calendar size={12} className="mr-1" />
                    {book.publishDate}
                  </div>
                  <Button 
                    className="w-full gold-button text-sm"
                    onClick={() => window.open(book.amazonUrl, '_blank')}
                  >
                    <ExternalLink size={14} className="mr-2" />
                    Buy on Amazon
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Medical Romance */}
        <section className="mb-16">
          <h2 className="text-3xl font-serif text-burgundy mb-8">Medical Romance</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {booksData.medical.map((book) => (
              <Card key={book.id} className="book-card">
                <CardContent className="p-4">
                  <img 
                    src={book.cover} 
                    alt={book.title}
                    className="w-full h-64 object-cover rounded-md mb-4"
                  />
                  <h3 className="text-lg font-serif text-burgundy mb-2">{book.title}</h3>
                  <Badge variant="secondary" className="mb-2">{book.series}</Badge>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">{book.description}</p>
                  <div className="flex items-center text-xs text-gray-500 mb-4">
                    <Calendar size={12} className="mr-1" />
                    {book.publishDate}
                  </div>
                  <Button 
                    className="w-full gold-button text-sm"
                    onClick={() => window.open(book.amazonUrl, '_blank')}
                  >
                    <ExternalLink size={14} className="mr-2" />
                    Buy on Amazon
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Sports Romance */}
        <section className="mb-16">
          <h2 className="text-3xl font-serif text-burgundy mb-8">Sports Romance</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {booksData.sports.map((book) => (
              <Card key={book.id} className="book-card">
                <CardContent className="p-4">
                  <img 
                    src={book.cover} 
                    alt={book.title}
                    className="w-full h-64 object-cover rounded-md mb-4"
                  />
                  <h3 className="text-lg font-serif text-burgundy mb-2">{book.title}</h3>
                  <Badge variant="secondary" className="mb-2">{book.series}</Badge>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">{book.description}</p>
                  <div className="flex items-center text-xs text-gray-500 mb-4">
                    <Calendar size={12} className="mr-1" />
                    {book.publishDate}
                  </div>
                  <Button 
                    className="w-full gold-button text-sm"
                    onClick={() => window.open(book.amazonUrl, '_blank')}
                  >
                    <ExternalLink size={14} className="mr-2" />
                    Buy on Amazon
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Newsletter Signup */}
        <section className="bg-muted p-8 rounded-lg">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-2xl font-serif text-burgundy mb-4">Stay Updated</h3>
            <p className="text-gray-700 mb-6">
              Be the first to know about new releases, exclusive content, and special promotions.
            </p>
            <NewsletterSignup />
          </div>
        </section>
      </div>
    </div>
  )

  const AboutPage = () => (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div>
            <h1 className="text-5xl font-serif text-burgundy mb-8">About Ava Blackwood</h1>
            <div className="prose prose-lg">
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                Ava C. Blackwood writes provocative, emotionally layered romance for the dark-hearted and the quietly daring. 
                With a background in literature and behavioral psychology, Ava brings psychological insight and slow-burn tension to every page.
              </p>
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                Her stories explore power, desire, and restraint within the atmospheric settings of dark academia. 
                From the shadowed halls of prestigious universities to the intimate spaces where forbidden connections bloom, 
                Ava's novels delve into the complexities of human attraction and the psychology of desire.
              </p>
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                When she's not crafting tales of forbidden romance, Ava can be found researching historical academic institutions, 
                studying the psychology of power dynamics, or lost in the stacks of university libraries seeking inspiration 
                for her next dark academia masterpiece.
              </p>
              <h2 className="text-2xl font-serif text-burgundy mb-4">Writing Philosophy</h2>
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                "I believe that the most compelling romances are born from tension—the push and pull between characters, 
                the forbidden nature of their connection, and the psychological complexity that drives them together. 
                Dark academia provides the perfect backdrop for these intense, transformative relationships."
              </p>
            </div>
          </div>
          <div className="space-y-8">
            <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
              <User size={80} className="text-gray-400" />
              <span className="ml-4 text-gray-500">Professional Author Photo</span>
            </div>
            <Card>
              <CardHeader>
                <CardTitle className="text-burgundy">Quick Facts</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-700">
                  <li><strong>Genre:</strong> Dark Academia Romance</li>
                  <li><strong>Background:</strong> Literature & Behavioral Psychology</li>
                  <li><strong>Writing Style:</strong> Psychological insight, slow-burn tension</li>
                  <li><strong>Themes:</strong> Power dynamics, forbidden attraction, academic settings</li>
                  <li><strong>Inspiration:</strong> University libraries, gothic architecture, classical literature</li>
                </ul>
              </CardContent>
            </Card>
            
            {/* Newsletter Signup */}
            <Card>
              <CardHeader>
                <CardTitle className="text-burgundy">Stay Connected</CardTitle>
                <CardDescription>
                  Join my newsletter for exclusive content and updates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <NewsletterSignup />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )

  const BlogPage = () => (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-serif text-burgundy text-center mb-12">Blog</h1>
        <div className="text-center py-20">
          <BookOpen size={64} className="mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-serif text-gray-600 mb-4">Coming Soon</h2>
          <p className="text-gray-500 mb-8">
            Ava will be sharing insights about dark academia, writing process, and the psychology behind her characters.
          </p>
          
          {/* Newsletter Signup */}
          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-burgundy">Be Notified</CardTitle>
                <CardDescription>
                  Subscribe to be the first to read new blog posts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <NewsletterSignup />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )

  const ContactPage = () => (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-serif text-burgundy text-center mb-12">Contact</h1>
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-serif text-burgundy mb-6">Get in Touch</h2>
            <p className="text-lg text-gray-700 mb-8">
              Connect with Ava for media inquiries, book club discussions, collaboration opportunities, or to share your thoughts about her novels.
            </p>
            <div className="space-y-4 mb-8">
              <div className="flex items-center">
                <Mail className="text-burgundy mr-3" size={20} />
                <span>contact@avablackwood.com</span>
              </div>
              <div className="flex items-center">
                <Heart className="text-burgundy mr-3" size={20} />
                <span>Follow on social media for updates</span>
              </div>
            </div>
            
            {/* Professional Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-burgundy">Professional Inquiries</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div>
                    <strong>Media & Interviews:</strong> media@avablackwood.com
                  </div>
                  <div>
                    <strong>Book Clubs & Events:</strong> books@avablackwood.com
                  </div>
                  <div>
                    <strong>General Contact:</strong> hello@avablackwood.com
                  </div>
                  <div>
                    <strong>Newsletter:</strong> newsletter@avablackwood.com
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  )

  const Footer = () => (
    <footer className="burgundy-section py-8 px-4 mt-16">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8 text-center md:text-left">
          <div>
            <h3 className="text-2xl font-serif text-white mb-4">Ava Blackwood</h3>
            <p className="text-gray-200 mb-4">Dark Academia Romance Author</p>
            <p className="text-sm text-gray-300">
              Exploring the shadows between knowledge and desire
            </p>
          </div>
          
          <div>
            <h4 className="text-lg font-serif text-white mb-4">Quick Links</h4>
            <div className="space-y-2">
              <button 
                onClick={() => setCurrentPage('books')}
                className="block text-gray-200 hover:text-gold transition-colors"
              >
                Books
              </button>
              <button 
                onClick={() => setCurrentPage('about')}
                className="block text-gray-200 hover:text-gold transition-colors"
              >
                About
              </button>
              <button 
                onClick={() => setCurrentPage('contact')}
                className="block text-gray-200 hover:text-gold transition-colors"
              >
                Contact
              </button>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-serif text-white mb-4">Stay Connected</h4>
            <p className="text-gray-200 text-sm mb-4">
              Join the newsletter for exclusive content and updates
            </p>
            <NewsletterSignup variant="compact" className="max-w-sm mx-auto md:mx-0" />
          </div>
        </div>
        
        <div className="border-t border-gray-600 mt-8 pt-8 text-center">
          <p className="text-sm text-gray-300">
            © 2024 Ava Blackwood. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )

  const renderPage = () => {
    switch(currentPage) {
      case 'home': return <HomePage />
      case 'books': return <BooksPage />
      case 'about': return <AboutPage />
      case 'blog': return <BlogPage />
      case 'contact': return <ContactPage />
      default: return <HomePage />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      {renderPage()}
      <Footer />
    </div>
  )
}

export default App

