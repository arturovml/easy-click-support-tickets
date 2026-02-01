"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { useTicketsStore } from "@/lib/tickets/useTicketsStore";

const ticketIdSchema = z
  .string()
  .min(1, "Ingresa un número de ticket")
  .regex(/^(EC-\d{4}|\d{4,})$/i, "Formato inválido. Usa EC-XXXX o un número.");

const formSchema = z.object({
  ticketId: ticketIdSchema,
  requesterEmail: z.string().email("Ingresa un email válido")
});

type StatusFormValues = z.infer<typeof formSchema>;

const normalizeTicketId = (value: string) => value.trim().toUpperCase();

const extractTicketNumber = (value: string) => {
  const normalized = normalizeTicketId(value);
  const match = normalized.match(/(\d+)/);
  return match ? match[1] : normalized;
};

export default function SupportStatusPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tickets = useTicketsStore((state) => state.tickets);
  const hasHydrated = useTicketsStore((state) => state.hasHydrated);
  const initialTicketId = searchParams.get("ticketId") ?? "";
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors }
  } = useForm<StatusFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ticketId: initialTicketId,
      requesterEmail: ""
    }
  });

  const onSubmit = async (values: StatusFormValues) => {
    if (!hasHydrated) return;
    const normalizedInput = normalizeTicketId(values.ticketId);
    const numberOnly = extractTicketNumber(values.ticketId);
    const emailInput = values.requesterEmail.trim().toLowerCase();

    const ticket = tickets.find((item) => {
      const publicMatch = item.publicId.toUpperCase() === normalizedInput;
      const idMatch = item.id.toUpperCase() === normalizedInput;
      const numberMatch = item.publicId.includes(numberOnly) || item.id.includes(numberOnly);
      if (!publicMatch && !idMatch && !numberMatch) return false;
      const [, email] = item.requester.split(" · ");
      return email?.trim().toLowerCase() === emailInput;
    });

    if (!ticket) {
      toast({
        title: "No encontramos tu ticket",
        description: "Revisa el folio o el correo del solicitante.",
        variant: "destructive"
      });
      return;
    }

    router.push(`/support/t/${ticket.publicId}?email=${encodeURIComponent(emailInput)}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Consultar estado</CardTitle>
        <CardDescription>
          Ingresa el número de ticket que recibiste por correo.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="ticketId">Número de ticket</Label>
            <Input
              id="ticketId"
              placeholder="Ej: EC-1012 o 1012"
              disabled={isSubmitting}
              aria-invalid={Boolean(errors.ticketId)}
              aria-describedby={errors.ticketId ? "ticketId-error" : undefined}
              {...register("ticketId")}
            />
            {errors.ticketId ? (
              <p id="ticketId-error" className="text-xs text-destructive">
                {errors.ticketId.message}
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="requesterEmail">Email</Label>
            <Input
              id="requesterEmail"
              type="email"
              placeholder="tu@email.com"
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
          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Buscando..." : "Consultar"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
