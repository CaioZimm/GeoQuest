"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";

export default function ClientProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <Toaster position="top-right" toastOptions={{
        style: {
          background: '#0a150f',
          color: '#fff',
          border: '1px solid rgba(16, 185, 129, 0.2)',
        },
      }} />
    </SessionProvider>
  );
}