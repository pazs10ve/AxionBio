'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

// ── Types ─────────────────────────────────────────────────────────────────────

export type LogEntry = {
    id: number;
    line: string;
    level: string;
    ts: string;
};

type StreamEvent =
    | { type: 'log'; id: number; line: string; level: string; ts: string }
    | { type: 'progress'; pct: number; step: string }
    | { type: 'done'; status: string };

// ── Hook ──────────────────────────────────────────────────────────────────────

/**
 * Connects to the SSE endpoint for a running job and returns live log lines,
 * progress percentage, current step, and terminal status.
 *
 * Replaces the old `useJobPoller` which used fake in-memory state transitions.
 */
export function useJobStream(jobId: string | null) {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [progress, setProgress] = useState(0);
    const [step, setStep] = useState('');
    const [status, setStatus] = useState<string | null>(null);
    const [done, setDone] = useState(false);
    const esRef = useRef<EventSource | null>(null);

    const reset = useCallback(() => {
        setLogs([]);
        setProgress(0);
        setStep('');
        setStatus(null);
        setDone(false);
    }, []);

    useEffect(() => {
        if (!jobId) return;

        // Reset state when jobId changes
        reset();

        const es = new EventSource(`/api/jobs/${jobId}/logs`);
        esRef.current = es;

        es.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data) as StreamEvent;

                if (data.type === 'log') {
                    setLogs((prev) => [...prev, {
                        id: data.id,
                        line: data.line,
                        level: data.level,
                        ts: data.ts,
                    }]);
                } else if (data.type === 'progress') {
                    setProgress(data.pct);
                    setStep(data.step);
                } else if (data.type === 'done') {
                    setStatus(data.status);
                    setDone(true);
                    es.close();
                }
            } catch {
                // Ignore malformed events
            }
        };

        es.onerror = () => {
            // EventSource will auto-reconnect on transient errors.
            // If the stream is closed by the server, it won't reconnect.
        };

        return () => {
            es.close();
            esRef.current = null;
        };
    }, [jobId, reset]);

    return { logs, progress, step, status, done, reset };
}
