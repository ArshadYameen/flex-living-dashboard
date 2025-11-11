// web/components/providers.tsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

// Create a client
const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    // Provide the client to our App
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}