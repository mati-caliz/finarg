"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import { formatCurrency } from "./formatCurrency";
import type { SavedCalculation } from "./types";

interface SavedCalculationsCardProps {
  calculations: SavedCalculation[];
  onLoad: (calc: SavedCalculation) => void;
  onDelete: (id: string) => void;
}

export default function SavedCalculationsCard({
  calculations,
  onLoad,
  onDelete,
}: SavedCalculationsCardProps) {
  if (calculations.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Cálculos guardados</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {calculations.map((calc) => (
            <div
              key={calc.id}
              className="flex items-center justify-between p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{calc.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(calc.cashPrice)} - {calc.numberOfInstallments}x de{" "}
                  {formatCurrency(calc.installmentValue)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => onLoad(calc)}>
                  Cargar
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onDelete(calc.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
