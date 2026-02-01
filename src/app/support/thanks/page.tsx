"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SupportThanksPage() {
  const searchParams = useSearchParams();
  const ticketId = searchParams.get("ticketId");
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    if (!ticketId) return;
    await navigator.clipboard.writeText(ticketId);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  if (!ticketId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sin folio</CardTitle>
          <CardDescription>
            No encontramos un número de ticket en esta página.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/support/new">Levantar ticket</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Solicitud recibida</CardTitle>
        <CardDescription>
          Nuestro equipo ya está revisando tu solicitud.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-lg border bg-muted/40 p-6 text-center">
          <p className="text-sm text-muted-foreground">Tu folio</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight">{ticketId}</p>
          <Button className="mt-4" variant="outline" onClick={handleCopy}>
            {copied ? "Copiado" : "Copiar folio"}
          </Button>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href={`/support/status?ticketId=${ticketId}`}>Consultar estado</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/support/t/${ticketId}`}>Ver detalle</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
