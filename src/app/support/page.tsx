import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function SupportLandingPage() {
  return (
    <div className="space-y-10">
      <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div className="space-y-4">
          <p className="text-sm font-medium text-muted-foreground">Portal de clientes</p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Soporte rápido y transparente para tu equipo.
          </h1>
          <p className="text-base text-muted-foreground">
            Crea tickets, consulta su estado y mantén a tu equipo informado con un
            flujo simple y claro.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/support/new">Levantar ticket</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/support/status">Consultar estado</Link>
            </Button>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>¿Cómo funciona?</CardTitle>
            <CardDescription>Un proceso en tres pasos.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-semibold">1. Envía tu solicitud</p>
              <p className="text-sm text-muted-foreground">
                Completa el formulario con los datos del problema.
              </p>
            </div>
            <Separator />
            <div>
              <p className="text-sm font-semibold">2. Seguimiento en línea</p>
              <p className="text-sm text-muted-foreground">
                Revisa el estado y las actualizaciones del equipo.
              </p>
            </div>
            <Separator />
            <div>
              <p className="text-sm font-semibold">3. Resolución</p>
              <p className="text-sm text-muted-foreground">
                Recibe respuestas rápidas y consistentes.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          { title: "Atención clara", desc: "Actualizaciones en cada etapa." },
          { title: "Prioridad visible", desc: "Clasificación transparente." },
          { title: "Respuestas rápidas", desc: "Menos fricción, más foco." }
        ].map((item) => (
          <Card key={item.title}>
            <CardHeader>
              <CardTitle className="text-base">{item.title}</CardTitle>
              <CardDescription>{item.desc}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </section>
    </div>
  );
}
