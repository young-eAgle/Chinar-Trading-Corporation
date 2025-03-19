import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Disable refetch on window focus
      retry: 1, // Only retry failed requests once
      staleTime: 5 * 60 * 1000, // Consider data stale after 5 minutes
    },
  },
}); 