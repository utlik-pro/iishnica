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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Search, Plus, Award, Trash2, UserPlus, Eye } from "lucide-react";

type CustomBadge = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  emoji: string | null;
  color: string;
  xp_reward: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
};

type UserBadge = {
  id: string;
  user_id: number;
  badge_id: string;
  awarded_by: number | null;
  awarded_reason: string | null;
  awarded_at: string;
  expires_at: string | null;
  is_featured: boolean;
  user?: {
    id: number;
    first_name: string | null;
    last_name: string | null;
    username: string | null;
  };
};

type BotUser = {
  id: number;
  first_name: string | null;
  last_name: string | null;
  username: string | null;
  tg_user_id: number;
};

export function BadgesManager() {
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isAwardOpen, setIsAwardOpen] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<CustomBadge | null>(null);
  const [viewingBadge, setViewingBadge] = useState<CustomBadge | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch badges
  const { data: badges, isLoading } = useQuery({
    queryKey: ["custom_badges"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("custom_badges")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as CustomBadge[];
    },
  });

  // Fetch users for awarding
  const { data: users } = useQuery({
    queryKey: ["bot_users_for_badges"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bot_users")
        .select("id, first_name, last_name, username, tg_user_id")
        .order("first_name", { ascending: true });
      if (error) throw error;
      return data as BotUser[];
    },
  });

  // Fetch awarded badges for viewing
  const { data: awardedBadges } = useQuery({
    queryKey: ["user_badges", viewingBadge?.id],
    queryFn: async () => {
      if (!viewingBadge) return [];
      const { data, error } = await supabase
        .from("user_badges")
        .select(`
          *,
          user:bot_users(id, first_name, last_name, username)
        `)
        .eq("badge_id", viewingBadge.id)
        .order("awarded_at", { ascending: false });
      if (error) throw error;
      return data as UserBadge[];
    },
    enabled: !!viewingBadge,
  });

  // Create badge mutation
  const createBadge = useMutation({
    mutationFn: async (badge: Partial<CustomBadge>) => {
      const { data, error } = await supabase
        .from("custom_badges")
        .insert(badge)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["custom_badges"] });
      setIsCreateOpen(false);
      toast({ title: "Бейдж создан" });
    },
    onError: (error) => {
      toast({ title: "Ошибка", description: error.message, variant: "destructive" });
    },
  });

  // Award badge mutation
  const awardBadge = useMutation({
    mutationFn: async ({ userId, badgeId, reason }: { userId: number; badgeId: string; reason: string }) => {
      const { data, error } = await supabase
        .from("user_badges")
        .insert({
          user_id: userId,
          badge_id: badgeId,
          awarded_reason: reason,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user_badges"] });
      setIsAwardOpen(false);
      setSelectedBadge(null);
      toast({ title: "Бейдж выдан" });
    },
    onError: (error) => {
      toast({ title: "Ошибка", description: error.message, variant: "destructive" });
    },
  });

  // Delete badge mutation
  const deleteBadge = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("custom_badges")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["custom_badges"] });
      toast({ title: "Бейдж удалён" });
    },
  });

  // Revoke user badge mutation
  const revokeBadge = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("user_badges")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user_badges"] });
      toast({ title: "Бейдж отозван" });
    },
  });

  const filteredBadges = badges?.filter((badge) => {
    const searchLower = search.toLowerCase();
    return (
      badge.name.toLowerCase().includes(searchLower) ||
      badge.slug.toLowerCase().includes(searchLower)
    );
  });

  if (isLoading) {
    return <div className="p-4">Загрузка...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Award className="h-5 w-5" />
          Управление бейджами
        </h2>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{badges?.length || 0} бейджей</Badge>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Создать бейдж
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Новый бейдж</DialogTitle>
              </DialogHeader>
              <CreateBadgeForm onSubmit={(data) => createBadge.mutate(data)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Поиск по названию..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Бейдж</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>XP</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBadges?.map((badge) => (
              <TableRow key={badge.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{badge.emoji || "🏆"}</span>
                    <div>
                      <div className="font-medium" style={{ color: badge.color }}>
                        {badge.name}
                      </div>
                      <div className="text-sm text-gray-500 truncate max-w-[200px]">
                        {badge.description}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                    {badge.slug}
                  </code>
                </TableCell>
                <TableCell>
                  {badge.xp_reward > 0 && (
                    <Badge variant="secondary">+{badge.xp_reward} XP</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {badge.is_active ? (
                    <Badge variant="default">Активен</Badge>
                  ) : (
                    <Badge variant="secondary">Неактивен</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setViewingBadge(badge)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedBadge(badge);
                        setIsAwardOpen(true);
                      }}
                    >
                      <UserPlus className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteBadge.mutate(badge.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Award Badge Dialog */}
      <Dialog open={isAwardOpen} onOpenChange={setIsAwardOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Выдать бейдж: {selectedBadge?.emoji} {selectedBadge?.name}
            </DialogTitle>
          </DialogHeader>
          <AwardBadgeForm
            users={users || []}
            badgeId={selectedBadge?.id || ""}
            onSubmit={(userId, reason) =>
              awardBadge.mutate({ userId, badgeId: selectedBadge?.id || "", reason })
            }
          />
        </DialogContent>
      </Dialog>

      {/* View Badge Recipients Dialog */}
      <Dialog open={!!viewingBadge} onOpenChange={() => setViewingBadge(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Владельцы бейджа: {viewingBadge?.emoji} {viewingBadge?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="max-h-96 overflow-auto">
            {awardedBadges?.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Пока никому не выдан</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Пользователь</TableHead>
                    <TableHead>Причина</TableHead>
                    <TableHead>Дата</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {awardedBadges?.map((ub) => (
                    <TableRow key={ub.id}>
                      <TableCell>
                        {ub.user?.first_name} {ub.user?.last_name}
                        {ub.user?.username && (
                          <span className="text-gray-500 ml-1">@{ub.user.username}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {ub.awarded_reason || "-"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(ub.awarded_at).toLocaleDateString("ru-RU")}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => revokeBadge.mutate(ub.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Create Badge Form
function CreateBadgeForm({ onSubmit }: { onSubmit: (data: Partial<CustomBadge>) => void }) {
  const [form, setForm] = useState({
    slug: "",
    name: "",
    description: "",
    emoji: "🏆",
    color: "#c8ff00",
    xp_reward: 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Slug (уникальный ID)</Label>
          <Input
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            placeholder="early_adopter"
            required
          />
        </div>
        <div>
          <Label>Название</Label>
          <Input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Early Adopter"
            required
          />
        </div>
      </div>
      <div>
        <Label>Описание</Label>
        <Textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Описание бейджа..."
        />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label>Emoji</Label>
          <Input
            value={form.emoji}
            onChange={(e) => setForm({ ...form, emoji: e.target.value })}
            placeholder="🏆"
          />
        </div>
        <div>
          <Label>Цвет</Label>
          <Input
            type="color"
            value={form.color}
            onChange={(e) => setForm({ ...form, color: e.target.value })}
          />
        </div>
        <div>
          <Label>XP награда</Label>
          <Input
            type="number"
            value={form.xp_reward}
            onChange={(e) => setForm({ ...form, xp_reward: parseInt(e.target.value) || 0 })}
          />
        </div>
      </div>
      <Button type="submit" className="w-full">Создать</Button>
    </form>
  );
}

// Award Badge Form
function AwardBadgeForm({
  users,
  badgeId,
  onSubmit,
}: {
  users: BotUser[];
  badgeId: string;
  onSubmit: (userId: number, reason: string) => void;
}) {
  const [userId, setUserId] = useState<string>("");
  const [reason, setReason] = useState("");
  const [search, setSearch] = useState("");

  const filteredUsers = users.filter((u) => {
    const s = search.toLowerCase();
    return (
      u.first_name?.toLowerCase().includes(s) ||
      u.last_name?.toLowerCase().includes(s) ||
      u.username?.toLowerCase().includes(s)
    );
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userId) {
      onSubmit(parseInt(userId), reason);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Поиск пользователя</Label>
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Имя или username..."
          className="mb-2"
        />
        <Select value={userId} onValueChange={setUserId}>
          <SelectTrigger>
            <SelectValue placeholder="Выберите пользователя" />
          </SelectTrigger>
          <SelectContent>
            {filteredUsers.slice(0, 50).map((user) => (
              <SelectItem key={user.id} value={user.id.toString()}>
                {user.first_name} {user.last_name}
                {user.username && ` (@${user.username})`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Причина (опционально)</Label>
        <Input
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="За что выдан бейдж..."
        />
      </div>
      <Button type="submit" className="w-full" disabled={!userId}>
        Выдать бейдж
      </Button>
    </form>
  );
}
