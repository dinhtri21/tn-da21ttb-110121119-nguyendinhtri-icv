"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ReactNode } from "react";
const queryClient = new QueryClient({
  defaultOptions: {
    mutations: {
      onSuccess: () => {
        queryClient.invalidateQueries();
      },
    },
  },
});
export default function MyReactQueryProvider({ children }: { children?: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools buttonPosition={"bottom-left"} initialIsOpen={false} />
    </QueryClientProvider>
  );
}
