import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import TipTapEditor from "@/components/editor/TipTapEditor";
import ImageUpload from "@/components/ui/image-upload";

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

const PostsManager: React.FC = () => {
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentPost, setCurrentPost] = useState<Post | null>(null);
  const [filterCategory, setFilterCategory] = useState<PostCategory | "all">("all");
  const [seoOpen, setSeoOpen] = useState(false);

  const [form, setForm] = useState({
    title: "",
    slug: "",
    content: "",
    excerpt: "",
    category: "blog" as PostCategory,
    featured_image_url: "",
    meta_title: "",
    meta_description: "",
    og_image_url: "",
    author: "",
    is_published: false,
  });

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPosts((data as Post[]) || []);
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить публикации",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Generate slug from title (transliteration)
  const generateSlug = (title: string): string => {
    const translitMap: { [key: string]: string } = {
      а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo", ж: "zh",
      з: "z", и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o",
      п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "ts",
      ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu",
      я: "ya",
    };

    return title
      .toLowerCase()
      .split("")
      .map((char) => translitMap[char] || char)
      .join("")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .substring(0, 100);
  };

  const openAddPostDialog = () => {
    setCurrentPost(null);
    setForm({
      title: "",
      slug: "",
      content: "",
      excerpt: "",
      category: "blog",
      featured_image_url: "",
      meta_title: "",
      meta_description: "",
      og_image_url: "",
      author: "",
      is_published: false,
    });
    setSeoOpen(false);
    setOpenDialog(true);
  };

  const openEditPostDialog = (post: Post) => {
    setCurrentPost(post);
    setForm({
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt || "",
      category: post.category,
      featured_image_url: post.featured_image_url || "",
      meta_title: post.meta_title || "",
      meta_description: post.meta_description || "",
      og_image_url: post.og_image_url || "",
      author: post.author || "",
      is_published: post.is_published,
    });
    setSeoOpen(false);
    setOpenDialog(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    // Auto-generate slug from title
    if (name === "title" && !currentPost) {
      setForm((prev) => ({ ...prev, [name]: value, slug: generateSlug(value) }));
    }
  };

  const handleContentChange = (content: string) => {
    setForm({ ...form, content });
  };

  const handleCategoryChange = (value: PostCategory) => {
    setForm({ ...form, category: value });
  };

  const handleSwitchChange = (checked: boolean) => {
    setForm({ ...form, is_published: checked });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title.trim() || !form.content.trim()) {
      toast({
        title: "Ошибка",
        description: "Заголовок и контент обязательны",
        variant: "destructive",
      });
      return;
    }

    try {
      const postData = {
        title: form.title,
        slug: form.slug || generateSlug(form.title),
        content: form.content,
        excerpt: form.excerpt || null,
        category: form.category,
        featured_image_url: form.featured_image_url || null,
        meta_title: form.meta_title || null,
        meta_description: form.meta_description || null,
        og_image_url: form.og_image_url || null,
        author: form.author || null,
        is_published: form.is_published,
        published_at: form.is_published && !currentPost?.published_at
          ? new Date().toISOString()
          : currentPost?.published_at || null,
        updated_at: new Date().toISOString(),
      };

      let result;

      if (currentPost) {
        result = await supabase
          .from("posts")
          .update(postData)
          .eq("id", currentPost.id);
      } else {
        result = await supabase
          .from("posts")
          .insert([postData]);
      }

      if (result.error) throw result.error;

      toast({
        title: currentPost ? "Обновлено" : "Создано",
        description: `Публикация успешно ${currentPost ? "обновлена" : "создана"}`,
      });

      setOpenDialog(false);
      fetchPosts();
    } catch (error) {
      console.error("Error saving post:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить публикацию",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (postId: string) => {
    if (!confirm("Вы уверены, что хотите удалить эту публикацию?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("posts")
        .delete()
        .eq("id", postId);

      if (error) throw error;

      toast({
        title: "Удалено",
        description: "Публикация успешно удалена",
      });

      fetchPosts();
    } catch (error) {
      console.error("Error deleting post:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось удалить публикацию",
        variant: "destructive",
      });
    }
  };

  const filteredPosts = filterCategory === "all"
    ? posts
    : posts.filter(p => p.category === filterCategory);

  const getCategoryLabel = (category: PostCategory) => {
    return CATEGORIES.find(c => c.value === category)?.label || category;
  };

  const getCategoryColor = (category: PostCategory) => {
    switch (category) {
      case "blog": return "bg-blue-100 text-blue-800";
      case "news": return "bg-green-100 text-green-800";
      case "article": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Управление публикациями</h2>
        <div className="flex gap-4">
          <Select
            value={filterCategory}
            onValueChange={(value) => setFilterCategory(value as PostCategory | "all")}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Все категории" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все категории</SelectItem>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={openAddPostDialog}>Добавить публикацию</Button>
        </div>
      </div>

      {loading ? (
        <p>Загрузка...</p>
      ) : filteredPosts.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">
          Нет публикаций. Создайте новую!
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <Card
              key={post.id}
              className={`overflow-hidden ${!post.is_published ? "opacity-60" : ""}`}
            >
              {post.featured_image_url && (
                <div className="h-40 overflow-hidden">
                  <img
                    src={post.featured_image_url}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardHeader className="bg-muted/50">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-1 text-xs rounded ${getCategoryColor(post.category)}`}>
                    {getCategoryLabel(post.category)}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded ${post.is_published ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                    {post.is_published ? "Опубликовано" : "Черновик"}
                  </span>
                </div>
                <CardTitle className="line-clamp-2">{post.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {post.excerpt && (
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {post.excerpt}
                  </p>
                )}

                <div className="space-y-2 text-sm">
                  {post.author && (
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Автор:</span>
                      <span>{post.author}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Просмотры:</span>
                    <span>{post.view_count}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Создано:</span>
                    <span>{new Date(post.created_at).toLocaleDateString("ru-RU")}</span>
                  </div>
                </div>

                {post.is_published && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => window.open(`/blog/${post.slug}`, "_blank")}
                    >
                      Открыть
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/blog/${post.slug}`);
                        toast({ title: "Скопировано", description: "Ссылка скопирована" });
                      }}
                    >
                      Копировать
                    </Button>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditPostDialog(post)}
                  >
                    Редактировать
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(post.id)}
                  >
                    Удалить
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {currentPost ? "Редактировать публикацию" : "Добавить публикацию"}
            </DialogTitle>
            <DialogDescription>
              {currentPost
                ? "Редактируйте информацию о публикации."
                : "Заполните форму для создания новой публикации."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Заголовок *</Label>
                <Input
                  id="title"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">URL (slug)</Label>
                <Input
                  id="slug"
                  name="slug"
                  value={form.slug}
                  onChange={handleChange}
                  placeholder="auto-generated-from-title"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Категория</Label>
                <Select value={form.category} onValueChange={handleCategoryChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="author">Автор</Label>
                <Input
                  id="author"
                  name="author"
                  value={form.author}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt">Краткое описание</Label>
              <Textarea
                id="excerpt"
                name="excerpt"
                value={form.excerpt}
                onChange={handleChange}
                rows={2}
                placeholder="Краткое описание для превью"
              />
            </div>

            <div className="space-y-2">
              <Label>Контент *</Label>
              <TipTapEditor
                content={form.content}
                onChange={handleContentChange}
                placeholder="Начните писать статью..."
              />
            </div>

            <ImageUpload
              value={form.featured_image_url}
              onChange={(url) => setForm({ ...form, featured_image_url: url })}
              folder="posts"
              label="Главное изображение"
              aspectRatio="video"
            />

            {/* SEO Section */}
            <Collapsible open={seoOpen} onOpenChange={setSeoOpen}>
              <CollapsibleTrigger asChild>
                <Button type="button" variant="outline" className="w-full">
                  {seoOpen ? "Скрыть SEO настройки" : "Показать SEO настройки"}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="meta_title">SEO заголовок (meta title)</Label>
                  <Input
                    id="meta_title"
                    name="meta_title"
                    value={form.meta_title}
                    onChange={handleChange}
                    placeholder="Заголовок для поисковиков (по умолчанию - основной заголовок)"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="meta_description">SEO описание (meta description)</Label>
                  <Textarea
                    id="meta_description"
                    name="meta_description"
                    value={form.meta_description}
                    onChange={handleChange}
                    rows={2}
                    placeholder="Описание для поисковиков (по умолчанию - краткое описание)"
                  />
                </div>

                <ImageUpload
                  value={form.og_image_url}
                  onChange={(url) => setForm({ ...form, og_image_url: url })}
                  folder="posts/og"
                  label="Open Graph изображение (для соцсетей)"
                  aspectRatio="video"
                />
              </CollapsibleContent>
            </Collapsible>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_published"
                checked={form.is_published}
                onCheckedChange={handleSwitchChange}
              />
              <Label htmlFor="is_published">Опубликовать</Label>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpenDialog(false)}>
                Отмена
              </Button>
              <Button type="submit">Сохранить</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PostsManager;
