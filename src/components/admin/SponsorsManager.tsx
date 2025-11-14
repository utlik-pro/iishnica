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
import { Switch } from "@/components/ui/switch";

interface Sponsor {
  id: string;
  name: string;
  logo_url: string | null;
  website_url: string | null;
  is_active: boolean;
  created_at: string;
}

const SponsorsManager: React.FC = () => {
  const { toast } = useToast();
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentSponsor, setCurrentSponsor] = useState<Sponsor | null>(null);

  // Форма для нового/редактируемого спонсора
  const [form, setForm] = useState({
    name: "",
    logo_url: "",
    website_url: "",
    is_active: true,
  });

  useEffect(() => {
    fetchSponsors();
  }, []);

  const fetchSponsors = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("sponsors")
        .select("*")
        .order("name");

      if (error) throw error;
      setSponsors(data || []);
    } catch (error) {
      console.error("Error fetching sponsors:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить спонсоров",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const openAddSponsorDialog = () => {
    setCurrentSponsor(null);
    setForm({
      name: "",
      logo_url: "",
      website_url: "",
      is_active: true,
    });
    setOpenDialog(true);
  };

  const openEditSponsorDialog = (sponsor: Sponsor) => {
    setCurrentSponsor(sponsor);
    setForm({
      name: sponsor.name,
      logo_url: sponsor.logo_url || "",
      website_url: sponsor.website_url || "",
      is_active: sponsor.is_active,
    });
    setOpenDialog(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSwitchChange = (checked: boolean) => {
    setForm({
      ...form,
      is_active: checked,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const sponsorData = {
        name: form.name,
        logo_url: form.logo_url || null,
        website_url: form.website_url || null,
        is_active: form.is_active,
      };

      let result;

      if (currentSponsor) {
        // Обновляем существующего спонсора
        result = await supabase
          .from("sponsors")
          .update(sponsorData)
          .eq("id", currentSponsor.id);
      } else {
        // Создаем нового спонсора
        result = await supabase
          .from("sponsors")
          .insert([sponsorData]);
      }

      if (result.error) throw result.error;

      toast({
        title: currentSponsor ? "Обновлено" : "Создано",
        description: `Спонсор успешно ${currentSponsor ? "обновлен" : "создан"}`,
      });

      setOpenDialog(false);
      fetchSponsors();

    } catch (error) {
      console.error("Error saving sponsor:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить спонсора",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (sponsorId: string) => {
    if (!confirm("Вы уверены, что хотите удалить этого спонсора?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("sponsors")
        .delete()
        .eq("id", sponsorId);

      if (error) throw error;

      toast({
        title: "Удалено",
        description: "Спонсор успешно удален",
      });

      fetchSponsors();
    } catch (error) {
      console.error("Error deleting sponsor:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось удалить спонсора",
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Управление спонсорами</h2>
        <Button onClick={openAddSponsorDialog}>Добавить спонсора</Button>
      </div>

      {loading ? (
        <p>Загрузка...</p>
      ) : sponsors.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">Нет спонсоров. Создайте нового!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sponsors.map((sponsor) => (
            <Card key={sponsor.id} className={`overflow-hidden ${!sponsor.is_active ? "opacity-60" : ""}`}>
              <CardHeader className="bg-muted/50">
                <CardTitle className="line-clamp-2">{sponsor.name}</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {sponsor.logo_url && (
                  <div className="h-24 flex items-center justify-center border rounded p-2 bg-white">
                    <img 
                      src={sponsor.logo_url} 
                      alt={`${sponsor.name} logo`} 
                      className="max-h-full max-w-full object-contain" 
                    />
                  </div>
                )}
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Статус:</p>
                    <span className={`px-2 py-1 text-xs rounded ${sponsor.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                      {sponsor.is_active ? "Активный" : "Неактивный"}
                    </span>
                  </div>
                  
                  {sponsor.website_url && (
                    <div>
                      <p className="text-sm font-medium">Веб-сайт:</p>
                      <a 
                        href={sponsor.website_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 underline text-sm break-all"
                      >
                        {sponsor.website_url}
                      </a>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => openEditSponsorDialog(sponsor)}>
                    Редактировать
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(sponsor.id)}>
                    Удалить
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {currentSponsor ? "Редактировать спонсора" : "Добавить спонсора"}
            </DialogTitle>
          </DialogHeader>

          <DialogDescription>
            {currentSponsor 
              ? "Редактируйте информацию о существующем спонсоре." 
              : "Добавьте нового спонсора, заполнив форму ниже."}
          </DialogDescription>

          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="name">Название</Label>
              <Input
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="logo_url">URL логотипа</Label>
              <Input
                id="logo_url"
                name="logo_url"
                value={form.logo_url}
                onChange={handleChange}
                placeholder="https://example.com/logo.png"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website_url">URL веб-сайта</Label>
              <Input
                id="website_url"
                name="website_url"
                value={form.website_url}
                onChange={handleChange}
                placeholder="https://example.com"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={form.is_active}
                onCheckedChange={handleSwitchChange}
              />
              <Label htmlFor="is_active">Активный</Label>
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

export default SponsorsManager;
