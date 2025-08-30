import { toast as sonnerToast } from "sonner";

interface ToastOptions {
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const toast = {
  success: (message: string, options?: ToastOptions) => {
    return sonnerToast.success(message, {
      description: options?.description,
      duration: options?.duration || 4000,
      action: options?.action,
      style: {
        "--normal-bg": "var(--success)",
        "--normal-text": "var(--success-foreground)",
        "--normal-border": "var(--success-foreground)",
      } as React.CSSProperties,
    });
  },

  error: (message: string, options?: ToastOptions) => {
    return sonnerToast.error(message, {
      description: options?.description,
      duration: options?.duration || 4000,
      action: options?.action,
      style: {
        "--normal-bg": "var(--destructive)",
        "--normal-text": "var(--destructive-foreground)",
        "--normal-border": "var(--destructive-foreground)",
      } as React.CSSProperties,
    });
  },

  warning: (message: string, options?: ToastOptions) => {
    return sonnerToast.warning(message, {
      description: options?.description,
      duration: options?.duration || 4000,
      action: options?.action,
      style: {
        "--normal-bg": "var(--warning)",
        "--normal-text": "var(--warning-foreground)",
        "--normal-border": "var(--warning-foreground)",
      } as React.CSSProperties,
    });
  },

  info: (message: string, options?: ToastOptions) => {
    return sonnerToast.info(message, {
      description: options?.description,
      duration: options?.duration || 4000,
      action: options?.action,
      style: {
        "--normal-bg": "var(--info)",
        "--normal-text": "var(--info-foreground)",
        "--normal-border": "var(--info-foreground)",
      } as React.CSSProperties,
    });
  },

  default: (message: string, options?: ToastOptions) => {
    return sonnerToast(message, {
      description: options?.description,
      duration: options?.duration || 4000,
      action: options?.action,
      style: {
        "--normal-bg": "var(--popover)",
        "--normal-text": "var(--popover-foreground)",
        "--normal-border": "var(--border)",
      } as React.CSSProperties,
    });
  },
};
