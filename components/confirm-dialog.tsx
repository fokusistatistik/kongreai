'use client';

import { useEffect, useState } from 'react';
import { confirmDialog, ConfirmDialog } from '@/app/lib/confirm-dialog';
import { AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export function ConfirmDialogContainer() {
  const [dialog, setDialog] = useState<ConfirmDialog | null>(null);

  useEffect(() => {
    const unsubscribe = confirmDialog.subscribe((newDialog) => {
      setDialog(newDialog);
    });

    return unsubscribe;
  }, []);

  if (!dialog) return null;

  const handleConfirm = () => {
    dialog.resolve(true);
  };

  const handleCancel = () => {
    dialog.resolve(false);
  };

  const getIcon = () => {
    switch (dialog.type) {
      case 'danger':
        return <AlertTriangle className="w-6 h-6 text-red-600" />;
      case 'warning':
        return <AlertCircle className="w-6 h-6 text-yellow-600" />;
      case 'info':
        return <Info className="w-6 h-6 text-blue-600" />;
    }
  };

  const getButtonStyles = () => {
    switch (dialog.type) {
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 text-white';
      case 'warning':
        return 'bg-yellow-600 hover:bg-yellow-700 text-white';
      case 'info':
        return 'bg-blue-600 hover:bg-blue-700 text-white';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-start justify-between">
          <div className="flex items-start gap-3">
            {getIcon()}
            <div>
              {dialog.title && (
                <h3 className="text-lg font-semibold text-gray-900">{dialog.title}</h3>
              )}
            </div>
          </div>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-gray-700 text-sm leading-relaxed">{dialog.message}</p>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
          >
            {dialog.cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${getButtonStyles()}`}
          >
            {dialog.confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
