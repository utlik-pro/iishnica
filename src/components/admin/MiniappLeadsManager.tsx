import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Search, Archive, ArchiveRestore } from "lucide-react";

interface MiniappLead {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'new' | 'contacted' | 'paid' | 'not_paid' | 'will_attend' | 'will_not_attend';
  notes: string | null;
  is_archived: boolean;
  source: string;
  created_at: string;
  event_id: string | null;
  events?: {
    id: string;
    title: string;
    date: string;
  } | null;
}

const statusLabels: Record<string, string> = {
  new: "Новый",
  contacted: "Связались",
  paid: "Оплачено",
  not_paid: "Не оплачено",
  will_attend: "Придёт",
  will_not_attend: "Не придёт",
};

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  new: "default",
  contacted: "secondary",
  paid: "secondary",
  not_paid: "destructive",
  will_attend: "default",
  will_not_attend: "outline",
};

export function MiniappLeadsManager() {
  const { toast } = useToast();
  const [leads, setLeads] = useState<MiniappLead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<MiniappLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showArchived, setShowArchived] = useState(false);

  const [openDialog, setOpenDialog] = useState(false);
  const [currentLead, setCurrentLead] = useState<MiniappLead | null>(null);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<MiniappLead['status']>("new");

  useEffect(() => {
    fetchLeads();
  }, []);

  useEffect(() => {
    filterLeads();
  }, [leads, statusFilter, searchTerm, showArchived]);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("leads")
        .select(`
          *,
          events (
            id,
            title,
            date
          )
        `)
        .eq("source", "miniapp")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setLeads(data || []);
    } catch (error) {
      console.error("Error fetching miniapp leads:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить лиды из miniapp",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterLeads = () => {
    let filtered = [...leads];

    if (statusFilter !== "all") {
      filtered = filtered.filter(lead => lead.status === statusFilter);
    }

    if (!showArchived) {
      filtered = filtered.filter(lead => !lead.is_archived);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(lead =>
        lead.name.toLowerCase().includes(term) ||
        lead.email.toLowerCase().includes(term) ||
        lead.phone.toLowerCase().includes(term)
      );
    }

    setFilteredLeads(filtered);
  };

  const handleUpdateLead = async () => {
    if (!currentLead) return;

    try {
      const { error } = await supabase
        .from("leads")
        .update({ notes, status })
        .eq("id", currentLead.id);

      if (error) throw error;

      toast({
        title: "Успешно",
        description: "Лид обновлён",
      });

      setOpenDialog(false);
      fetchLeads();
    } catch (error) {
      console.error("Error updating lead:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось обновить лид",
        variant: "destructive",
      });
    }
  };

  const handleArchive = async (leadId: string, archive: boolean) => {
    try {
      const { error } = await supabase
        .from("leads")
        .update({ is_archived: archive })
        .eq("id", leadId);

      if (error) throw error;

      toast({
        title: archive ? "Архивировано" : "Восстановлено",
        description: archive ? "Лид перемещён в архив" : "Лид восстановлен из архива",
      });

      fetchLeads();
    } catch (error) {
      console.error("Error archiving lead:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось изменить статус архивации",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (lead: MiniappLead) => {
    setCurrentLead(lead);
    setNotes(lead.notes || "");
    setStatus(lead.status);
    setOpenDialog(true);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return <div className="p-4">Загрузка...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Лиды из Telegram Mini-App</h2>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{filteredLeads.length} из {leads.length}</Badge>
        </div>
      </div>

      <div className="flex gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Поиск по имени, email или телефону..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Фильтр по статусу" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все статусы</SelectItem>
            <SelectItem value="new">Новые</SelectItem>
            <SelectItem value="contacted">Связались</SelectItem>
            <SelectItem value="paid">Оплачено</SelectItem>
            <SelectItem value="not_paid">Не оплачено</SelectItem>
            <SelectItem value="will_attend">Придёт</SelectItem>
            <SelectItem value="will_not_attend">Не придёт</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant={showArchived ? "default" : "outline"}
          onClick={() => setShowArchived(!showArchived)}
        >
          <Archive className="h-4 w-4 mr-2" />
          {showArchived ? "Скрыть архив" : "Показать архив"}
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Имя</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Телефон</TableHead>
              <TableHead>Событие</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Дата</TableHead>
              <TableHead>Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLeads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  {searchTerm || statusFilter !== "all" || showArchived
                    ? "Лиды не найдены"
                    : "Пока нет регистраций из miniapp"}
                </TableCell>
              </TableRow>
            ) : (
              filteredLeads.map((lead) => (
                <TableRow key={lead.id} className={lead.is_archived ? "opacity-50" : ""}>
                  <TableCell className="font-medium">{lead.name}</TableCell>
                  <TableCell>{lead.email}</TableCell>
                  <TableCell>{lead.phone}</TableCell>
                  <TableCell>
                    {lead.events ? (
                      <div className="text-sm">
                        <div className="font-medium">{lead.events.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(lead.events.date).toLocaleDateString("ru-RU", {
                            day: "2-digit",
                            month: "long",
                          })}
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">Не указано</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusColors[lead.status]}>
                      {statusLabels[lead.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(lead.created_at)}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditDialog(lead)}
                      >
                        Редактировать
                      </Button>
                      <Button
                        size="sm"
                        variant={lead.is_archived ? "default" : "ghost"}
                        onClick={() => handleArchive(lead.id, !lead.is_archived)}
                      >
                        {lead.is_archived ? (
                          <><ArchiveRestore className="h-4 w-4" /></>
                        ) : (
                          <><Archive className="h-4 w-4" /></>
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактирование лида</DialogTitle>
            <DialogDescription>
              {currentLead?.name} ({currentLead?.email})
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Статус</label>
              <Select value={status} onValueChange={(value) => setStatus(value as MiniappLead['status'])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">Новый</SelectItem>
                  <SelectItem value="contacted">Связались</SelectItem>
                  <SelectItem value="paid">Оплачено</SelectItem>
                  <SelectItem value="not_paid">Не оплачено</SelectItem>
                  <SelectItem value="will_attend">Придёт</SelectItem>
                  <SelectItem value="will_not_attend">Не придёт</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Заметки</label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Добавьте заметки о лиде..."
                rows={4}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpenDialog(false)}>
                Отмена
              </Button>
              <Button onClick={handleUpdateLead}>
                Сохранить
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
