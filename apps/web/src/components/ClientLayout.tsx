"use client";

import { AuthProvider } from "./AuthProvider";
import { ReactNode } from "react";

export function ClientLayout({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
