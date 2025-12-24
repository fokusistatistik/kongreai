/**
 * Toast Notification System
 * Simple, lightweight toast notifications for user feedback
 */

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

type ToastListener = (toast: Toast) => void;

class ToastManager {
  private listeners: ToastListener[] = [];

  subscribe(listener: ToastListener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify(toast: Toast) {
    this.listeners.forEach(listener => listener(toast));
  }

  success(message: string, duration = 3000) {
    this.notify({
      id: Math.random().toString(36).substr(2, 9),
      type: 'success',
      message,
      duration,
    });
  }

  error(message: string, duration = 4000) {
    this.notify({
      id: Math.random().toString(36).substr(2, 9),
      type: 'error',
      message,
      duration,
    });
  }

  warning(message: string, duration = 3500) {
    this.notify({
      id: Math.random().toString(36).substr(2, 9),
      type: 'warning',
      message,
      duration,
    });
  }

  info(message: string, duration = 3000) {
    this.notify({
      id: Math.random().toString(36).substr(2, 9),
      type: 'info',
      message,
      duration,
    });
  }
}

export const toast = new ToastManager();
