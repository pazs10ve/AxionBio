'use client';

import { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Types ──────────────────────────────────────────────────────────────────────

type ToastVariant = 'success' | 'error' | 'info' | 'warning';

type Toast = {
    id: string;
    message: string;
    variant: ToastVariant;
    duration?: number;
};

type ToastContextValue = {
    toast: (message: string, variant?: ToastVariant, duration?: number) => void;
    success: (message: string) => void;
    error: (message: string) => void;
    info: (message: string) => void;
    warning: (message: string) => void;
};

// ── Context ────────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | null>(null);

// ── Toast item config ──────────────────────────────────────────────────────────

const VARIANT_CONFIG: Record<ToastVariant, {
    icon: React.FC<{ className?: string }>;
    bar: string;
    bg: string;
    border: string;
    text: string;
}> = {
    success: { icon: CheckCircle2, bar: 'bg-success', bg: 'bg-white', border: 'border-success/20', text: 'text-success' },
    error: { icon: XCircle, bar: 'bg-error', bg: 'bg-white', border: 'border-error/20', text: 'text-error' },
    info: { icon: Info, bar: 'bg-brand', bg: 'bg-white', border: 'border-brand/20', text: 'text-brand' },
    warning: { icon: AlertTriangle, bar: 'bg-warning', bg: 'bg-white', border: 'border-warning/20', text: 'text-warning' },
};

// ── Single Toast ───────────────────────────────────────────────────────────────

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
    const cfg = VARIANT_CONFIG[toast.variant];
    const Icon = cfg.icon;

    return (
        <div className={cn(
            'flex items-start gap-3 w-80 rounded-xl border shadow-lg overflow-hidden',
            cfg.bg, cfg.border,
            'animate-in slide-in-from-right-4 fade-in duration-300'
        )}>
            {/* Colored left bar */}
            <div className={cn('w-1 self-stretch shrink-0', cfg.bar)} />
            <div className="flex items-start gap-3 flex-1 py-3 pr-3">
                <Icon className={cn('w-4 h-4 mt-0.5 shrink-0', cfg.text)} />
                <p className="text-sm text-slate-700 font-medium flex-1 leading-snug">{toast.message}</p>
                <button
                    onClick={() => onDismiss(toast.id)}
                    className="text-slate-300 hover:text-slate-500 transition-colors shrink-0 mt-0.5"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}

// ── Provider ──────────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const dismiss = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const toast = useCallback((message: string, variant: ToastVariant = 'info', duration = 4000) => {
        const id = crypto.randomUUID();
        setToasts(prev => [...prev, { id, message, variant, duration }]);
        if (duration > 0) {
            setTimeout(() => dismiss(id), duration);
        }
    }, [dismiss]);

    const helpers: ToastContextValue = {
        toast,
        success: (msg) => toast(msg, 'success'),
        error: (msg) => toast(msg, 'error'),
        info: (msg) => toast(msg, 'info'),
        warning: (msg) => toast(msg, 'warning'),
    };

    return (
        <ToastContext.Provider value={helpers}>
            {children}
            {/* Toast viewport */}
            <div className="fixed bottom-5 right-5 z-[200] flex flex-col gap-2 pointer-events-none">
                {toasts.map(t => (
                    <div key={t.id} className="pointer-events-auto">
                        <ToastItem toast={t} onDismiss={dismiss} />
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
    return ctx;
}
