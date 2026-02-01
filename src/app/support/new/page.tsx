"use client";

import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

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
import { useTicketsStore } from "@/lib/tickets/useTicketsStore";

const formSchema = z.object({
  requesterName: z.string().min(2, "Ingresa un nombre válido"),
  requesterEmail: z.string().email("Ingresa un email válido"),
  title: z.string().min(5, "El título debe tener al menos 5 caracteres"),
  description: z
    .string()
    .min(10, "La descripción debe tener al menos 10 caracteres"),
  category: z.enum(["Accesos", "Facturación", "Soporte técnico", "Otro"]).optional()
});

type FormValues = z.infer<typeof formSchema>;

const categoryOptions = ["Accesos", "Facturación", "Soporte técnico", "Otro"] as const;

export default function SupportNewTicketPage() {
  const router = useRouter();
  const createTicket = useTicketsStore((state) => state.createTicket);
  const hasHydrated = useTicketsStore((state) => state.hasHydrated);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting }
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: undefined
    }
  });

  const onSubmit = async (values: FormValues) => {
    const tags = values.category ? [values.category] : [];

    const normalizedEmail = values.requesterEmail.trim().toLowerCase();
    const ticket = createTicket({
      title: values.title,
      description: values.description,
      priority: "media",
      status: "nuevo",
      requester: `${values.requesterName} · ${normalizedEmail}`,
      tags
    });

    toast({
      title: "Ticket enviado",
      description: "Recibimos tu solicitud y te contactaremos pronto."
    });

    router.push(`/support/thanks?ticketId=${ticket.publicId}`);
  };

  if (!hasHydrated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Levantar ticket</CardTitle>
          <CardDescription>Cargando formulario...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
          <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
          <div className="h-24 w-full animate-pulse rounded-md bg-muted" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Levantar ticket</CardTitle>
        <CardDescription>Cuéntanos tu problema y te responderemos pronto.</CardDescription>
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
              <Label>Categoría (opcional)</Label>
              <Controller
                control={control}
                name="category"
                render={({ field }) => (
                  <Select
                    value={field.value ?? "none"}
                    onValueChange={(value) =>
                      field.onChange(value === "none" ? undefined : value)
                    }
                    disabled={isSubmitting}
                  >
                    <SelectTrigger aria-label="Seleccionar categoría">
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sin categoría</SelectItem>
                      {categoryOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Enviando..." : "Enviar ticket"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
