import React, { useEffect } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);
        return () => clearTimeout(timer);
    }, [onClose, duration]);

    const icons = {
        success: <CheckCircle className="h-5 w-5 text-green-500" />,
        error: <XCircle className="h-5 w-5 text-red-500" />,
        info: <Info className="h-5 w-5 text-blue-500" />,
    };

    const styles = {
        success: 'border-green-100 bg-green-50 text-green-800',
        error: 'border-red-100 bg-red-50 text-red-800',
        info: 'border-blue-100 bg-blue-50 text-blue-800',
    };

    return (
        <div className={`relative flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-xl animate-in slide-in-from-right-10 duration-300 ${styles[type]}`}>
            {icons[type]}
            <p className="text-sm font-bold">{message}</p>
            <button onClick={onClose} className="ml-2 p-1 hover:bg-black/5 rounded-full transition-colors">
                <X className="h-4 w-4" />
            </button>
        </div>
    );
};

export default Toast;
