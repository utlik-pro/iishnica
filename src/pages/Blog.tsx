import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/seo/SEOHead";
import { BreadcrumbSchema } from "@/components/seo/StructuredData";
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

const CATEGORIES: { value: PostCategory | "all"; label: string }[] = [
  { value: "all", label: "Все" },
  { value: "blog", label: "Блог" },
  { value: "news", label: "Новости" },
  { value: "article", label: "Статьи" },
];

const Blog: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const categoryParam = searchParams.get("category") as PostCategory | null;
  const [activeCategory, setActiveCategory] = useState<PostCategory | "all">(
    categoryParam || "all"
  );

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    const category = searchParams.get("category") as PostCategory | null;
    setActiveCategory(category || "all");
  }, [searchParams]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("posts")
        .select("id, title, slug, excerpt, category, featured_image_url, author, published_at, created_at")
        .eq("is_published", true)
        .order("published_at", { ascending: false });

      if (error) throw error;
      setPosts((data as Post[]) || []);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (category: PostCategory | "all") => {
    setActiveCategory(category);
    if (category === "all") {
      searchParams.delete("category");
    } else {
      searchParams.set("category", category);
    }
    setSearchParams(searchParams);
  };

  const filteredPosts = activeCategory === "all"
    ? posts
    : posts.filter((p) => p.category === activeCategory);

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
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <>
      <SEOHead
        title="Блог"
        description="Блог M.AI.N - статьи, новости и материалы о искусственном интеллекте и AI-сообществе"
        url={`${baseUrl}/blog`}
        type="website"
      />
      <BreadcrumbSchema
        items={[
          { name: "Главная", url: baseUrl },
          { name: "Блог", url: `${baseUrl}/blog` },
        ]}
      />

      <div className="min-h-screen flex flex-col">
        <Navbar />

        <main className="flex-1 container mx-auto px-4 py-12">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-4xl font-bold mb-8 text-center">Блог</h1>

            {/* Category Filter */}
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {CATEGORIES.map((cat) => (
                <Button
                  key={cat.value}
                  variant={activeCategory === cat.value ? "default" : "outline"}
                  onClick={() => handleCategoryChange(cat.value)}
                >
                  {cat.label}
                </Button>
              ))}
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : filteredPosts.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">
                Публикации пока не добавлены
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPosts.map((post) => (
                  <Link key={post.id} to={`/blog/${post.slug}`}>
                    <Card className="h-full hover:shadow-lg transition-shadow overflow-hidden">
                      {post.featured_image_url && (
                        <div className="h-48 overflow-hidden">
                          <img
                            src={post.featured_image_url}
                            alt={post.title}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <CardHeader>
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className={`px-2 py-1 text-xs rounded ${getCategoryColor(
                              post.category
                            )}`}
                          >
                            {getCategoryLabel(post.category)}
                          </span>
                        </div>
                        <CardTitle className="line-clamp-2 text-lg hover:text-primary transition-colors">
                          {post.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {post.excerpt && (
                          <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
                            {post.excerpt}
                          </p>
                        )}
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          {post.author && <span>{post.author}</span>}
                          <span>{formatDate(post.published_at || post.created_at)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Blog;
