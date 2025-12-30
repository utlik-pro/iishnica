import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  category: "blog" | "news" | "article";
  featured_image_url: string | null;
  author: string | null;
  published_at: string | null;
  created_at: string;
}

type PostCategory = "blog" | "news" | "article";

const CATEGORIES: { value: PostCategory; label: string }[] = [
  { value: "blog", label: "Блог" },
  { value: "news", label: "Новости" },
  { value: "article", label: "Статьи" },
];

const BlogSection: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from("posts")
        .select("id, title, slug, excerpt, category, featured_image_url, author, published_at, created_at")
        .eq("is_published", true)
        .order("published_at", { ascending: false })
        .limit(6);

      if (error) throw error;
      setPosts((data as Post[]) || []);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryLabel = (category: PostCategory) => {
    return CATEGORIES.find((c) => c.value === category)?.label || category;
  };

  const getCategoryColor = (category: PostCategory) => {
    switch (category) {
      case "blog":
        return "bg-blue-100 text-blue-800";
      case "news":
        return "bg-green-100 text-green-800";
      case "article":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <section id="blog" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <p>Загрузка публикаций...</p>
        </div>
      </section>
    );
  }

  if (posts.length === 0) {
    return null;
  }

  return (
    <section id="blog" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
            Новости и <span className="gradient-text">публикации</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Статьи, новости и материалы о искусственном интеллекте и AI-сообществе
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {posts.map((post) => (
            <Link key={post.id} to={`/blog/${post.slug}`}>
              <Card className="h-full hover:shadow-lg transition-shadow overflow-hidden group">
                {post.featured_image_url && (
                  <div className="h-48 overflow-hidden">
                    <img
                      src={post.featured_image_url}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(
                        post.category
                      )}`}
                    >
                      {getCategoryLabel(post.category)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(post.published_at || post.created_at)}
                    </span>
                  </div>
                  <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
                    {post.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {post.excerpt && (
                    <p className="text-muted-foreground text-sm line-clamp-3">
                      {post.excerpt}
                    </p>
                  )}
                  {post.author && (
                    <p className="text-xs text-muted-foreground mt-3">
                      {post.author}
                    </p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="text-center">
          <Link to="/blog">
            <Button variant="outline" size="lg">
              Все публикации
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
