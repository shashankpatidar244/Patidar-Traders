import type { Metadata } from "next";
import { CartProvider } from "../context/CartContext";
import "./globals.css";
import Script from "next/script"; 
import { initApp } from "./lib/startup";

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
      </body>
    </html>
  );
}