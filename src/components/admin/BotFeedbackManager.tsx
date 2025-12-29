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
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, MessageSquare, TrendingUp } from "lucide-react";

type BotFeedback = {
  id: number;
  event_id: number;
  user_id: number;
  speaker1_rating: number | null;
  speaker2_rating: number | null;
  comment: string | null;
  interested_topics: string | null;
  created_at: string;
  bot_events: {
    title: string;
    event_date: string;
  } | null;
  bot_users: {
    username: string | null;
    first_name: string | null;
    last_name: string | null;
  } | null;
};

type BotEvent = {
  id: number;
  title: string;
  event_date: string;
};

const ratingEmoji = ["", "1", "2", "3", "4"];

export function BotFeedbackManager() {
  const [selectedEvent, setSelectedEvent] = useState<string>("all");

  const { data: events } = useQuery({
    queryKey: ["bot_events_for_feedback"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bot_events")
        .select("id, title, event_date")
        .order("event_date", { ascending: false });
      if (error) throw error;
      return data as BotEvent[];
    },
  });

  const { data: feedback, isLoading } = useQuery({
    queryKey: ["bot_feedback", selectedEvent],
    queryFn: async () => {
      let query = supabase
        .from("bot_feedback")
        .select(`
          *,
          bot_events (title, event_date),
          bot_users (username, first_name, last_name)
        `)
        .order("created_at", { ascending: false });

      if (selectedEvent !== "all") {
        query = query.eq("event_id", parseInt(selectedEvent));
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as BotFeedback[];
    },
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Calculate stats
  const stats = feedback?.reduce(
    (acc, fb) => {
      if (fb.speaker1_rating) {
        acc.speaker1Total += fb.speaker1_rating;
        acc.speaker1Count++;
      }
      if (fb.speaker2_rating) {
        acc.speaker2Total += fb.speaker2_rating;
        acc.speaker2Count++;
      }
      if (fb.comment) {
        acc.commentsCount++;
      }
      return acc;
    },
    {
      speaker1Total: 0,
      speaker1Count: 0,
      speaker2Total: 0,
      speaker2Count: 0,
      commentsCount: 0,
    }
  );

  const speaker1Avg = stats?.speaker1Count
    ? (stats.speaker1Total / stats.speaker1Count).toFixed(1)
    : "-";
  const speaker2Avg = stats?.speaker2Count
    ? (stats.speaker2Total / stats.speaker2Count).toFixed(1)
    : "-";

  // Collect all interested topics
  const topicsCount: Record<string, number> = {};
  feedback?.forEach((fb) => {
    if (fb.interested_topics) {
      fb.interested_topics.split(",").forEach((topic) => {
        const trimmed = topic.trim();
        if (trimmed) {
          topicsCount[trimmed] = (topicsCount[trimmed] || 0) + 1;
        }
      });
    }
  });
  const sortedTopics = Object.entries(topicsCount).sort((a, b) => b[1] - a[1]);

  if (isLoading) {
    return <div className="p-4">Загрузка...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Фидбек от участников</h2>
        <Badge variant="outline">{feedback?.length || 0} отзывов</Badge>
      </div>

      <Select value={selectedEvent} onValueChange={setSelectedEvent}>
        <SelectTrigger className="w-[300px]">
          <SelectValue placeholder="Фильтр по мероприятию" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Все мероприятия</SelectItem>
          {events?.map((event) => (
            <SelectItem key={event.id} value={event.id.toString()}>
              {event.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Средняя оценка спикера 1
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <span className="text-2xl font-bold">{speaker1Avg}</span>
              <span className="text-gray-500">/ 4</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Средняя оценка спикера 2
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <span className="text-2xl font-bold">{speaker2Avg}</span>
              <span className="text-gray-500">/ 4</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Комментариев
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-500" />
              <span className="text-2xl font-bold">{stats?.commentsCount || 0}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Всего отзывов
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <span className="text-2xl font-bold">{feedback?.length || 0}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Popular Topics */}
      {sortedTopics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Интересующие темы (по популярности)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {sortedTopics.map(([topic, count]) => (
                <Badge key={topic} variant="secondary">
                  {topic} ({count})
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Feedback Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Пользователь</TableHead>
              <TableHead>Мероприятие</TableHead>
              <TableHead>Спикер 1</TableHead>
              <TableHead>Спикер 2</TableHead>
              <TableHead>Комментарий</TableHead>
              <TableHead>Интересные темы</TableHead>
              <TableHead>Дата</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {feedback?.map((fb) => (
              <TableRow key={fb.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">
                      {fb.bot_users?.first_name} {fb.bot_users?.last_name}
                    </div>
                    {fb.bot_users?.username && (
                      <div className="text-sm text-gray-500">
                        @{fb.bot_users.username}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-medium">{fb.bot_events?.title}</div>
                </TableCell>
                <TableCell>
                  {fb.speaker1_rating ? (
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      {fb.speaker1_rating}/4
                    </div>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell>
                  {fb.speaker2_rating ? (
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      {fb.speaker2_rating}/4
                    </div>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell>
                  {fb.comment ? (
                    <div className="max-w-xs truncate" title={fb.comment}>
                      {fb.comment}
                    </div>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell>
                  {fb.interested_topics ? (
                    <div className="flex flex-wrap gap-1">
                      {fb.interested_topics.split(",").slice(0, 2).map((topic, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {topic.trim()}
                        </Badge>
                      ))}
                      {fb.interested_topics.split(",").length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{fb.interested_topics.split(",").length - 2}
                        </Badge>
                      )}
                    </div>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell className="text-sm text-gray-500">
                  {formatDate(fb.created_at)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
