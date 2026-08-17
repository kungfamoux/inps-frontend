import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { toast } from 'sonner';
import { CustomAlert, AlertType } from '@/components/ui/custom-alert';
import { CustomConfirm, ConfirmType } from '@/components/ui/custom-confirm';

interface AlertState {
  isOpen: boolean;
  title?: string;
  message: string;
  type: AlertType;
}

interface ConfirmState {
  isOpen: boolean;
  title?: string;
  message: string;
  type: ConfirmType;
  confirmText?: string;
  cancelText?: string;
  resolve: ((result: boolean) => void) | null;
}

interface AlertContextType {
  showAlert: (message: string, type?: AlertType, title?: string) => void;
  showSuccess: (message: string) => void;
  showConfirm: (
    message: string,
    type?: ConfirmType,
    title?: string,
    confirmText?: string,
    cancelText?: string,
  ) => Promise<boolean>;
  closeAlert: () => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({ children }: { children: ReactNode }) {
  const [alertState, setAlertState] = useState<AlertState>({
    isOpen: false,
    message: '',
    type: 'info',
  });

  const [confirmState, setConfirmState] = useState<ConfirmState>({
    isOpen: false,
    message: '',
    type: 'warning',
    resolve: null,
  });

  const showAlert = useCallback(
    (message: string, type: AlertType = 'info', title?: string) => {
      setAlertState({
        isOpen: true,
        message,
        type,
        title,
      });
    },
    [],
  );

  const showSuccess = useCallback((message: string) => {
    toast.success(message);
  }, []);

  const showConfirm = useCallback(
    (
      message: string,
      type: ConfirmType = 'warning',
      title?: string,
      confirmText?: string,
      cancelText?: string,
    ): Promise<boolean> => {
      return new Promise((resolve) => {
        setConfirmState({
          isOpen: true,
          message,
          type,
          title,
          confirmText,
          cancelText,
          resolve,
        });
      });
    },
    [],
  );

  const closeAlert = useCallback(() => {
    setAlertState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const closeConfirm = useCallback((result: boolean) => {
    setConfirmState((prev) => {
      if (prev.resolve) {
        prev.resolve(result);
      }
      return { ...prev, isOpen: false, resolve: null };
    });
  }, []);

  return (
    <AlertContext.Provider
      value={{ showAlert, showSuccess, showConfirm, closeAlert }}
    >
      {children}
      <CustomAlert
        isOpen={alertState.isOpen}
        onClose={closeAlert}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
      />
      <CustomConfirm
        isOpen={confirmState.isOpen}
        onClose={closeConfirm}
        title={confirmState.title}
        message={confirmState.message}
        type={confirmState.type}
        confirmText={confirmState.confirmText}
        cancelText={confirmState.cancelText}
      />
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
}
