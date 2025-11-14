import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
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

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'new' | 'contacted' | 'paid' | 'not_paid' | 'will_attend' | 'will_not_attend';
  notes: string | null;
  is_archived: boolean;
  ticket_sent: boolean;
  created_at: string;
}

const LeadsManager: React.FC = () => {
  const { toast } = useToast();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  
  const [openDialog, setOpenDialog] = useState(false);
  const [currentLead, setCurrentLead] = useState<Lead | null>(null);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<Lead['status']>("new");

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
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setLeads(data || []);
    } catch (error) {
      console.error("Error fetching leads:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить участников",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterLeads = () => {
    let filtered = [...leads];
    
    // Фильтр по статусу
    if (statusFilter !== "all") {
      filtered = filtered.filter(lead => lead.status === statusFilter);
    }
    
    // Фильтр по архивным
    if (!showArchived) {
      filtered = filtered.filter(lead => !lead.is_archived);
    }
    
    // Поиск по имени, email или телефону
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(lead => 
        lead.name.toLowerCase().includes(term) || 
        lead.email.toLowerCase().includes(term) || 
        lead.phone.includes(term)
      );
    }
    
    setFilteredLeads(filtered);
  };

  const openEditLeadDialog = (lead: Lead) => {
    setCurrentLead(lead);
    setNotes(lead.notes || "");
    setStatus(lead.status);
    setOpenDialog(true);
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
        title: "Обновлено",
        description: "Информация об участнике обновлена",
      });

      setOpenDialog(false);
      fetchLeads();
    } catch (error) {
      console.error("Error updating lead:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось обновить информацию",
        variant: "destructive",
      });
    }
  };

  const handleArchiveLead = async (leadId: string, archive: boolean) => {
    try {
      const { error } = await supabase
        .from("leads")
        .update({ is_archived: archive })
        .eq("id", leadId);

      if (error) throw error;

      toast({
        title: archive ? "Архивировано" : "Возвращено",
        description: `Участник успешно ${archive ? "архивирован" : "возвращен из архива"}`,
      });

      fetchLeads();
    } catch (error) {
      console.error("Error archiving lead:", error);
      toast({
        title: "Ошибка",
        description: `Не удалось ${archive ? "архивировать" : "вернуть из архива"} участника`,
        variant: "destructive",
      });
    }
  };

  const handleSendTicket = async (leadId: string) => {
    if (!confirm("Отправить билет этому участнику?")) {
      return;
    }

    try {
      const { data, error } = await supabase
        .rpc('send_ticket', { lead_id: leadId });

      if (error) throw error;

      toast({
        title: "Билет отправлен",
        description: "Билет успешно отправлен участнику",
      });

      fetchLeads();
    } catch (error) {
      console.error("Error sending ticket:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось отправить билет",
        variant: "destructive",
      });
    }
  };

  const getStatusBadgeClass = (status: Lead['status']) => {
    switch (status) {
      case "new": return "bg-blue-100 text-blue-800";
      case "contacted": return "bg-yellow-100 text-yellow-800";
      case "paid": return "bg-green-100 text-green-800";
      case "not_paid": return "bg-red-100 text-red-800";
      case "will_attend": return "bg-purple-100 text-purple-800";
      case "will_not_attend": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: Lead['status']) => {
    switch (status) {
      case "new": return "Новый";
      case "contacted": return "Связались";
      case "paid": return "Оплачено";
      case "not_paid": return "Не оплачено";
      case "will_attend": return "Посетит";
      case "will_not_attend": return "Не посетит";
      default: return "Неизвестно";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold">Управление участниками</h2>
        
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <div className="w-full md:w-48">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                <SelectItem value="new">Новый</SelectItem>
                <SelectItem value="contacted">Связались</SelectItem>
                <SelectItem value="paid">Оплачено</SelectItem>
                <SelectItem value="not_paid">Не оплачено</SelectItem>
                <SelectItem value="will_attend">Посетит</SelectItem>
                <SelectItem value="will_not_attend">Не посетит</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Input
            placeholder="Поиск по имени, email или телефону"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-auto"
          />
          
          <Button
            variant="outline"
            onClick={() => setShowArchived(!showArchived)}
            className="whitespace-nowrap"
          >
            {showArchived ? "Скрыть архив" : "Показать архив"}
          </Button>
        </div>
      </div>

      {loading ? (
        <p>Загрузка...</p>
      ) : filteredLeads.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">Нет участников, соответствующих фильтру</p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Имя</TableHead>
                <TableHead>Контакты</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Дата регистрации</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeads.map((lead) => (
                <TableRow key={lead.id} className={lead.is_archived ? "bg-muted/30" : ""}>
                  <TableCell className="font-medium">{lead.name}</TableCell>
                  <TableCell>
                    <div>{lead.email}</div>
                    <div className="text-sm text-muted-foreground">{lead.phone}</div>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 text-xs rounded ${getStatusBadgeClass(lead.status)}`}>
                      {getStatusLabel(lead.status)}
                    </span>
                    {lead.ticket_sent && (
                      <div className="mt-1 text-xs text-green-600">Билет отправлен</div>
                    )}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {formatDate(lead.created_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEditLeadDialog(lead)}>
                        Изменить
                      </Button>
                      
                      {!lead.ticket_sent && lead.status === "paid" && (
                        <Button 
                          size="sm" 
                          onClick={() => handleSendTicket(lead.id)}
                        >
                          Отправить билет
                        </Button>
                      )}
                      
                      <Button 
                        variant={lead.is_archived ? "secondary" : "destructive"} 
                        size="sm"
                        onClick={() => handleArchiveLead(lead.id, !lead.is_archived)}
                      >
                        {lead.is_archived ? "Вернуть" : "Архивировать"}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Редактировать участника</DialogTitle>
          </DialogHeader>

          <DialogDescription>
            Просмотр и редактирование информации об участнике.
          </DialogDescription>

          <div className="space-y-4 pt-4">
            {currentLead && (
              <>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Имя</p>
                  <p>{currentLead.name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Email</p>
                  <p>{currentLead.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Телефон</p>
                  <p>{currentLead.phone}</p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Статус</p>
                  <Select value={status} onValueChange={(value) => setStatus(value as Lead['status'])}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">Новый</SelectItem>
                      <SelectItem value="contacted">Связались</SelectItem>
                      <SelectItem value="paid">Оплачено</SelectItem>
                      <SelectItem value="not_paid">Не оплачено</SelectItem>
                      <SelectItem value="will_attend">Посетит</SelectItem>
                      <SelectItem value="will_not_attend">Не посетит</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Заметки</p>
                  <textarea
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setOpenDialog(false)}>
                    Отмена
                  </Button>
                  <Button onClick={handleUpdateLead}>
                    Сохранить
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LeadsManager;
