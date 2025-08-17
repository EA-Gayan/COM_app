"use client";

import { SnackbarProvider } from "notistack";

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SnackbarProvider maxSnack={3} autoHideDuration={3000}>
      {children}
    </SnackbarProvider>
  );
}
