"use client";

import { Crown, X } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface PaywallProps {
  feature: string;
  description?: string;
  onClose?: () => void;
}

export function Paywall({ feature, description, onClose }: PaywallProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-md w-full relative">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-yellow-500/10 rounded-full">
              <Crown className="w-8 h-8 text-yellow-500" />
            </div>
            <CardTitle className="text-2xl">Feature Premium</CardTitle>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            {description || `Para acceder a ${feature} necesitás actualizar a Premium.`}
          </p>

          <div className="bg-muted p-4 rounded-lg space-y-2">
            <p className="font-semibold">Con Premium obtenés:</p>
            <ul className="space-y-1 text-sm">
              <li>✓ Calculadoras ilimitadas</li>
              <li>✓ 10 alertas personalizadas</li>
              <li>✓ Análisis avanzado</li>
              <li>✓ Exportar a Excel</li>
              <li>✓ Dashboard personalizable</li>
              <li>✓ Sin publicidad</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <Link href="/planes" className="flex-1">
              <Button className="w-full bg-yellow-500 hover:bg-yellow-600 text-white">
                Ver Planes
              </Button>
            </Link>
            {onClose && (
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
