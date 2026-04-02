import React, { useRef } from 'react';
import { Toast } from 'primereact/toast';
import { ToastContext } from '../useAppToast';

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const toast = useRef<Toast>(null);

    const show = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail?: string) => {
        toast.current?.show({ severity, summary, detail, life: 3000 });
    };

    const value = {
        showSuccess: (s: string, d?: string) => show('success', s, d),
        showError: (s: string, d?: string) => show('error', s, d),
        showInfo: (s: string, d?: string) => show('info', s, d),
        showWarn: (s: string, d?: string) => show('warn', s, d),
    };

    return (
        <ToastContext.Provider value={value}>
            <Toast ref={toast} />
            {children}
        </ToastContext.Provider>
    );
};