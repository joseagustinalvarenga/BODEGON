import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "Club del Bodegón",
  description: "Programa de fidelidad - Gana puntos y accede a recompensas exclusivas",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "#0e1a10",
                color: "#e8f5ea",
                border: "1px solid rgba(19,236,55,0.2)",
                borderRadius: "12px",
                fontSize: "13px",
              },
              success: {
                iconTheme: { primary: "#13ec37", secondary: "#000" },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
