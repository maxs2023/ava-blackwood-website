// src/BlogList.jsx - Updated with improved functionality
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.jsx';
import sanityClient from './sanityClient.js';

const BlogList = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Enhanced query to fetch body content for excerpts
    sanityClient.fetch(`*[_type == "post" && defined(slug.current)] | order(publishedAt desc) {
      _id,
      title,
      slug,
      publishedAt,
      "mainImageUrl": mainImage.asset->url,
      "excerpt": pt::text(body[0...3]),
      body
    }`).then(data => {
      setPosts(data);
      setLoading(false);
    }).catch(err => {
      console.error("Error loading posts:", err);
      setError("Failed to load blog posts.");
      setLoading(false);
    });
  }, []);

  // Function to create excerpt from post content
  const createExcerpt = (post) => {
    if (post.excerpt && post.excerpt.trim()) {
      const cleanExcerpt = post.excerpt
        .replace(/\n/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      if (cleanExcerpt.length > 150) {
        return cleanExcerpt.substring(0, 150).trim() + '...';
      }
      return cleanExcerpt;
    }
    
    return `Explore the depths of desire and forbidden attraction in this captivating piece from Ava Blackwood's collection.`;
  };

  if (loading) return <div className="text-center py-20 text-gray-600">Loading posts...</div>;
  if (error) return <div className="text-center py-20 text-red-500">{error}</div>;

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-serif text-burgundy mb-8 text-center">From the Desk of Ava Blackwood</h1>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map(post => (
            <Card 
              key={post._id} 
              className="flex flex-col hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer group overflow-hidden"
            >
              {post.mainImageUrl && (
                <div className="w-full aspect-video overflow-hidden">
                  <img 
                    src={post.mainImageUrl} 
                    alt={post.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                  />
                </div>
              )}
              <CardHeader className="pb-3">
                <CardTitle className="text-xl font-serif text-burgundy line-clamp-2 group-hover:text-burgundy/80 transition-colors">
                  {post.title}
                </CardTitle>
                <CardDescription className="text-sm text-gray-500">
                  {new Date(post.publishedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow pb-4">
                <p className="text-gray-700 text-sm leading-relaxed line-clamp-4">
                  {createExcerpt(post)}
                </p>
              </CardContent>
              <div className="p-6 pt-0 mt-auto">
                <Link 
                  to={`/blog/${post.slug.current}`} 
                  className="inline-flex items-center text-burgundy font-semibold hover:text-burgundy/80 transition-colors group-hover:translate-x-1 transform duration-200"
                >
                  Read More 
                  <span className="ml-1 group-hover:ml-2 transition-all duration-200">→</span>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BlogList;