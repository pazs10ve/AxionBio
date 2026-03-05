'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function QueryProvider({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        // Don't refetch on window focus in dev — less noise
                        refetchOnWindowFocus: false,
                        // Retry once on failure, then show error
                        retry: 1,
                        // Data stays fresh for 30 seconds before background refetch
                        staleTime: 30_000,
                    },
                },
            })
    );

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}
