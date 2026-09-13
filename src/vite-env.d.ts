/// <reference types="vite/client" />

interface Window {
  uxFocusStorage?: {
    getItem: (key: string) => string | null;
    setItem: (key: string, value: string) => void;
  };
  uxFocusWindow?: {
    minimize: () => Promise<unknown>;
    toggleFullHeight: () => Promise<unknown>;
    close: () => Promise<unknown>;
    showReminder: (reminder: { label?: string; start?: string; atStart?: boolean; kind?: string; title?: string; message?: string; icon?: string }) => Promise<unknown>;
  };
}


