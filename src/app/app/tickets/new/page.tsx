"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import type { TicketPriority } from "@/lib/tickets/types";
import { useTicketsStore } from "@/lib/tickets/useTicketsStore";

const formSchema = z.object({
  requesterName: z.string().min(2, "Ingresa un nombre válido"),
  requesterEmail: z.string().email("Ingresa un email válido"),
  title: z.string().min(5, "El título debe tener al menos 5 caracteres"),
  description: z
    .string()
    .min(10, "La descripción debe tener al menos 10 caracteres"),
  priority: z.enum(["baja", "media", "alta", "critica"]),
  tags: z.string().optional()
});

type FormValues = z.infer<typeof formSchema>;

const priorityOptions: Array<{ value: TicketPriority; label: string }> = [
  { value: "baja", label: "Baja" },
  { value: "media", label: "Media" },
  { value: "alta", label: "Alta" },
  { value: "critica", label: "Crítica" }
];

export default function NewTicketPage() {
  const router = useRouter();
  const createTicket = useTicketsStore((state) => state.createTicket);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      priority: "media",
      tags: ""
    }
  });

  const priorityValue = watch("priority");

  const onSubmit = async (values: FormValues) => {
    const tags = values.tags
      ? values.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean)
      : [];

    const normalizedEmail = values.requesterEmail.trim().toLowerCase();
    const ticket = createTicket({
      title: values.title,
      description: values.description,
      priority: values.priority,
      status: "nuevo",
      requester: `${values.requesterName} · ${normalizedEmail}`,
      tags
    });

    toast({
      title: "Ticket creado",
      description: `Se creó el ticket ${ticket.id}.`
    });

    router.push(`/app/tickets/${ticket.id}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Crear Ticket</CardTitle>
        <CardDescription>Completa los datos del solicitante.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="requesterName">Nombre</Label>
              <Input
                id="requesterName"
                placeholder="Ej: Camila Ortega"
                disabled={isSubmitting}
                aria-invalid={Boolean(errors.requesterName)}
                aria-describedby={errors.requesterName ? "requesterName-error" : undefined}
                {...register("requesterName")}
              />
              {errors.requesterName ? (
                <p id="requesterName-error" className="text-xs text-destructive">
                  {errors.requesterName.message}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="requesterEmail">Email</Label>
              <Input
                id="requesterEmail"
                type="email"
                placeholder="ejemplo@empresa.com"
                disabled={isSubmitting}
                aria-invalid={Boolean(errors.requesterEmail)}
                aria-describedby={errors.requesterEmail ? "requesterEmail-error" : undefined}
                {...register("requesterEmail")}
              />
              {errors.requesterEmail ? (
                <p id="requesterEmail-error" className="text-xs text-destructive">
                  {errors.requesterEmail.message}
                </p>
              ) : null}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              placeholder="Ej: Error al abrir el panel"
              disabled={isSubmitting}
              aria-invalid={Boolean(errors.title)}
              aria-describedby={errors.title ? "title-error" : undefined}
              {...register("title")}
            />
            {errors.title ? (
              <p id="title-error" className="text-xs text-destructive">
                {errors.title.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              placeholder="Describe el problema con el mayor detalle posible"
              disabled={isSubmitting}
              aria-invalid={Boolean(errors.description)}
              aria-describedby={errors.description ? "description-error" : undefined}
              {...register("description")}
            />
            {errors.description ? (
              <p id="description-error" className="text-xs text-destructive">
                {errors.description.message}
              </p>
            ) : null}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Prioridad</Label>
              <Select
                value={priorityValue}
                onValueChange={(value) => setValue("priority", value as TicketPriority)}
                disabled={isSubmitting}
              >
                <SelectTrigger aria-label="Seleccionar prioridad">
                  <SelectValue placeholder="Selecciona una prioridad" />
                </SelectTrigger>
                <SelectContent>
                  {priorityOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.priority ? (
                <p className="text-xs text-destructive">{errors.priority.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                placeholder="facturacion, urgencia"
                disabled={isSubmitting}
                {...register("tags")}
              />
              <p className="text-xs text-muted-foreground">
                Separa los tags con comas.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creando..." : "Crear ticket"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
