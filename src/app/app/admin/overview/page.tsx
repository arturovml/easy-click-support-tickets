"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatDate, formatDayLabel } from "@/lib/date";
import type { Ticket } from "@/lib/tickets/types";
import { useTicketsStore } from "@/lib/tickets/useTicketsStore";
import { Skeleton } from "@/components/ui/skeleton";

type DailyCount = {
  day: string;
  total: number;
};

const priorityRank: Record<Ticket["priority"], number> = {
  critica: 4,
  alta: 3,
  media: 2,
  baja: 1
};

const priorityBadge: Record<
  Ticket["priority"],
  "default" | "secondary" | "destructive" | "outline"
> = {
  critica: "destructive",
  alta: "default",
  media: "secondary",
  baja: "outline"
};

export default function AdminOverviewPage() {
  const tickets = useTicketsStore((state) => state.tickets);
  const hasHydrated = useTicketsStore((state) => state.hasHydrated);

  const { openCount, pendingCount, solvedLast7, urgentTickets, chartData } = useMemo(() => {
    const open = tickets.filter((ticket) => ticket.status === "en_progreso").length;
    const pending = tickets.filter((ticket) => ticket.status === "en_espera").length;

    const now = new Date();
    const todayUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const last7Days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(todayUtc);
      date.setUTCDate(todayUtc.getUTCDate() - (6 - index));
      return date;
    });

    const solvedLast7Days = tickets.filter((ticket) => {
      if (ticket.status !== "resuelto") return false;
      const updated = new Date(ticket.updatedAt);
      const diff = now.getTime() - updated.getTime();
      return diff <= 7 * 24 * 60 * 60 * 1000;
    }).length;

    const chart: DailyCount[] = last7Days.map((date) => {
      const dayLabel = formatDayLabel(date);

      const total = tickets.filter((ticket) => {
        const updated = new Date(ticket.updatedAt);
        return (
          updated.getDate() === date.getDate() &&
          updated.getMonth() === date.getMonth() &&
          updated.getFullYear() === date.getFullYear()
        );
      }).length;

      return { day: dayLabel, total };
    });

    const urgent = [...tickets]
      .sort((a, b) => {
        const rankDiff = priorityRank[b.priority] - priorityRank[a.priority];
        if (rankDiff !== 0) return rankDiff;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      })
      .slice(0, 5);

    return {
      openCount: open,
      pendingCount: pending,
      solvedLast7: solvedLast7Days,
      urgentTickets: urgent,
      chartData: chart
    };
  }, [tickets]);

  if (!hasHydrated) {
    return (
      <div className="space-y-6" aria-busy="true" aria-live="polite">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-28 w-full" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <Skeleton className="h-[320px] w-full" />
          <Skeleton className="h-[320px] w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Admin Overview</h1>
        <p className="text-sm text-muted-foreground">
          Indicadores clave del equipo de soporte.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard title="Open" value={openCount.toString()} detail="En progreso" />
        <KpiCard title="Pending" value={pendingCount.toString()} detail="En espera" />
        <KpiCard
          title="Solved"
          value={solvedLast7.toString()}
          detail="Últimos 7 días"
        />
        <KpiCard
          title="Avg response time"
          value="3h 42m"
          detail="Promedio semanal"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Actividad por día</CardTitle>
            <CardDescription>Tickets actualizados en los últimos 7 días.</CardDescription>
          </CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ left: -24, right: 12 }}>
                <XAxis dataKey="day" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} width={32} />
                <Tooltip
                  cursor={{ fill: "hsl(var(--muted))" }}
                  contentStyle={{
                    borderRadius: "0.75rem",
                    border: "1px solid hsl(var(--border))",
                    background: "hsl(var(--background))"
                  }}
                />
                <Bar dataKey="total" radius={[8, 8, 0, 0]} fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tickets urgentes</CardTitle>
            <CardDescription>Top 5 por prioridad y actualización.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {urgentTickets.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No hay tickets críticos por ahora.
              </p>
            ) : (
              urgentTickets.map((ticket, index) => (
                <div key={ticket.id} className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold">{ticket.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {ticket.requester}
                      </p>
                    </div>
                    <Badge variant={priorityBadge[ticket.priority]} className="capitalize">
                      {ticket.priority.replace("_", " ")}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Última actualización</span>
                    <span>
                      {formatDate(ticket.updatedAt)}
                    </span>
                  </div>
                  {index < urgentTickets.length - 1 ? <Separator /> : null}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function KpiCard({ title, value, detail }: { title: string; value: string; detail: string }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardDescription>{title}</CardDescription>
        <CardTitle className="text-3xl font-semibold">{value}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground">{detail}</p>
      </CardContent>
    </Card>
  );
}
