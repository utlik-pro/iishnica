import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, MapPin, ExternalLink, Image, Loader2, Wand2 } from "lucide-react";
import ImageUpload from "@/components/ui/image-upload";

type Location = {
  id: string;
  name: string;
  address: string | null;
  photo_url: string | null;
  yandex_map_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type LocationFormData = {
  name: string;
  address: string;
  photo_url: string;
  yandex_map_url: string;
  is_active: boolean;
};

const emptyForm: LocationFormData = {
  name: "",
  address: "",
  photo_url: "",
  yandex_map_url: "",
  is_active: true,
};

export function LocationsManager() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [formData, setFormData] = useState<LocationFormData>(emptyForm);
  const [isResolvingUrl, setIsResolvingUrl] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const resolveYandexUrl = async () => {
    if (!formData.yandex_map_url) {
      toast({
        title: "Введите ссылку",
        description: "Сначала вставьте ссылку на Яндекс Карты",
        variant: "destructive",
      });
      return;
    }

    setIsResolvingUrl(true);
    try {
      const { data, error } = await supabase.functions.invoke('resolve-yandex-url', {
        body: { url: formData.yandex_map_url }
      });

      if (error) throw error;

      if (data.widgetUrl) {
        setFormData({ ...formData, yandex_map_url: data.widgetUrl });
        toast({
          title: "Готово!",
          description: "Ссылка преобразована в виджет карты",
        });
      } else {
        toast({
          title: "Не удалось получить координаты",
          description: "Попробуйте скопировать полную ссылку из адресной строки браузера",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось обработать ссылку",
        variant: "destructive",
      });
    } finally {
      setIsResolvingUrl(false);
    }
  };

  const { data: locations, isLoading } = useQuery({
    queryKey: ["locations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("locations")
        .select("*")
        .order("name", { ascending: true });
      if (error) throw error;
      return data as Location[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: LocationFormData & { id?: string }) => {
      if (data.id) {
        const { error } = await supabase
          .from("locations")
          .update({
            name: data.name,
            address: data.address || null,
            photo_url: data.photo_url || null,
            yandex_map_url: data.yandex_map_url || null,
            is_active: data.is_active,
            updated_at: new Date().toISOString(),
          })
          .eq("id", data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("locations").insert({
          name: data.name,
          address: data.address || null,
          photo_url: data.photo_url || null,
          yandex_map_url: data.yandex_map_url || null,
          is_active: data.is_active,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
      setIsDialogOpen(false);
      setEditingLocation(null);
      setFormData(emptyForm);
      toast({
        title: editingLocation ? "Локация обновлена" : "Локация создана",
        description: "Изменения сохранены",
      });
    },
    onError: (error) => {
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("locations").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
      toast({
        title: "Локация удалена",
      });
    },
    onError: (error) => {
      toast({
        title: "Ошибка удаления",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleEdit = (location: Location) => {
    setEditingLocation(location);
    setFormData({
      name: location.name,
      address: location.address || "",
      photo_url: location.photo_url || "",
      yandex_map_url: location.yandex_map_url || "",
      is_active: location.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingLocation(null);
    setFormData(emptyForm);
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate({
      ...formData,
      id: editingLocation?.id,
    });
  };

  if (isLoading) {
    return <div className="p-4">Загрузка...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Локации</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Добавить локацию
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingLocation ? "Редактировать локацию" : "Новая локация"}
              </DialogTitle>
              <DialogDescription>
                {editingLocation ? "Измените данные локации" : "Добавьте новую локацию для проведения мероприятий"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="name">Название *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Бизнес-центр Example"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="address">Адрес</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    placeholder="г. Минск, ул. Примерная, 123"
                  />
                </div>
                <div className="col-span-2">
                  <ImageUpload
                    value={formData.photo_url}
                    onChange={(url) => setFormData({ ...formData, photo_url: url })}
                    folder="locations"
                    label="Фото локации"
                    aspectRatio="video"
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="yandex_map_url">Ссылка на Яндекс Карты</Label>
                  <div className="flex gap-2">
                    <Input
                      id="yandex_map_url"
                      value={formData.yandex_map_url}
                      onChange={(e) =>
                        setFormData({ ...formData, yandex_map_url: e.target.value })
                      }
                      placeholder="Вставьте любую ссылку (короткую или полную)"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resolveYandexUrl}
                      disabled={isResolvingUrl || !formData.yandex_map_url}
                      title="Получить координаты"
                    >
                      {isResolvingUrl ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Wand2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Вставьте ссылку и нажмите кнопку для получения координат
                  </p>
                </div>
                <div className="col-span-2 flex items-center gap-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_active: checked })
                    }
                  />
                  <Label htmlFor="is_active">Активна</Label>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Отмена
                </Button>
                <Button type="submit" disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? "Сохранение..." : "Сохранить"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Фото</TableHead>
              <TableHead>Название</TableHead>
              <TableHead>Адрес</TableHead>
              <TableHead>Карта</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {locations?.map((location) => (
              <TableRow key={location.id}>
                <TableCell>
                  {location.photo_url ? (
                    <img
                      src={location.photo_url}
                      alt={location.name}
                      className="h-16 w-24 rounded object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://via.placeholder.com/96x64?text=No+Image";
                      }}
                    />
                  ) : (
                    <div className="h-16 w-24 rounded bg-gray-100 flex items-center justify-center">
                      <Image className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-medium">{location.name}</TableCell>
                <TableCell>
                  {location.address ? (
                    <div className="flex items-center gap-1 text-sm">
                      <MapPin className="h-3 w-3 text-gray-400" />
                      {location.address}
                    </div>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell>
                  {location.yandex_map_url ? (
                    <a
                      href={location.yandex_map_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-blue-600 hover:underline text-sm"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Открыть
                    </a>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell>
                  {location.is_active ? (
                    <Badge variant="default">Активна</Badge>
                  ) : (
                    <Badge variant="secondary">Неактивна</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(location)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        if (confirm("Удалить локацию?")) {
                          deleteMutation.mutate(location.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {locations?.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  Нет локаций. Добавьте первую локацию.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
