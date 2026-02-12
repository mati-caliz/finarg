"use client";

import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";
import { ArrowLeftRight } from "lucide-react";
import { memo } from "react";

interface SwapButtonProps {
  onClick: () => void;
}

export const SwapButton = memo(({ onClick }: SwapButtonProps) => {
  const { translate } = useTranslation();

  return (
    <div className="flex items-center justify-center">
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={onClick}
        className="rounded-full transition-all duration-300 hover:rotate-180 hover:bg-primary hover:text-primary-foreground"
        title={translate("swapCurrencies")}
      >
        <ArrowLeftRight className="h-4 w-4" />
      </Button>
    </div>
  );
});

SwapButton.displayName = "SwapButton";
