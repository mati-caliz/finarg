"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart3,
  Building2,
  Check,
  Coins,
  Crown,
  FileText,
  Flame,
  Gem,
  Sparkles,
  TrendingUp,
  X,
} from "lucide-react";
import Link from "next/link";

interface InvestmentsPremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const premiumFeatures = [
  {
    id: "stocks",
    icon: TrendingUp,
    title: "Acciones Populares",
    description: "Seguimiento de las acciones más relevantes del mercado argentino",
  },
  {
    id: "cedears",
    icon: Building2,
    title: "CEDEARs",
    description: "Acceso a acciones extranjeras listadas en Argentina",
  },
  {
    id: "bonds",
    icon: FileText,
    title: "Bonos",
    description: "Información detallada sobre bonos soberanos y corporativos",
  },
  {
    id: "etfs",
    icon: BarChart3,
    title: "ETFs",
    description: "Fondos cotizados para diversificar tu portafolio",
  },
  {
    id: "metals",
    icon: Gem,
    title: "Metales Preciosos",
    description: "Precios actualizados de oro, plata, platino y paladio",
  },
  {
    id: "letras",
    icon: Coins,
    title: "Letras del Tesoro",
    description: "Letras del Tesoro (LECAPs, LEDEs) con tasas actualizadas",
  },
  {
    id: "cauciones",
    icon: Flame,
    title: "Cauciones",
    description: "Tasas de cauciones para maximizar rendimientos a corto plazo",
  },
];

export function InvestmentsPremiumModal({ isOpen, onClose }: InvestmentsPremiumModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
      tabIndex={-1}
    >
      <Card
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border-2 border-primary/20 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
        role="document"
        tabIndex={0}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Cerrar modal"
        >
          <X className="h-5 w-5" />
        </button>

        <CardHeader className="text-center pb-4 pt-6">
          <div className="flex justify-center mb-3">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500">
              <Crown className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
            <Sparkles className="h-6 w-6 text-yellow-500" />
            Inversiones Premium
            <Sparkles className="h-6 w-6 text-yellow-500" />
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Desbloquea acceso completo a herramientas avanzadas de inversión
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid gap-3">
            {premiumFeatures.map((feature) => (
              <div
                key={feature.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 flex-shrink-0">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm mb-0.5">{feature.title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
                <Check className="h-5 w-5 text-green-600 dark:text-green-500 flex-shrink-0 mt-0.5" />
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-lg p-4 border border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h4 className="font-semibold text-sm">¿Por qué Premium?</h4>
            </div>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-500 flex-shrink-0" />
                <span>Acceso ilimitado a todas las herramientas de inversión</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-500 flex-shrink-0" />
                <span>Datos actualizados en tiempo real</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-500 flex-shrink-0" />
                <span>Sin anuncios ni limitaciones</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-500 flex-shrink-0" />
                <span>Soporte prioritario</span>
              </li>
            </ul>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              asChild
              className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold"
            >
              <Link href="/planes" className="flex items-center justify-center gap-2">
                <Crown className="h-4 w-4" />
                Hacerse Premium
              </Link>
            </Button>
            <Button variant="outline" onClick={onClose} className="px-6">
              Cerrar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
