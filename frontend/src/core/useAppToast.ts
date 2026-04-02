import { useContext, createContext } from "react";

export interface ToastContextType {
    showSuccess: (summary: string, detail?: string) => void;
    showError: (summary: string, detail?: string) => void;
    showInfo: (summary: string, detail?: string) => void;
    showWarn: (summary: string, detail?: string) => void;
}

export const ToastContext = createContext<ToastContextType | undefined>(
    undefined,
);

export const useAppToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useAppToast deve ser usado dentro de um ToastProvider");
    }
    return context;
};