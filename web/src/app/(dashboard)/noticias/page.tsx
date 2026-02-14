import { NewsList } from "@/components/news/NewsList";
import { Newspaper } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Noticias Financieras | FinArg",
  description: "Últimas noticias financieras de Argentina con análisis de inteligencia artificial",
};

export default function NoticiasPage() {
  return (
    <div className="container py-8 max-w-5xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Newspaper className="w-8 h-8 text-violet-600 dark:text-violet-400" />
          <h1 className="text-3xl font-bold">Noticias Financieras</h1>
        </div>
        <p className="text-muted-foreground">
          Últimas noticias del mercado financiero argentino con análisis automático de IA
        </p>
      </div>

      <NewsList />
    </div>
  );
}
