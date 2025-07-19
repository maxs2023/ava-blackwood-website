// src/BlogPost.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button } from '@/components/ui/card.jsx';
import sanityClient from '../sanityClient.js';
import { PortableText } from '@portabletext/react';
import { Calendar, User } from 'lucide-react';

const BlogPost = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  const ptComponents = {
    block: {
      h2: ({ children }) => <h2 className="text-2xl font-serif font-bold my-6 text-burgundy">{children}</h2>,
      blockquote: ({ children }) => <blockquote className="border-l-4 border-accent pl-4 italic my-6 text-gray-600">{children}</blockquote>,
    },
    list: {
      bullet: ({ children }) => <ul className="list-disc pl-5 my-6 space-y-2 text-gray-700">{children}</ul>,
    },
    listItem: {
      bullet: ({ children }) => <li className="leading-relaxed">{children}</li>,
    },
    marks: {
      strong: ({ children }) => <strong className="font-bold text-burgundy">{children}</strong>,
      em: ({ children }) => <em className="italic">{children}</em>,
    },
  };

  useEffect(() => {
    sanityClient.fetch(`*[_type == "post" && slug.current == $slug][0]{
      title,
      publishedAt,
      body,
      "mainImageUrl": mainImage.asset->url,
      author->{name}
    }`, { slug }).then(data => {
      setPost(data);
      setLoading(false);
    });
  }, [slug]);

  if (loading) return <div className="text-center py-20 text-gray-600">Loading post...</div>;
  if (!post) return <div className="text-center py-20 text-red-500">Post not found.</div>;

  return (
    <div className="min-h-screen py-12 px-4 bg-muted">
      <div className="max-w-3xl mx-auto">
        <Link to="/blog" className="text-burgundy text-sm font-semibold hover:underline mb-8 inline-block">
          ← Back to Blog
        </Link>
        <Card className="bg-white overflow-hidden">
          {post.mainImageUrl && (
            <img src={post.mainImageUrl} alt={post.title} className="w-full aspect-video object-cover" />
          )}
          <CardHeader>
            <CardTitle className="text-4xl font-serif text-burgundy">{post.title}</CardTitle>
            <CardDescription className="flex items-center gap-4 text-sm text-gray-500 pt-2">
              {post.author?.name && <span className="flex items-center gap-2"><User size={14} /> {post.author.name}</span>}
              {post.publishedAt && <span className="flex items-center gap-2"><Calendar size={14} /> {new Date(post.publishedAt).toLocaleDateString()}</span>}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="blog-content text-lg text-gray-700 leading-relaxed space-y-4">
              <PortableText value={post.body} components={ptComponents} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BlogPost;
