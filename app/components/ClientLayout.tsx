"use client";
import { Suspense } from "react";

import Header from "./Header";
import Footer from "./Footer";
import CartDrawer from "./CartDrawer";
import AuthProvider from "./AuthProvider";
import { CartProvider } from "../context/CartContext";
import { ThemeProvider } from "../context/ThemeContext";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ThemeProvider>
        <CartProvider>
          <Suspense fallback={<div className="site-header" style={{ height: '110px' }} />}>
            <Header />
          </Suspense>
          <CartDrawer />
          <main style={{ flex: 1 }}>{children}</main>
          <Footer />
        </CartProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
