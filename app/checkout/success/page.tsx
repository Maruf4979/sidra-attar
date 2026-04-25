"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function CheckoutSuccessPage() {
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSessionId(params.get("session_id"));
  }, []);

  return (
    <>
      <div className="page-header">
        <h1>Order Confirmed!</h1>
        <p>Thank you for choosing Sidra Attar Wala</p>
      </div>

      <div className="section text-center" style={{ paddingTop: "3rem", paddingBottom: "4rem" }}>
        <div style={{
          width: "80px",
          height: "80px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #2e7d32, #4caf50)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 1.5rem",
          animation: "fadeInScale 0.5s ease-out",
        }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <h2 style={{ fontFamily: "var(--font-headline)", marginBottom: "0.75rem", fontSize: "1.75rem" }}>
          Payment Successful
        </h2>
        <p style={{ color: "var(--outline)", marginBottom: "0.5rem", maxWidth: "500px", margin: "0 auto 1.5rem" }}>
          Your order has been placed and payment has been received. We&apos;ll send you an email confirmation shortly with tracking details.
        </p>

        {sessionId && (
          <p style={{
            fontSize: "0.8rem",
            color: "var(--outline-variant)",
            fontFamily: "monospace",
            marginBottom: "2rem",
            wordBreak: "break-all",
          }}>
            Transaction ID: {sessionId}
          </p>
        )}

        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/account" className="btn-primary">
            View My Orders
          </Link>
          <Link href="/collections" className="btn-primary" style={{
            background: "transparent",
            border: "1px solid var(--outline-variant)",
            color: "var(--on-surface)",
          }}>
            Continue Shopping
          </Link>
        </div>
      </div>
    </>
  );
}
