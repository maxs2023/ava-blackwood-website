// src/BlogList.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.jsx';
import sanityClient from './sanityClient.js';

const BlogList = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    sanityClient.fetch(`*[_type == "post" && defined(slug.current)] | order(publishedAt desc) {
      _id,
      title,
      slug,
      publishedAt,
      "mainImageUrl": mainImage.asset->url
    }`).then(data => {
      setPosts(data);
      setLoading(false);
    }).catch(err => {
      console.error("Error loading posts:", err);
      setError("Failed to load blog posts.");
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="text-center py-20 text-gray-600">Loading posts...</div>;
  if (error) return <div className="text-center py-20 text-red-500">{error}</div>;

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-serif text-burgundy mb-8 text-center">From the Desk of Ava Blackwood</h1>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map(post => (
            <Card key={post._id} className="flex flex-col hover:shadow-lg transition-shadow">
              {post.mainImageUrl && (
                <img src={post.mainImageUrl} alt={post.title} className="w-full aspect-video object-cover" />
              )}
              <CardHeader>
                <CardTitle className="text-2xl font-serif text-burgundy line-clamp-2">{post.title}</CardTitle>
                <CardDescription className="text-sm text-gray-500">
                  {new Date(post.publishedAt).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-gray-700 text-sm">A look inside the latest musings from Ava Blackwood...</p>
              </CardContent>
              <div className="p-6 pt-0 mt-auto">
                <Link to={`/blog/${post.slug.current}`} className="text-burgundy font-semibold hover:text-burgundy/80">
                  Read More →
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
