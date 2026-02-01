"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useForm } from "react-hook-form";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { formatDate, formatDateTime } from "@/lib/date";
import type { Comment, TicketPriority, TicketStatus } from "@/lib/tickets/types";
import { useTicketsStore } from "@/lib/tickets/useTicketsStore";
import { Skeleton } from "@/components/ui/skeleton";

type TicketDetailPageProps = {
  params: {
    ticketId: string;
  };
};

type CommentFormValues = {
  author: string;
  message: string;
};

const statusOptions: Array<{ value: TicketStatus; label: string }> = [
  { value: "nuevo", label: "Nuevo" },
  { value: "en_progreso", label: "En progreso" },
  { value: "en_espera", label: "En espera" },
  { value: "resuelto", label: "Resuelto" },
  { value: "cerrado", label: "Cerrado" }
];

const priorityOptions: Array<{ value: TicketPriority; label: string }> = [
  { value: "baja", label: "Baja" },
  { value: "media", label: "Media" },
  { value: "alta", label: "Alta" },
  { value: "critica", label: "Crítica" }
];

const agents = ["Carlos Vega", "Valentina Rojas", "Paula Núñez"] as const;

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

export default function TicketDetailPage({ params }: TicketDetailPageProps) {
  const {
    tickets,
    comments,
    addComment,
    updateTicketPriority,
    updateTicketStatus,
    assignTicket
  } = useTicketsStore();
  const hasHydrated = useTicketsStore((state) => state.hasHydrated);

  const ticket = tickets.find((item) => item.id === params.ticketId);
  const ticketComments = useMemo(
    () =>
      comments
        .filter((comment) => comment.ticketId === params.ticketId)
        .sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        ),
    [comments, params.ticketId]
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting }
  } = useForm<CommentFormValues>({
    defaultValues: {
      author: "",
      message: ""
    }
  });

  if (!hasHydrated) {
    return (
      <div className="space-y-6" aria-busy="true" aria-live="polite">
        <Skeleton className="h-8 w-2/3" />
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <Skeleton className="h-[360px] w-full" />
          <Skeleton className="h-[240px] w-full" />
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ticket no encontrado</CardTitle>
          <CardDescription>
            No pudimos encontrar el ticket solicitado.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline">
            <Link href="/app/tickets">Volver al inbox</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const [requesterName, requesterEmail] = ticket.requester
    .split(" · ")
    .map((value) => value.trim());

  const handleCommentSubmit = (values: CommentFormValues) => {
    if (!values.message.trim() || !values.author.trim()) return;
    addComment(ticket.id, {
      author: values.author.trim(),
      message: values.message.trim()
    });
    toast({
      title: "Comentario agregado",
      description: "La actualización fue registrada en el timeline."
    });
    reset({ author: values.author, message: "" });
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">{ticket.title}</h1>
            <Badge variant={statusBadges[ticket.status]} className="capitalize">
              {ticket.status.replace("_", " ")}
            </Badge>
            <Badge variant={priorityBadges[ticket.priority]} className="capitalize">
              {ticket.priority.replace("_", " ")}
            </Badge>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span>Cliente: {requesterName}</span>
            <span>Email: {requesterEmail}</span>
            <span>Creado: {formatDate(ticket.createdAt)}</span>
          </div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
              <CardDescription>
                Actualizaciones y conversación del ticket.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <p className="text-sm font-semibold">Descripción inicial</p>
                <p className="text-sm text-muted-foreground">{ticket.description}</p>
              </div>

              <Separator />

              <div className="space-y-4">
                {ticketComments.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Aún no hay comentarios.
                  </p>
                ) : (
                  ticketComments.map((comment) => (
                    <CommentCard key={comment.id} comment={comment} />
                  ))
                )}
              </div>

              <Separator />

              <form
                className="space-y-4"
                onSubmit={handleSubmit(handleCommentSubmit)}
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="author">Autor</Label>
                    <Input
                      id="author"
                      placeholder="Nombre del agente"
                      disabled={isSubmitting}
                      aria-label="Autor del comentario"
                      {...register("author", { required: true })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Comentario</Label>
                  <Textarea
                    id="message"
                    placeholder="Escribe una actualización"
                    disabled={isSubmitting}
                    aria-label="Mensaje del comentario"
                    {...register("message", { required: true })}
                  />
                </div>
                <div className="flex justify-end">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Guardando..." : "Agregar comentario"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Acciones</CardTitle>
              <CardDescription>Actualiza el estado del ticket.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={ticket.status}
                  onValueChange={(value) => {
                    updateTicketStatus(ticket.id, value as TicketStatus);
                    toast({
                      title: "Status actualizado",
                      description: `Nuevo status: ${value.replace("_", " ")}.`
                    });
                  }}
                >
                  <SelectTrigger aria-label="Cambiar status">
                    <SelectValue placeholder="Selecciona status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Prioridad</Label>
                <Select
                  value={ticket.priority}
                  onValueChange={(value) => {
                    updateTicketPriority(ticket.id, value as TicketPriority);
                    toast({
                      title: "Prioridad actualizada",
                      description: `Nueva prioridad: ${value.replace("_", " ")}.`
                    });
                  }}
                >
                  <SelectTrigger aria-label="Cambiar prioridad">
                    <SelectValue placeholder="Selecciona prioridad" />
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
              <div className="space-y-2">
                <Label>Asignar a</Label>
                <Select
                  value={ticket.assignee ?? "sin_asignar"}
                  onValueChange={(value) => {
                    assignTicket(
                      ticket.id,
                      value === "sin_asignar" ? undefined : value
                    );
                    toast({
                      title: "Asignación actualizada",
                      description:
                        value === "sin_asignar"
                          ? "Ticket sin asignar."
                          : `Asignado a ${value}.`
                    });
                  }}
                >
                  <SelectTrigger aria-label="Asignar ticket">
                    <SelectValue placeholder="Selecciona agente" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sin_asignar">Sin asignar</SelectItem>
                    {agents.map((agent) => (
                      <SelectItem key={agent} value={agent}>
                        {agent}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function CommentCard({ comment }: { comment: Comment }) {
  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">{comment.author}</p>
        <span className="text-xs text-muted-foreground">
          {formatDateTime(comment.createdAt)}
        </span>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{comment.message}</p>
    </div>
  );
}
