"use client";

import { forwardRef } from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/app/(auth)/vertex/components/ui/tooltip";
import { Button, ButtonProps } from "@/app/(auth)/vertex/components/ui/button";
import { cn } from "@/app/(auth)/vertex/lib/utils";

export type TooltipIconButtonProps = ButtonProps & {
  tooltip: string;
  side?: "top" | "bottom" | "left" | "right";
};

export const TooltipIconButton = forwardRef<
  HTMLButtonElement,
  TooltipIconButtonProps
>(({ children, tooltip, side = "bottom", className, ...rest }, ref) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            {...rest}
            className={cn("size-6 p-1", className)}
            ref={ref}
          >
            {children}
            <span className="sr-only">{tooltip}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side={side}>{tooltip}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
});

TooltipIconButton.displayName = "TooltipIconButton";
