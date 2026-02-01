"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Plus, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import type { Ticket, TicketPriority, TicketStatus } from "@/lib/tickets/types";
import { useTicketsStore } from "@/lib/tickets/useTicketsStore";
import { formatDate } from "@/lib/date";
import { Skeleton } from "@/components/ui/skeleton";

const statusOptions: Array<{ value: StatusFilter; label: string }> = [
  { value: "all", label: "Todos" },
  { value: "nuevo", label: "Nuevo" },
  { value: "en_progreso", label: "En progreso" },
  { value: "en_espera", label: "En espera" },
  { value: "resuelto", label: "Resuelto" },
  { value: "cerrado", label: "Cerrado" }
];

const priorityOptions: Array<{ value: PriorityFilter; label: string }> = [
  { value: "all", label: "Todas" },
  { value: "baja", label: "Baja" },
  { value: "media", label: "Media" },
  { value: "alta", label: "Alta" },
  { value: "critica", label: "Crítica" }
];

const statusBadges: Record<TicketStatus, "default" | "secondary" | "destructive" | "outline"> = {
  nuevo: "secondary",
  en_progreso: "default",
  en_espera: "outline",
  resuelto: "secondary",
  cerrado: "outline"
};

const priorityBadges: Record<TicketPriority, "default" | "secondary" | "destructive" | "outline"> = {
  baja: "outline",
  media: "secondary",
  alta: "default",
  critica: "destructive"
};

const shortId = (ticket: Ticket) => ticket.publicId;

export default function TicketsPage() {
  const router = useRouter();
  const tickets = useTicketsStore((state) => state.tickets);
  const hasHydrated = useTicketsStore((state) => state.hasHydrated);
  const [status, setStatus] = useState<StatusFilter>("all");
  const [priority, setPriority] = useState<PriorityFilter>("all");
  const [query, setQuery] = useState<string>("");

  const filteredTickets = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const result = tickets.filter((ticket) => {
      if (status !== "all" && ticket.status !== status) return false;
      if (priority !== "all" && ticket.priority !== priority) return false;
      if (!normalized) return true;
      const haystack = [
        ticket.id,
        ticket.publicId,
        ticket.title,
        ticket.description,
        ticket.requester,
        ticket.assignee ?? "",
        ticket.tags.join(" ")
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalized);
    });

    return result.sort((a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }, [tickets, status, priority, query]);

  if (!hasHydrated) {
    return (
      <div className="space-y-6" aria-busy="true" aria-live="polite">
        <div className="space-y-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-[420px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Inbox</h1>
          <p className="text-sm text-muted-foreground">
            Gestiona los tickets en tiempo real.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button aria-label="Crear nuevo ticket">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo ticket
          </Button>
          <Button variant="outline" aria-label="Exportar tickets a CSV">
            <Download className="mr-2 h-4 w-4" />
            Exportar CSV
          </Button>
        </div>
      </header>

      <Card>
        <CardContent className="space-y-4 p-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative w-full lg:max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar por ID, cliente o título"
                aria-label="Buscar tickets"
                className="pl-9"
              />
            </div>
            <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
              <Select value={status} onValueChange={(value) => setStatus(value as StatusFilter)}>
                <SelectTrigger className="sm:w-[180px]" aria-label="Filtrar por status">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={priority}
                onValueChange={(value) => setPriority(value as PriorityFilter)}
              >
                <SelectTrigger className="sm:w-[180px]" aria-label="Filtrar por prioridad">
                  <SelectValue placeholder="Prioridad" />
                </SelectTrigger>
                <SelectContent>
                  {priorityOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {filteredTickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed px-6 py-16 text-center">
              <div className="rounded-full bg-muted p-3">
                <Search className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-base font-semibold">Sin resultados</h3>
                <p className="text-sm text-muted-foreground">
                  Prueba ajustando los filtros o el texto de búsqueda.
                </p>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Prioridad</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actualizado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTickets.map((ticket) => (
                  <TableRow
                    key={ticket.id}
                    onClick={() => router.push(`/app/tickets/${ticket.id}`)}
                    className="cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    role="button"
                    tabIndex={0}
                    aria-label={`Ver ticket ${ticket.id}`}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        router.push(`/app/tickets/${ticket.id}`);
                      }
                    }}
                  >
                    <TableCell className="font-medium text-muted-foreground">
                      {shortId(ticket)}
                    </TableCell>
                    <TableCell className="max-w-[280px] truncate">
                      {ticket.title}
                    </TableCell>
                    <TableCell>{ticket.requester}</TableCell>
                    <TableCell>
                      <Badge variant={priorityBadges[ticket.priority]} className="capitalize">
                        {ticket.priority.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusBadges[ticket.status]} className="capitalize">
                        {ticket.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(ticket.updatedAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(event) => {
                          event.stopPropagation();
                          router.push(`/app/tickets/${ticket.id}`);
                        }}
                      >
                        Ver
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
