import React, { useState, useRef, useCallback } from "react";
import Cropper from "react-easy-crop";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, Link, Loader2, Crop } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

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
  circular?: boolean;
}

interface CroppedArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.crossOrigin = "anonymous";
    image.src = url;
  });

const getCroppedImg = async (
  imageSrc: string,
  pixelCrop: CroppedArea
): Promise<Blob> => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("No 2d context");
  }

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob!);
    }, "image/jpeg", 0.9);
  });
};

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
  circular = false,
}) => {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cropper state
  const [showCropper, setShowCropper] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CroppedArea | null>(null);

  const aspectRatioClass = {
    square: "aspect-square",
    video: "aspect-video",
    auto: "",
  }[aspectRatio];

  const onCropComplete = useCallback(
    (_croppedArea: CroppedArea, croppedAreaPixels: CroppedArea) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Ошибка",
        description: "Выберите изображение (JPG, PNG, GIF, WebP)",
        variant: "destructive",
      });
      return;
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      toast({
        title: "Ошибка",
        description: `Размер файла не должен превышать ${maxSizeMB} МБ`,
        variant: "destructive",
      });
      return;
    }

    // If circular mode, show cropper
    if (circular) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageToCrop(reader.result as string);
        setShowCropper(true);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
      };
      reader.readAsDataURL(file);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    // Direct upload without cropping
    await uploadFile(file);
  };

  const uploadFile = async (file: File | Blob) => {
    setIsUploading(true);

    try {
      const fileExt = file instanceof File ? file.name.split(".").pop() : "jpg";
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) throw error;

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

  const handleCropSave = async () => {
    if (!imageToCrop || !croppedAreaPixels) return;

    setIsUploading(true);
    try {
      const croppedBlob = await getCroppedImg(imageToCrop, croppedAreaPixels);
      await uploadFile(croppedBlob);
      setShowCropper(false);
      setImageToCrop(null);
    } catch (error) {
      console.error("Crop error:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось обрезать изображение",
        variant: "destructive",
      });
      setIsUploading(false);
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
        <div className={`relative group ${circular ? "flex items-center gap-4" : ""}`}>
          <div
            className={
              circular
                ? "w-24 h-24 rounded-full overflow-hidden border-2 border-muted bg-muted/50 flex-shrink-0"
                : `border rounded-lg overflow-hidden bg-muted/50 ${compact ? "max-h-32" : aspectRatioClass}`
            }
          >
            <img
              src={value}
              alt="Preview"
              className={
                circular
                  ? "w-full h-full object-cover"
                  : `w-full object-cover ${compact ? "max-h-32" : "h-full"}`
              }
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23f3f4f6' width='100' height='100'/%3E%3Ctext fill='%239ca3af' x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-size='12'%3EОшибка%3C/text%3E%3C/svg%3E";
              }}
            />
          </div>
          {circular ? (
            <div className="flex flex-col gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <Crop className="h-4 w-4 mr-2" />
                Изменить
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemove}
              >
                <X className="h-4 w-4 mr-2" />
                Удалить
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                disabled={isUploading}
              />
            </div>
          ) : (
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handleRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          {!circular && (
            <p className="text-xs text-muted-foreground mt-1 truncate">{value}</p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <div
            className={
              circular
                ? "w-24 h-24 rounded-full border-2 border-dashed flex items-center justify-center hover:border-primary/50 transition-colors cursor-pointer bg-muted/20"
                : `border-2 border-dashed rounded-lg ${compact ? "p-4" : "p-6"} text-center hover:border-primary/50 transition-colors cursor-pointer ${compact ? "" : aspectRatioClass}`
            }
            onClick={() => fileInputRef.current?.click()}
          >
            {isUploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className={`${circular ? "h-6 w-6" : "h-8 w-8"} animate-spin text-muted-foreground`} />
                {!circular && <p className="text-sm text-muted-foreground">Загрузка...</p>}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className={`${circular ? "h-6 w-6" : "h-8 w-8"} text-muted-foreground`} />
                {!circular && (
                  <>
                    <p className="text-sm text-muted-foreground">
                      Нажмите для загрузки
                    </p>
                    <p className="text-xs text-muted-foreground">
                      JPG, PNG до {maxSizeMB} МБ
                    </p>
                  </>
                )}
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

          {!circular && (
            <>
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
            </>
          )}
        </div>
      )}

      {/* Cropper Dialog */}
      <Dialog open={showCropper} onOpenChange={setShowCropper}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Обрезать изображение</DialogTitle>
            <DialogDescription>
              Переместите и масштабируйте изображение, чтобы оно красиво вписалось в круг
            </DialogDescription>
          </DialogHeader>

          <div className="relative h-64 bg-muted rounded-lg overflow-hidden">
            {imageToCrop && (
              <Cropper
                image={imageToCrop}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            )}
          </div>

          <div className="space-y-2">
            <Label>Масштаб</Label>
            <Slider
              value={[zoom]}
              min={1}
              max={3}
              step={0.1}
              onValueChange={(value) => setZoom(value[0])}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowCropper(false);
                setImageToCrop(null);
              }}
            >
              Отмена
            </Button>
            <Button type="button" onClick={handleCropSave} disabled={isUploading}>
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Сохранение...
                </>
              ) : (
                "Сохранить"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ImageUpload;
