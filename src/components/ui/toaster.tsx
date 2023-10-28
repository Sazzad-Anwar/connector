import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { AlertTriangle, Ban, CheckCircle2, Info } from "lucide-react";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && (
                <ToastTitle
                  className={cn(
                    props.variant === "success"
                      ? "text-green-500"
                      : props.variant === "error"
                        ? "text-destructive"
                        : props.variant === "warning"
                          ? "text-orange-500"
                          : "",
                    "flex items-start text-base",
                  )}
                >
                  {props.variant === "success" ? (
                    <CheckCircle2 size={22} className="mr-2 min-w-fit" />
                  ) : props.variant === "error" ? (
                    <Ban size={22} className="mr-2" />
                  ) : props.variant === "warning" ? (
                    <AlertTriangle size={22} className="mr-2 min-w-fit" />
                  ) : (
                    <Info size={22} className="mr-2 min-w-fit" />
                  )}
                  {title}
                </ToastTitle>
              )}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
