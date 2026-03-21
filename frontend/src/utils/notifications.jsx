import toast from 'react-hot-toast';
import { AlertCircle } from 'lucide-react';

/**
 * Custom Confirmation Toast
 * @param {string} message - The message to display
 * @param {function} onConfirm - Callback when user clicks Confirm
 */
export const confirmAction = (message, onConfirm) => {
  toast((t) => (
    <div className="flex flex-col gap-3 p-1">
      <div className="flex items-center gap-2 text-amber-600">
        <AlertCircle size={20} />
        <p className="font-bold text-slate-800 text-sm tracking-tight">{message}</p>
      </div>
      <p className="text-xs text-slate-500 font-medium leading-relaxed pl-7">
        Please confirm if you want to proceed. This action may be permanent.
      </p>
      <div className="flex gap-2 justify-end mt-2">
        <button
          onClick={() => toast.dismiss(t.id)}
          className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-all active:scale-95"
        >
          Cancel
        </button>
        <button
          onClick={() => {
            toast.dismiss(t.id);
            onConfirm();
          }}
          className="px-4 py-2 text-xs font-black bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-xl shadow-lg shadow-orange-200 hover:shadow-orange-300 transition-all active:scale-95 uppercase tracking-wider"
        >
          Confirm
        </button>
      </div>
    </div>
  ), {
    duration: 3500,
    style: {
      minWidth: '320px',
      padding: '16px',
      borderRadius: '24px',
      background: 'rgba(255, 255, 255, 0.98)',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    }
  });
};
