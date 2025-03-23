"use client";

import * as React from "react";
import { Loader2, LucideProps } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps extends LucideProps {
  className?: string;
}

const LoadingSpinner = React.forwardRef<SVGSVGElement, LoadingSpinnerProps>(
  ({ className, ...props }, ref) => {
    return (
      <Loader2 ref={ref} className={cn("animate-spin", className)} {...props} />
    );
  }
);

LoadingSpinner.displayName = "LoadingSpinner";

export { LoadingSpinner };
