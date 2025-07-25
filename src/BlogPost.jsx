// Fixed BlogPost.jsx with copyToClipboard function
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import sanityClient from './sanityClient.js';
import { PortableText } from '@portabletext/react';
import { Calendar, User, Share2, Copy, Check } from 'lucide-react';

const BlogPost = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copySuccess, setCopySuccess] = useState(false);

  // Add the missing copyToClipboard function
  const copyToClipboard = async (text) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        // Use the modern Clipboard API if available
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for older browsers or non-secure contexts
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
      return true;
    } catch (err) {
      console.error('Failed to copy text: ', err);
      return false;
    }
  };

  // Share functionality
  const handleShare = async () => {
    const url = window.location.href;
    const title = post?.title || 'Blog Post';
    
    if (navigator.share) {
      // Use native sharing if available
      try {
        await navigator.share({
          title: title,
          text: `Check out this blog post: ${title}`,
          url: url,
        });
      } catch (err) {
        // If native sharing fails, fall back to copying URL
        copyToClipboard(url);
      }
    } else {
      // Fall back to copying URL to clipboard
      copyToClipboard(url);
    }
  };

  const ptComponents = {
    block: {
      h2: ({ children }) => <h2 className="text-2xl font-serif font-bold my-6 text-burgundy">{children}</h2>,
      h3: ({ children }) => <h3 className="text-xl font-serif font-bold my-4 text-burgundy">{children}</h3>,
      blockquote: ({ children }) => <blockquote className="border-l-4 border-accent pl-4 italic my-6 text-gray-600">{children}</blockquote>,
      normal: ({ children }) => <p className="mb-4 leading-relaxed">{children}</p>,
    },
    list: {
      bullet: ({ children }) => <ul className="list-disc pl-5 my-6 space-y-2 text-gray-700">{children}</ul>,
      number: ({ children }) => <ol className="list-decimal pl-5 my-6 space-y-2 text-gray-700">{children}</ol>,
    },
    listItem: {
      bullet: ({ children }) => <li className="leading-relaxed">{children}</li>,
      number: ({ children }) => <li className="leading-relaxed">{children}</li>,
    },
    marks: {
      strong: ({ children }) => <strong className="font-bold text-burgundy">{children}</strong>,
      em: ({ children }) => <em className="italic">{children}</em>,
      underline: ({ children }) => <u>{children}</u>,
      code: ({ children }) => <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">{children}</code>,
    },
  };

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const data = await sanityClient.fetch(`*[_type == "post" && slug.current == $slug][0]{
          title,
          publishedAt,
          body,
          "mainImageUrl": mainImage.asset->url,
          author->{name},
          "excerpt": pt::text(body[0...3])
        }`, { slug });
        
        setPost(data);
      } catch (error) {
        console.error('Error fetching post:', error);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchPost();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen py-12 px-4 bg-muted">
        <div className="max-w-3xl mx-auto">
          <div className="text-center py-20 text-gray-600">
            <div className="animate-pulse">Loading post...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen py-12 px-4 bg-muted">
        <div className="max-w-3xl mx-auto">
          <div className="text-center py-20">
            <h1 className="text-2xl font-bold text-red-500 mb-4">Post not found</h1>
            <p className="text-gray-600 mb-8">The blog post you're looking for doesn't exist or has been removed.</p>
            <Link to="/blog" className="text-burgundy hover:underline">
              ← Back to Blog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* SEO Meta Tags */}
      <title>{`${post.title} | Ava Blackwood`}</title>
      <meta name="description" content={post.excerpt || `Read the blog post "${post.title}" by Ava Blackwood.`} />
      {post.mainImageUrl && (
        <meta property="og:image" content={post.mainImageUrl} />
      )}
      <meta property="og:title" content={post.title} />
      <meta property="og:description" content={post.excerpt || "A blog post by Ava Blackwood"} />
      <meta property="og:type" content="article" />
      <meta property="og:url" content={window.location.href} />

      <div className="min-h-screen py-12 px-4 bg-muted">
        <div className="max-w-3xl mx-auto">
          <Link 
            to="/blog" 
            className="text-burgundy text-sm font-semibold hover:underline mb-8 inline-block"
          >
            ← Back to Blog
          </Link>
          
          <Card className="bg-white overflow-hidden shadow-lg">
            {post.mainImageUrl && (
              <div className="w-full aspect-video overflow-hidden">
                <img 
                  src={post.mainImageUrl} 
                  alt={post.title} 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <CardHeader className="pb-4">
              <CardTitle className="text-4xl font-serif text-burgundy leading-tight">
                {post.title}
              </CardTitle>
              
              <CardDescription className="flex items-center justify-between pt-4">
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  {post.author?.name && (
                    <span className="flex items-center gap-2">
                      <User size={14} /> 
                      {post.author.name}
                    </span>
                  )}
                  {post.publishedAt && (
                    <span className="flex items-center gap-2">
                      <Calendar size={14} /> 
                      {new Date(post.publishedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  )}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                  className="flex items-center gap-2"
                >
                  {copySuccess ? (
                    <>
                      <Check size={14} />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Share2 size={14} />
                      Share
                    </>
                  )}
                </Button>
              </CardDescription>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="blog-content text-lg text-gray-700 leading-relaxed">
                {post.body && post.body.length > 0 ? (
                  <PortableText value={post.body} components={ptComponents} />
                ) : (
                  <p className="text-gray-500 italic">No content available for this post.</p>
                )}
              </div>
              
              {/* Social sharing section */}
              <div className="mt-12 pt-8 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-burgundy mb-2">
                      Enjoyed this post?
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Share it with others who might find it interesting.
                    </p>
                  </div>
                  <Button
                    onClick={handleShare}
                    className="bg-burgundy hover:bg-burgundy/90 text-white"
                  >
                    <Share2 size={16} className="mr-2" />
                    Share Post
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Related posts or back to blog section */}
          <div className="mt-8 text-center">
            <Link 
              to="/blog" 
              className="inline-flex items-center text-burgundy hover:underline font-medium"
            >
              ← Read more blog posts
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default BlogPost;