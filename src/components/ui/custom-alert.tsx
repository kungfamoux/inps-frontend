import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { AlertCircle, AlertTriangle, Info } from "lucide-react";

export type AlertType = "error" | "warning" | "info";

interface CustomAlertProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  type?: AlertType;
}

const alertConfig = {
  error: {
    icon: AlertCircle,
    iconColor: "text-destructive",
    variant: "destructive" as const,
    defaultTitle: "Error",
  },
  warning: {
    icon: AlertTriangle,
    iconColor: "text-yellow-600",
    variant: "default" as const,
    defaultTitle: "Warning",
  },
  info: {
    icon: Info,
    iconColor: "text-blue-600",
    variant: "default" as const,
    defaultTitle: "Information",
  },
};

export function CustomAlert({
  isOpen,
  onClose,
  title,
  message,
  type = "info",
}: CustomAlertProps) {
  const config = alertConfig[type];
  const Icon = config.icon;
  const displayTitle = title || config.defaultTitle;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <Icon className={`h-5 w-5 ${config.iconColor}`} />
            <AlertDialogTitle>{displayTitle}</AlertDialogTitle>
          </div>
          <AlertDialogDescription>{message}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={onClose}>OK</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}