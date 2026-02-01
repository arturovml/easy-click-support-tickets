import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
  return (
    <main className="container py-10">
      <Card>
        <CardHeader>
          <CardTitle>Proyecto listo</CardTitle>
          <CardDescription>
            Next.js + Tailwind + shadcn/ui + next-themes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button>Comenzar</Button>
        </CardContent>
      </Card>
    </main>
  );
}
