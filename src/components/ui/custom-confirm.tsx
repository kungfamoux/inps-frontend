import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { AlertTriangle, Info, Trash2 } from "lucide-react";

export type ConfirmType = "danger" | "warning" | "info";

interface CustomConfirmProps {
  isOpen: boolean;
  onClose: (result: boolean) => void;
  title?: string;
  message: string;
  type?: ConfirmType;
  confirmText?: string;
  cancelText?: string;
}

const confirmConfig = {
  danger: {
    icon: Trash2,
    iconColor: "text-destructive",
    variant: "destructive" as const,
    defaultTitle: "Confirm Deletion",
    confirmText: "Delete",
    confirmVariant: "destructive" as const,
  },
  warning: {
    icon: AlertTriangle,
    iconColor: "text-yellow-600",
    variant: "default" as const,
    defaultTitle: "Confirm Action",
    confirmText: "Confirm",
    confirmVariant: "default" as const,
  },
  info: {
    icon: Info,
    iconColor: "text-blue-600",
    variant: "default" as const,
    defaultTitle: "Confirm Action",
    confirmText: "Confirm",
    confirmVariant: "default" as const,
  },
};

export function CustomConfirm({
  isOpen,
  onClose,
  title,
  message,
  type = "warning",
  confirmText,
  cancelText = "Cancel",
}: CustomConfirmProps) {
  const config = confirmConfig[type];
  const Icon = config.icon;
  const displayTitle = title || config.defaultTitle;
  const displayConfirmText = confirmText || config.confirmText;

  const handleConfirm = () => {
    onClose(true);
  };

  const handleCancel = () => {
    onClose(false);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose(false)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <Icon className={`h-5 w-5 ${config.iconColor}`} />
            <AlertDialogTitle>{displayTitle}</AlertDialogTitle>
          </div>
          <AlertDialogDescription>{message}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>{cancelText}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            variant={config.confirmVariant}
          >
            {displayConfirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}