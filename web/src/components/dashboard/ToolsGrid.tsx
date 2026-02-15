"use client";

import { GoogleAd } from "@/components/GoogleAd";
import { Card, CardContent } from "@/components/ui/card";
import { getCountryConfig } from "@/config/countries";
import { useTranslation } from "@/hooks/useTranslation";
import type { TranslationKey } from "@/i18n/translations";
import { useAppStore, useAuthStore } from "@/store/useStore";
import {
  ArrowLeftRight,
  BarChart3,
  Calculator,
  CreditCard,
  Crown,
  Percent,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";

interface ToolCardConfig {
  href: string;
  titleKey: TranslationKey;
  subtitleKey: TranslationKey;
  icon: LucideIcon;
  borderColor: string;
  iconColor: string;
  iconBg: string;
  iconHoverBg: string;
  shadowColor?: string;
  featureFlag?: string;
  countryOnly?: string;
}

const TOOL_CARDS: ToolCardConfig[] = [
  {
    href: "/calculadora-sueldo-neto",
    titleKey: "incomeTaxCalculator",
    subtitleKey: "incomeTaxSubtitle",
    icon: Calculator,
    borderColor: "border-l-primary",
    iconColor: "text-primary",
    iconBg: "bg-primary/10",
    iconHoverBg: "group-hover:bg-primary/20",
    shadowColor: "hover:shadow-primary/5",
    featureFlag: "incomeTax",
  },
  {
    href: "/inflacion",
    titleKey: "adjustmentCalculator",
    subtitleKey: "updateValues",
    icon: Percent,
    borderColor: "border-l-accent",
    iconColor: "text-accent",
    iconBg: "bg-accent/10",
    iconHoverBg: "group-hover:bg-accent/20",
    shadowColor: "hover:shadow-accent/5",
    featureFlag: "inflation",
  },
  {
    href: "/comparador-tasas",
    titleKey: "rateComparator",
    subtitleKey: "rateComparatorSubtitle",
    icon: BarChart3,
    borderColor: "border-l-emerald-500",
    iconColor: "text-emerald-500",
    iconBg: "bg-emerald-500/10",
    iconHoverBg: "group-hover:bg-emerald-500/20",
    shadowColor: "hover:shadow-emerald-500/5",
    featureFlag: "rates",
  },
  {
    href: "/conversor-monedas",
    titleKey: "exchangeRateComparator",
    subtitleKey: "exchangeRateComparatorSubtitle",
    icon: ArrowLeftRight,
    borderColor: "border-l-blue-500",
    iconColor: "text-blue-500",
    iconBg: "bg-blue-500/10",
    iconHoverBg: "group-hover:bg-blue-500/20",
    shadowColor: "hover:shadow-blue-500/5",
  },
  {
    href: "/calculadora-interes-compuesto",
    titleKey: "compoundInterestCalculator",
    subtitleKey: "compoundInterestSubtitle",
    icon: TrendingUp,
    borderColor: "border-l-violet-500",
    iconColor: "text-violet-500",
    iconBg: "bg-violet-500/10",
    iconHoverBg: "group-hover:bg-violet-500/20",
    shadowColor: "hover:shadow-violet-500/5",
  },
  {
    href: "/calculadora-cuotas-contado",
    titleKey: "installmentsVsCashCalculator",
    subtitleKey: "installmentsVsCashSubtitle",
    icon: CreditCard,
    borderColor: "border-l-orange-500",
    iconColor: "text-orange-500",
    iconBg: "bg-orange-500/10",
    iconHoverBg: "group-hover:bg-orange-500/20",
    shadowColor: "hover:shadow-orange-500/5",
    countryOnly: "ar",
  },
];

function ToolCard({ config }: { config: ToolCardConfig }) {
  const { translate } = useTranslation();
  const Icon = config.icon;

  return (
    <Link href={config.href}>
      <Card
        className={`group cursor-pointer border-l-[3px] ${config.borderColor} hover:shadow-lg ${config.shadowColor ?? ""} transition-all duration-300 h-[140px]`}
      >
        <CardContent className="pt-6 h-full flex items-center">
          <div className="flex items-center justify-between w-full gap-4">
            <div className="flex-1 min-w-0">
              <p className="font-medium">{translate(config.titleKey)}</p>
              <p className="text-sm text-muted-foreground">{translate(config.subtitleKey)}</p>
            </div>
            <div
              className={`flex items-center justify-center w-12 h-12 rounded-full ${config.iconBg} ${config.iconHoverBg} transition-colors shrink-0`}
            >
              <Icon className={`h-6 w-6 ${config.iconColor}`} />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function PremiumUpsellCard() {
  const { translate } = useTranslation();

  return (
    <Link href="/planes">
      <Card className="group cursor-pointer border-2 border-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 hover:shadow-xl hover:shadow-yellow-400/20 transition-all duration-300 h-[140px] relative overflow-hidden">
        <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full">
          {translate("popular")}
        </div>
        <CardContent className="pt-6 h-full flex items-center">
          <div className="flex items-center justify-between w-full gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Crown className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
                <p className="font-bold text-yellow-900 dark:text-yellow-100">
                  {translate("upgradeToPremium")}
                </p>
              </div>
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                {translate("premiumFeatures")}
              </p>
            </div>
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-yellow-500/20 group-hover:bg-yellow-500/30 transition-colors shrink-0">
              <Sparkles className="h-6 w-6 text-yellow-600 dark:text-yellow-500" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export function ToolsGrid() {
  const { translate } = useTranslation();
  const selectedCountry = useAppStore((state) => state.selectedCountry);
  const { subscription } = useAuthStore();
  const countryConfig = getCountryConfig(selectedCountry);

  const visibleTools = TOOL_CARDS.filter((card) => {
    if (card.countryOnly && card.countryOnly !== selectedCountry) return false;
    return !(
      card.featureFlag &&
      !countryConfig.features[card.featureFlag as keyof typeof countryConfig.features]
    );
  });

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">{translate("tools")}</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {visibleTools.map((config) => (
          <ToolCard key={config.href} config={config} />
        ))}
        {(!subscription || subscription.plan === "FREE") && <PremiumUpsellCard />}
      </div>
      <GoogleAd
        adSlot="1234567890"
        adFormat="auto"
        className="mt-8"
        style={{ minHeight: "100px" }}
      />
    </div>
  );
}
