"use client";

import { Card } from "@/components/ui/card";
import { useTranslation } from "@/hooks/useTranslation";
import type { TranslationKey } from "@/i18n/translations";
import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react";
import { useState } from "react";

interface FaqAccordionProps {
  items: Array<{ questionKey: TranslationKey; answerKey: TranslationKey }>;
}

export function FaqAccordion({ items }: FaqAccordionProps) {
  const { translate } = useTranslation();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {items.map((item, index) => (
        <Card key={item.questionKey} className="bg-muted/30 border-muted overflow-hidden">
          <button
            type="button"
            onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
            className="w-full flex items-center justify-between gap-2 p-3 text-left hover:bg-muted/50 transition-colors"
          >
            <span className="flex items-center gap-2 text-sm font-medium text-foreground text-left">
              <HelpCircle className="h-4 w-4 text-primary shrink-0" />
              {translate(item.questionKey)}
            </span>
            {openFaqIndex === index ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
            )}
          </button>
          {openFaqIndex === index && (
            <div className="px-3 pb-3 pt-0 border-t border-border/50">
              <p className="text-xs text-muted-foreground leading-5">{translate(item.answerKey)}</p>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}
