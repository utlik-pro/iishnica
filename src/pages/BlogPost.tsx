import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/seo/SEOHead";
import {
  BlogPostingSchema,
  ArticleSchema,
  NewsArticleSchema,
  BreadcrumbSchema,
} from "@/components/seo/StructuredData";
import { Button } from "@/components/ui/button";

interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  category: "blog" | "news" | "article";
  featured_image_url: string | null;
  meta_title: string | null;
  meta_description: string | null;
  og_image_url: string | null;
  author: string | null;
  is_published: boolean;
  published_at: string | null;
  view_count: number;
  created_at: string;
  updated_at: string;
}

type PostCategory = "blog" | "news" | "article";

const CATEGORIES: { value: PostCategory; label: string }[] = [
  { value: "blog", label: "Блог" },
  { value: "news", label: "Новости" },
  { value: "article", label: "Статьи" },
];

const BlogPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      fetchPost(slug);
    }
  }, [slug]);

  const fetchPost = async (postSlug: string) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from("posts")
        .select("*")
        .eq("slug", postSlug)
        .eq("is_published", true)
        .single();

      if (fetchError) {
        if (fetchError.code === "PGRST116") {
          setError("Публикация не найдена");
        } else {
          throw fetchError;
        }
        return;
      }

      setPost(data as Post);

      // Increment view count
      await supabase
        .from("posts")
        .update({ view_count: (data as Post).view_count + 1 })
        .eq("id", (data as Post).id);
    } catch (err) {
      console.error("Error fetching post:", err);
      setError("Ошибка загрузки публикации");
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
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-12 flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold mb-4">{error || "Публикация не найдена"}</h1>
          <Link to="/blog">
            <Button>Вернуться к блогу</Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const seoTitle = post.meta_title || post.title;
  const seoDescription = post.meta_description || post.excerpt || "";
  const seoImage = post.og_image_url || post.featured_image_url || undefined;
  const postUrl = `${baseUrl}/blog/${post.slug}`;
  const authorName = post.author || "M.AI.N Team";

  return (
    <>
      <SEOHead
        title={seoTitle}
        description={seoDescription}
        image={seoImage}
        url={postUrl}
        type="article"
        publishedAt={post.published_at || post.created_at}
        modifiedAt={post.updated_at}
        author={authorName}
      />

      {/* Structured Data based on category */}
      {post.category === "blog" && (
        <BlogPostingSchema
          title={post.title}
          description={seoDescription}
          image={seoImage}
          datePublished={post.published_at || post.created_at}
          dateModified={post.updated_at}
          author={authorName}
          url={postUrl}
        />
      )}
      {post.category === "news" && (
        <NewsArticleSchema
          title={post.title}
          description={seoDescription}
          image={seoImage}
          datePublished={post.published_at || post.created_at}
          dateModified={post.updated_at}
          author={authorName}
          url={postUrl}
        />
      )}
      {post.category === "article" && (
        <ArticleSchema
          title={post.title}
          description={seoDescription}
          image={seoImage}
          datePublished={post.published_at || post.created_at}
          dateModified={post.updated_at}
          author={authorName}
          url={postUrl}
          category={getCategoryLabel(post.category)}
        />
      )}

      <BreadcrumbSchema
        items={[
          { name: "Главная", url: baseUrl },
          { name: "Блог", url: `${baseUrl}/blog` },
          { name: post.title, url: postUrl },
        ]}
      />

      <div className="min-h-screen flex flex-col">
        <Navbar />

        <main className="flex-1">
          {/* Hero with featured image */}
          {post.featured_image_url && (
            <div className="w-full h-64 md:h-96 overflow-hidden">
              <img
                src={post.featured_image_url}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <article className="container mx-auto px-4 py-12">
            <div className="max-w-3xl mx-auto">
              {/* Breadcrumbs */}
              <nav className="text-sm mb-6">
                <Link to="/" className="text-muted-foreground hover:text-primary">
                  Главная
                </Link>
                <span className="mx-2 text-muted-foreground">/</span>
                <Link to="/blog" className="text-muted-foreground hover:text-primary">
                  Блог
                </Link>
                <span className="mx-2 text-muted-foreground">/</span>
                <span className="text-foreground">{post.title}</span>
              </nav>

              {/* Category badge */}
              <div className="mb-4">
                <Link to={`/blog?category=${post.category}`}>
                  <span
                    className={`inline-block px-3 py-1 text-sm rounded-full ${getCategoryColor(
                      post.category
                    )} hover:opacity-80 transition-opacity`}
                  >
                    {getCategoryLabel(post.category)}
                  </span>
                </Link>
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{post.title}</h1>

              {/* Meta info */}
              <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-8 pb-8 border-b">
                {post.author && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{post.author}</span>
                  </div>
                )}
                <span>{formatDate(post.published_at || post.created_at)}</span>
                <span>{post.view_count} просмотров</span>
              </div>

              {/* Content */}
              <div
                className="prose prose-lg max-w-none prose-headings:font-bold prose-a:text-primary prose-img:rounded-lg"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              {/* Back to blog */}
              <div className="mt-12 pt-8 border-t">
                <Link to="/blog">
                  <Button variant="outline">
                    &larr; Вернуться к блогу
                  </Button>
                </Link>
              </div>
            </div>
          </article>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default BlogPost;
