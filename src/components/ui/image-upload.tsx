import React, { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, Link, Loader2 } from "lucide-react";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  bucket?: string;
  folder?: string;
  label?: string;
  placeholder?: string;
  aspectRatio?: "square" | "video" | "auto";
  maxSizeMB?: number;
  compact?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  bucket = "images",
  folder = "uploads",
  label = "Изображение",
  placeholder = "https://example.com/image.jpg",
  aspectRatio = "auto",
  maxSizeMB = 5,
  compact = false,
}) => {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const aspectRatioClass = {
    square: "aspect-square",
    video: "aspect-video",
    auto: "",
  }[aspectRatio];

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Ошибка",
        description: "Выберите изображение (JPG, PNG, GIF, WebP)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast({
        title: "Ошибка",
        description: `Размер файла не должен превышать ${maxSizeMB} МБ`,
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Generate unique filename
      const fileExt = file.name.split(".").pop();
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      onChange(urlData.publicUrl);

      toast({
        title: "Загружено",
        description: "Изображение успешно загружено",
      });
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: "Ошибка загрузки",
        description: error.message || "Не удалось загрузить изображение",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
      setUrlInput("");
      setShowUrlInput(false);
    }
  };

  const handleRemove = () => {
    onChange("");
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>

      {value ? (
        <div className="relative group">
          <div className={`border rounded-lg overflow-hidden bg-muted/50 ${compact ? "max-h-32" : aspectRatioClass}`}>
            <img
              src={value}
              alt="Preview"
              className={`w-full object-cover ${compact ? "max-h-32" : "h-full"}`}
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23f3f4f6' width='100' height='100'/%3E%3Ctext fill='%239ca3af' x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-size='12'%3EОшибка%3C/text%3E%3C/svg%3E";
              }}
            />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
          <p className="text-xs text-muted-foreground mt-1 truncate">{value}</p>
        </div>
      ) : (
        <div className="space-y-2">
          <div
            className={`border-2 border-dashed rounded-lg ${compact ? "p-4" : "p-6"} text-center hover:border-primary/50 transition-colors cursor-pointer ${compact ? "" : aspectRatioClass}`}
            onClick={() => fileInputRef.current?.click()}
          >
            {isUploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Загрузка...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Нажмите для загрузки или перетащите файл
                </p>
                <p className="text-xs text-muted-foreground">
                  JPG, PNG, GIF, WebP до {maxSizeMB} МБ
                </p>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={isUploading}
          />

          {showUrlInput ? (
            <div className="flex gap-2">
              <Input
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder={placeholder}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleUrlSubmit();
                  }
                }}
              />
              <Button type="button" onClick={handleUrlSubmit} disabled={!urlInput.trim()}>
                OK
              </Button>
              <Button type="button" variant="ghost" onClick={() => setShowUrlInput(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => setShowUrlInput(true)}
            >
              <Link className="h-4 w-4 mr-2" />
              Или вставить ссылку
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
