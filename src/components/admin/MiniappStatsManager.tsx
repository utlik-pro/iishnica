import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, TrendingUp, CheckCircle, Calendar } from "lucide-react";

interface Stats {
  total: number;
  today: number;
  thisWeek: number;
  thisMonth: number;
  byStatus: Record<string, number>;
}

const statusLabels: Record<string, string> = {
  new: "Новые",
  contacted: "Связались",
  paid: "Оплачено",
  not_paid: "Не оплачено",
  will_attend: "Придут",
  will_not_attend: "Не придут",
};

export function MiniappStatsManager() {
  const [stats, setStats] = useState<Stats>({
    total: 0,
    today: 0,
    thisWeek: 0,
    thisMonth: 0,
    byStatus: {},
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const { data: allLeads, error } = await supabase
        .from("leads")
        .select("created_at, status")
        .eq("source", "miniapp");

      if (error) throw error;

      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      const byStatus: Record<string, number> = {};

      const todayLeads = (allLeads || []).filter(lead => {
        const createdAt = new Date(lead.created_at);

        // Count by status
        byStatus[lead.status] = (byStatus[lead.status] || 0) + 1;

        return createdAt >= todayStart;
      });

      const weekLeads = (allLeads || []).filter(lead => {
        const createdAt = new Date(lead.created_at);
        return createdAt >= weekStart;
      });

      const monthLeads = (allLeads || []).filter(lead => {
        const createdAt = new Date(lead.created_at);
        return createdAt >= monthStart;
      });

      setStats({
        total: (allLeads || []).length,
        today: todayLeads.length,
        thisWeek: weekLeads.length,
        thisMonth: monthLeads.length,
        byStatus,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-4">Загрузка статистики...</div>;
  }

  const conversionRate = stats.total > 0
    ? Math.round(((stats.byStatus.paid || 0) / stats.total) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Статистика Mini-App</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Аналитика регистраций через Telegram Mini-App
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего регистраций</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">За всё время</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Сегодня</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.today}</div>
            <p className="text-xs text-muted-foreground">Новых регистраций</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">За неделю</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.thisWeek}</div>
            <p className="text-xs text-muted-foreground">Последние 7 дней</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">За месяц</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.thisMonth}</div>
            <p className="text-xs text-muted-foreground">Текущий месяц</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Распределение по статусам</CardTitle>
            <CardDescription>Количество лидов в каждом статусе</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(stats.byStatus).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{statusLabels[status] || status}</span>
                  <Badge variant="secondary">{count}</Badge>
                </div>
              ))}
              {Object.keys(stats.byStatus).length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Пока нет данных
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Конверсия</CardTitle>
            <CardDescription>Процент оплаченных регистраций</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-5xl font-bold text-primary">{conversionRate}%</div>
                <p className="text-sm text-muted-foreground mt-2">
                  {stats.byStatus.paid || 0} из {stats.total} регистраций оплачено
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Оплачено</span>
                  <span className="font-medium">{stats.byStatus.paid || 0}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Не оплачено</span>
                  <span className="font-medium">{stats.byStatus.not_paid || 0}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Новые (ожидают)</span>
                  <span className="font-medium">{stats.byStatus.new || 0}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Сводка</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Средняя конверсия</p>
              <p className="text-2xl font-bold">{conversionRate}%</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Подтвердят участие</p>
              <p className="text-2xl font-bold">{stats.byStatus.will_attend || 0}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Активных лидов</p>
              <p className="text-2xl font-bold">
                {(stats.byStatus.new || 0) + (stats.byStatus.contacted || 0)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
