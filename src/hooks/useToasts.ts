// src/components/hooks/useToasts.ts
import { useState, useCallback } from 'react';

export type ToastSeverity = "success" | "info" | "warning" | "error";

export const useToasts = () => {
  const [toast, setToast] = useState({
    message: "",
    visible: false,
    severity: "info" as ToastSeverity,
  });

  const showToast = useCallback((message: string, severity: ToastSeverity = "info") => {
    setToast({ message, visible: true, severity });
  }, []);

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, visible: false }));
  }, []);

  return { toast, showToast, hideToast };
};