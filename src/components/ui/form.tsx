// src/components/ui/form.tsx (if not already exists)
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

export interface FormMessageProps
  extends React.HTMLAttributes<HTMLParagraphElement> {
  asChild?: boolean;
}

const FormMessage = React.forwardRef<HTMLParagraphElement, FormMessageProps>(
  ({ className, children, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "p";
    return (
      <Comp
        ref={ref}
        className={cn("text-sm font-medium text-destructive", className)}
        {...props}
      >
        {children}
      </Comp>
    );
  }
);
FormMessage.displayName = "FormMessage";

export { FormMessage };