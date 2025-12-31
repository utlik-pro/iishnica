import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BlogConfig } from "@/types/pageBuilder";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileText } from "lucide-react";

interface BlogEditorProps {
  config: BlogConfig;
  onChange: (config: BlogConfig) => void;
}

const BlogEditor: React.FC<BlogEditorProps> = ({ config, onChange }) => {
  const updateTitle = (field: 'prefix' | 'highlight', value: string) => {
    onChange({
      ...config,
      title: { ...config.title, [field]: value },
    });
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold">Заголовок</h4>

        <div className="flex gap-2">
          <div className="flex-1 space-y-2">
            <Label htmlFor="blog-prefix">Префикс</Label>
            <Input
              id="blog-prefix"
              value={config.title.prefix}
              onChange={(e) => updateTitle('prefix', e.target.value)}
              placeholder="Наш"
            />
          </div>

          <div className="flex-1 space-y-2">
            <Label htmlFor="blog-highlight">Выделение</Label>
            <Input
              id="blog-highlight"
              value={config.title.highlight}
              onChange={(e) => updateTitle('highlight', e.target.value)}
              placeholder="блог"
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="blog-description">Описание</Label>
        <Textarea
          id="blog-description"
          value={config.description}
          onChange={(e) => onChange({ ...config, description: e.target.value })}
          placeholder="Статьи и новости о применении ИИ в бизнесе"
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="blog-max">Количество постов</Label>
        <Input
          id="blog-max"
          type="number"
          min={1}
          max={10}
          value={config.maxItems}
          onChange={(e) => onChange({ ...config, maxItems: parseInt(e.target.value) || 3 })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="blog-button-text">Текст кнопки</Label>
        <Input
          id="blog-button-text"
          value={config.buttonText}
          onChange={(e) => onChange({ ...config, buttonText: e.target.value })}
          placeholder="Все статьи"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="blog-button-link">Ссылка кнопки</Label>
        <Input
          id="blog-button-link"
          value={config.buttonLink}
          onChange={(e) => onChange({ ...config, buttonLink: e.target.value })}
          placeholder="/blog"
        />
      </div>

      <Alert>
        <FileText className="h-4 w-4" />
        <AlertDescription>
          Посты загружаются из раздела "Публикации". Добавьте и опубликуйте посты в соответствующем разделе.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default BlogEditor;
