'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export type JobStep = 'idle' | 'queued' | 'initializing' | 'running' | 'postprocessing' | 'complete' | 'failed';

const STEPS: JobStep[] = ['queued', 'initializing', 'running', 'postprocessing', 'complete'];

const STEP_DURATIONS: Record<JobStep, number> = {
    idle: 0,
    queued: 800,
    initializing: 1500,
    running: 4000,
    postprocessing: 1800,
    complete: 0,
    failed: 0,
};

export function useJobPoller(onComplete?: () => void) {
    const [step, setStep] = useState<JobStep>('idle');
    const [progress, setProgress] = useState(0); // 0–100, used during 'running'
    const [logLines, setLogLines] = useState<string[]>([]);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

    const addLog = useCallback((line: string) => {
        setLogLines((prev) => [...prev.slice(-29), line]); // keep last 30 lines
    }, []);

    const start = useCallback((mockLogs: string[]) => {
        setStep('queued');
        setProgress(0);
        setLogLines([]);
        let logIndex = 0;

        const advance = (stepIndex: number) => {
            if (stepIndex >= STEPS.length) return;
            const current = STEPS[stepIndex];
            setStep(current);

            if (current === 'running') {
                // Drain mock log lines over the running duration
                const totalDuration = STEP_DURATIONS.running;
                const lineInterval = totalDuration / Math.max(mockLogs.length, 1);
                intervalRef.current = setInterval(() => {
                    if (logIndex < mockLogs.length) {
                        addLog(mockLogs[logIndex++]);
                    }
                    setProgress((p) => Math.min(p + (100 / (totalDuration / lineInterval)), 98));
                }, lineInterval);

                timeoutRef.current = setTimeout(() => {
                    clearInterval(intervalRef.current);
                    setProgress(100);
                    advance(stepIndex + 1);
                }, totalDuration);
            } else if (current === 'complete') {
                onComplete?.();
            } else {
                timeoutRef.current = setTimeout(() => {
                    advance(stepIndex + 1);
                }, STEP_DURATIONS[current]);
            }
        };

        advance(0);
    }, [addLog, onComplete]);

    const reset = useCallback(() => {
        clearTimeout(timeoutRef.current);
        clearInterval(intervalRef.current);
        setStep('idle');
        setProgress(0);
        setLogLines([]);
    }, []);

    useEffect(() => () => {
        clearTimeout(timeoutRef.current);
        clearInterval(intervalRef.current);
    }, []);

    const isRunning = step !== 'idle' && step !== 'complete' && step !== 'failed';
    const isDone = step === 'complete';

    return { step, progress, logLines, start, reset, isRunning, isDone };
}
