"use client";

import { BondsSection } from "@/components/investments/BondsSection";
import { CaucionesSection } from "@/components/investments/CaucionesSection";
import { CedearsSection } from "@/components/investments/CedearsSection";
import { CryptoSection } from "@/components/investments/CryptoSection";
import { EtfsSection } from "@/components/investments/EtfsSection";
import { LetrasSection } from "@/components/investments/LetrasSection";
import { MetalsSection } from "@/components/investments/MetalsSection";
import { StocksSection } from "@/components/investments/StocksSection";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";
import {
  BarChart3,
  Bitcoin,
  CircleDollarSign,
  Coins,
  FileText,
  Receipt,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";

type InvestmentTab =
  | "crypto"
  | "stocks"
  | "cedears"
  | "bonds"
  | "etf"
  | "metals"
  | "letras"
  | "cauciones";

export default function InvestmentsPage() {
  const { translate } = useTranslation();
  const [activeTab, setActiveTab] = useState<InvestmentTab>("crypto");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{translate("investmentsTitle")}</h1>
        <p className="text-muted-foreground text-sm mt-1">{translate("investmentsDesc")}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant={activeTab === "crypto" ? "default" : "outline"}
          onClick={() => setActiveTab("crypto")}
          className="flex items-center gap-2"
        >
          <Bitcoin className="h-4 w-4" />
          {translate("crypto")}
        </Button>
        <Button
          variant={activeTab === "stocks" ? "default" : "outline"}
          onClick={() => setActiveTab("stocks")}
          className="flex items-center gap-2"
        >
          <TrendingUp className="h-4 w-4" />
          {translate("stocks")}
        </Button>
        <Button
          variant={activeTab === "cedears" ? "default" : "outline"}
          onClick={() => setActiveTab("cedears")}
          className="flex items-center gap-2"
        >
          <BarChart3 className="h-4 w-4" />
          {translate("cedears")}
        </Button>
        <Button
          variant={activeTab === "bonds" ? "default" : "outline"}
          onClick={() => setActiveTab("bonds")}
          className="flex items-center gap-2"
        >
          <FileText className="h-4 w-4" />
          {translate("bonds")}
        </Button>
        <Button
          variant={activeTab === "etf" ? "default" : "outline"}
          onClick={() => setActiveTab("etf")}
          className="flex items-center gap-2"
        >
          <TrendingUp className="h-4 w-4" />
          {translate("etf")}
        </Button>
        <Button
          variant={activeTab === "metals" ? "default" : "outline"}
          onClick={() => setActiveTab("metals")}
          className="flex items-center gap-2"
        >
          <Coins className="h-4 w-4" />
          {translate("metals")}
        </Button>
        <Button
          variant={activeTab === "letras" ? "default" : "outline"}
          onClick={() => setActiveTab("letras")}
          className="flex items-center gap-2"
        >
          <Receipt className="h-4 w-4" />
          Letras
        </Button>
        <Button
          variant={activeTab === "cauciones" ? "default" : "outline"}
          onClick={() => setActiveTab("cauciones")}
          className="flex items-center gap-2"
        >
          <CircleDollarSign className="h-4 w-4" />
          Cauciones
        </Button>
      </div>

      {activeTab === "crypto" && <CryptoSection />}
      {activeTab === "stocks" && <StocksSection />}
      {activeTab === "cedears" && <CedearsSection />}
      {activeTab === "bonds" && <BondsSection />}
      {activeTab === "etf" && <EtfsSection />}
      {activeTab === "metals" && <MetalsSection />}
      {activeTab === "letras" && <LetrasSection />}
      {activeTab === "cauciones" && <CaucionesSection />}
    </div>
  );
}
