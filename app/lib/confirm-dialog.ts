/**
 * Confirm Dialog System
 * Promise-based confirmation dialogs integrated with toast system
 */

export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

export interface ConfirmDialog extends ConfirmOptions {
  id: string;
  resolve: (value: boolean) => void;
}

type ConfirmListener = (dialog: ConfirmDialog | null) => void;

class ConfirmManager {
  private listeners: ConfirmListener[] = [];
  private currentDialog: ConfirmDialog | null = null;

  subscribe(listener: ConfirmListener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify(dialog: ConfirmDialog | null) {
    this.listeners.forEach(listener => listener(dialog));
  }

  show(options: ConfirmOptions): Promise<boolean> {
    return new Promise((resolve) => {
      const dialog: ConfirmDialog = {
        id: Math.random().toString(36).substr(2, 9),
        title: options.title,
        message: options.message,
        confirmText: options.confirmText || 'Onayla',
        cancelText: options.cancelText || 'İptal',
        type: options.type || 'danger',
        resolve: (value: boolean) => {
          this.currentDialog = null;
          this.notify(null);
          resolve(value);
        }
      };

      this.currentDialog = dialog;
      this.notify(dialog);
    });
  }

  // Shorthand methods
  danger(message: string, title = 'Onay Gerekli'): Promise<boolean> {
    return this.show({ title, message, type: 'danger' });
  }

  warning(message: string, title = 'Uyarı'): Promise<boolean> {
    return this.show({ title, message, type: 'warning' });
  }

  info(message: string, title = 'Bilgi'): Promise<boolean> {
    return this.show({ title, message, type: 'info' });
  }
}

export const confirmDialog = new ConfirmManager();
