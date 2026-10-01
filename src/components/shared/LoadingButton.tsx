import { forwardRef } from "react";
import { Loader2 } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";

interface LoadingButtonProps extends Omit<ButtonProps, "asChild"> {
  loading: boolean;
  loadingText?: string;
}

export const LoadingButton = forwardRef<HTMLButtonElement, LoadingButtonProps>(
  (
    {
      loading,
      loadingText = "Please wait...",
      disabled,
      children,
      type = "button",
      ...props
    },
    ref,
  ) => (
    <Button
      {...props}
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading}
    >
      {loading ? (
        <>
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          {loadingText}
        </>
      ) : (
        children
      )}
    </Button>
  ),
);

LoadingButton.displayName = "LoadingButton";