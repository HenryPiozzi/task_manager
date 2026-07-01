import type { Metadata } from "next";
import { TRPCProvider } from "@/trpc/Provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Task Manager",
  description: "Technical challenge — NextJS 15 + tRPC",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <TRPCProvider>
          <div className="page">
            <header className="header">
              <a href="/" className="brand">
                📋 Task Manager
              </a>
            </header>
            <main className="main">{children}</main>
          </div>
        </TRPCProvider>
      </body>
    </html>
  );
}
