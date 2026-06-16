import type { Metadata } from "next";
import { CartProvider } from "../context/CartContext";
import "./globals.css";
import Script from "next/script";
import { initApp } from "./lib/startup";
import { Toaster } from "react-hot-toast";


export const metadata: Metadata = {
  title: "User App",
  description: "",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  initApp();
  return (
    <html lang="en">
      <body>
        {/* Razorpay script */}
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="beforeInteractive"
        />

        <CartProvider>
          <main>{children}</main>
        </CartProvider>
        <Toaster
          position="top-center"
          reverseOrder={false}
          toastOptions={{
            duration: 3000,
            success: {
              style: {
                background: "#111827",
                color: "#fff",
              },
            },
            error: {
              style: {
                background: "#dc2626",
                color: "#fff",
              },
            },
          }}
        />
      </body>
    </html>
  );
}
