import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { Search, Ban, UserCheck, ExternalLink } from "lucide-react";

type BotUser = {
  id: number;
  tg_user_id: number;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  phone_number: string | null;
  first_seen_at: string;
  points: number;
  warns: number;
  banned: boolean;
  source: string | null;
};

export function BotUsersManager() {
  const [search, setSearch] = useState("");

  const { data: users, isLoading, refetch } = useQuery({
    queryKey: ["bot_users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bot_users")
        .select("*")
        .order("first_seen_at", { ascending: false });
      if (error) throw error;
      return data as BotUser[];
    },
  });

  const filteredUsers = users?.filter((user) => {
    const searchLower = search.toLowerCase();
    return (
      user.username?.toLowerCase().includes(searchLower) ||
      user.first_name?.toLowerCase().includes(searchLower) ||
      user.last_name?.toLowerCase().includes(searchLower) ||
      user.tg_user_id.toString().includes(searchLower)
    );
  });

  const toggleBan = async (userId: number, currentBanned: boolean) => {
    const { error } = await supabase
      .from("bot_users")
      .update({ banned: !currentBanned })
      .eq("id", userId);
    if (!error) {
      refetch();
    }
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

  if (isLoading) {
    return <div className="p-4">Загрузка...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Пользователи бота</h2>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{users?.length || 0} пользователей</Badge>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Поиск по имени, username или Telegram ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Пользователь</TableHead>
              <TableHead>Telegram ID</TableHead>
              <TableHead>Телефон</TableHead>
              <TableHead>Источник</TableHead>
              <TableHead>Баллы</TableHead>
              <TableHead>Варны</TableHead>
              <TableHead>Дата регистрации</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers?.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">
                      {user.first_name} {user.last_name}
                    </div>
                    {user.username && (
                      <div className="text-sm text-gray-500">@{user.username}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <a
                    href={`https://t.me/${user.username || ""}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-600 hover:underline"
                  >
                    {user.tg_user_id}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </TableCell>
                <TableCell>{user.phone_number || "-"}</TableCell>
                <TableCell>
                  {user.source ? (
                    <Badge variant="secondary">{user.source}</Badge>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell>{user.points}</TableCell>
                <TableCell>
                  {user.warns > 0 ? (
                    <Badge variant="destructive">{user.warns}</Badge>
                  ) : (
                    "0"
                  )}
                </TableCell>
                <TableCell>{formatDate(user.first_seen_at)}</TableCell>
                <TableCell>
                  {user.banned ? (
                    <Badge variant="destructive">Заблокирован</Badge>
                  ) : (
                    <Badge variant="default">Активен</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Button
                    variant={user.banned ? "outline" : "destructive"}
                    size="sm"
                    onClick={() => toggleBan(user.id, user.banned)}
                  >
                    {user.banned ? (
                      <>
                        <UserCheck className="h-4 w-4 mr-1" />
                        Разбан
                      </>
                    ) : (
                      <>
                        <Ban className="h-4 w-4 mr-1" />
                        Бан
                      </>
                    )}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
