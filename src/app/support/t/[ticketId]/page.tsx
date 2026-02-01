"use client";

import * as React from "react";
import Link from "next/link";
import { useMemo } from "react";
import { useSearchParams } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatDate, formatDateTime } from "@/lib/date";
import type { TicketPriority, TicketStatus } from "@/lib/tickets/types";
import { useTicketsStore } from "@/lib/tickets/useTicketsStore";

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

type TicketDetailProps = {
  params: {
    ticketId: string;
  };
};

export default function SupportTicketDetailPage({ params }: TicketDetailProps) {
  const tickets = useTicketsStore((state) => state.tickets);
  const comments = useTicketsStore((state) => state.comments);
  const hasHydrated = useTicketsStore((state) => state.hasHydrated);
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email")?.trim().toLowerCase();

  const ticket = tickets.find(
    (item) => item.publicId === params.ticketId || item.id === params.ticketId
  );
  const requesterEmail = ticket?.requester.split(" · ")[1]?.trim().toLowerCase();
  const ticketComments = useMemo(() => {
    if (!ticket) return [];
    return comments
      .filter((comment) => comment.ticketId === ticket.id)
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
  }, [comments, ticket]);

  if (!hasHydrated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Detalle del ticket</CardTitle>
          <CardDescription>Cargando información...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="h-6 w-1/2 animate-pulse rounded-md bg-muted" />
          <div className="h-4 w-2/3 animate-pulse rounded-md bg-muted" />
          <div className="h-32 w-full animate-pulse rounded-md bg-muted" />
        </CardContent>
      </Card>
    );
  }

  if (!ticket) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ticket no encontrado</CardTitle>
          <CardDescription>
            Verifica el número de ticket o crea una nueva solicitud.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button asChild variant="outline">
            <Link href="/support/status">Volver</Link>
          </Button>
          <Button asChild>
            <Link href="/support/new">Levantar ticket</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!emailParam || emailParam !== requesterEmail) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No autorizado</CardTitle>
          <CardDescription>
            El correo no coincide con el solicitante del ticket.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/support/status">Consultar estado</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const [requesterName, requesterEmailDisplay] = ticket.requester
    .split(" · ")
    .map((value) => value.trim());

  const hasRoles = ticketComments.some((comment) => comment.authorRole);
  const supportComments = hasRoles
    ? ticketComments.filter((comment) => comment.authorRole !== "customer")
    : ticketComments;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle>{ticket.title}</CardTitle>
            <span className="text-sm text-muted-foreground">{ticket.publicId}</span>
            <Badge variant={statusBadges[ticket.status]} className="capitalize">
              {ticket.status.replace("_", " ")}
            </Badge>
            <Badge variant={priorityBadges[ticket.priority]} className="capitalize">
              {ticket.priority.replace("_", " ")}
            </Badge>
          </div>
          <CardDescription className="flex flex-wrap gap-4">
            <span>Cliente: {requesterName}</span>
            <span>Email: {requesterEmailDisplay}</span>
            <span>Creado: {formatDate(ticket.createdAt)}</span>
            <span>Actualizado: {formatDate(ticket.updatedAt)}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <p className="text-sm font-semibold">Descripción inicial</p>
            <p className="text-sm text-muted-foreground">{ticket.description}</p>
          </div>
          <Separator />
          <div className="space-y-4">
            <p className="text-sm font-semibold">Actualizaciones</p>
            {supportComments.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No hay comentarios por ahora.
              </p>
            ) : (
              supportComments.map((comment) => (
                <div key={comment.id} className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">{comment.author}</p>
                    <span className="text-xs text-muted-foreground">
                      {formatDateTime(comment.createdAt)}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {comment.message}
                  </p>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
