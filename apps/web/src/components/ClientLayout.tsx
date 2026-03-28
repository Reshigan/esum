"use client";

import { AuthProvider } from "./AuthProvider";
import { ToastProvider } from "./ToastProvider";
import { ReactNode } from "react";

export function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ToastProvider>{children}</ToastProvider>
    </AuthProvider>
  );
}
