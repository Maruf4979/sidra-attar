"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useCart } from "../context/CartContext";

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice, clearCart } = useCart();
  const { data: session, status } = useSession();
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [stripeLoading, setStripeLoading] = useState(false);
  const [codLoading, setCodLoading] = useState(false);

  const shipping = totalPrice >= 999 ? 0 : 99;
  const grandTotal = totalPrice + shipping;

  const handleStripeCheckout = async () => {
    if (!session) {
      window.location.href = "/auth/signin";
      return;
    }

    setStripeLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          })),
        }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Failed to create checkout session");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setStripeLoading(false);
    }
  };

  const handlePlaceOrder = () => {
    if (paymentMethod === "card") {
      handleStripeCheckout();
    } else {
      // COD or UPI - simplified flow
      setCodLoading(true);
      setTimeout(() => {
        clearCart();
        setCodLoading(false);
        alert("Order placed successfully! Thank you for choosing Sidra Attar Wala.");
      }, 1000);
    }
  };

  return (
    <>
      <div className="page-header">
        <h1>Checkout</h1>
        <p>Complete your order and experience artisanal luxury.</p>
      </div>

      {items.length === 0 ? (
        <div className="section text-center" style={{ paddingTop: "4rem", paddingBottom: "4rem" }}>
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="var(--outline-variant)" strokeWidth="1" style={{ margin: "0 auto 1.5rem" }}>
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
          <h2 style={{ fontFamily: "var(--font-headline)", marginBottom: "0.5rem" }}>
            Your Cart is Empty
          </h2>
          <p style={{ color: "var(--outline)", marginBottom: "2rem" }}>
            Add some luxury fragrances to your collection.
          </p>
          <Link href="/collections" className="btn-primary">
            Browse Collections
          </Link>
        </div>
      ) : (
        <div className="checkout-layout">
          {/* Checkout Form */}
          <div className="checkout-form">
            {/* Sign-in prompt if not authenticated */}
            {status !== "authenticated" && (
              <div className="checkout-section" style={{
                background: "var(--surface-container-low)",
                borderRadius: "var(--radius-lg)",
                padding: "1.25rem",
                marginBottom: "1.5rem",
                display: "flex",
                alignItems: "center",
                gap: "1rem",
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.5">
                  <circle cx="12" cy="8" r="5" />
                  <path d="M20 21a8 8 0 1 0-16 0" />
                </svg>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: "0.9rem", fontWeight: 600 }}>Sign in for faster checkout</p>
                  <p style={{ fontSize: "0.8rem", color: "var(--outline)" }}>
                    Save your address and track your orders
                  </p>
                </div>
                <Link href="/auth/signin" className="btn-primary" style={{ padding: "0.5rem 1.25rem", fontSize: "0.8rem" }}>
                  Sign In
                </Link>
              </div>
            )}

            <div className="checkout-section">
              <h3>Shipping Information</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>First Name</label>
                  <input type="text" placeholder="Enter first name" defaultValue={session?.user?.name?.split(" ")[0] || ""} />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input type="text" placeholder="Enter last name" defaultValue={session?.user?.name?.split(" ").slice(1).join(" ") || ""} />
                </div>
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" placeholder="your@email.com" defaultValue={session?.user?.email || ""} />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input type="tel" placeholder="+91 XXXXX XXXXX" />
              </div>
              <div className="form-group">
                <label>Street Address</label>
                <input type="text" placeholder="123 Main Street" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>City</label>
                  <input type="text" placeholder="City" />
                </div>
                <div className="form-group">
                  <label>PIN Code</label>
                  <input type="text" placeholder="000000" />
                </div>
              </div>
              <div className="form-group">
                <label>State</label>
                <input type="text" placeholder="State" />
              </div>
            </div>

            <div className="checkout-section">
              <h3>Payment Method</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <label style={{
                  display: "flex", alignItems: "center", gap: "0.75rem",
                  padding: "1rem", background: paymentMethod === "cod" ? "var(--surface-container)" : "var(--surface-container-low)",
                  borderRadius: "var(--radius-md)", cursor: "pointer",
                  fontSize: "0.9rem", fontWeight: 500,
                  border: paymentMethod === "cod" ? "1px solid var(--primary)" : "1px solid transparent",
                  transition: "all 0.2s ease",
                }}>
                  <input type="radio" name="payment" value="cod" checked={paymentMethod === "cod"} onChange={() => setPaymentMethod("cod")} />
                  Cash on Delivery (COD)
                </label>
                <label style={{
                  display: "flex", alignItems: "center", gap: "0.75rem",
                  padding: "1rem", background: paymentMethod === "upi" ? "var(--surface-container)" : "var(--surface-container-low)",
                  borderRadius: "var(--radius-md)", cursor: "pointer",
                  fontSize: "0.9rem", fontWeight: 500,
                  border: paymentMethod === "upi" ? "1px solid var(--primary)" : "1px solid transparent",
                  transition: "all 0.2s ease",
                }}>
                  <input type="radio" name="payment" value="upi" checked={paymentMethod === "upi"} onChange={() => setPaymentMethod("upi")} />
                  UPI Payment
                </label>
                <label style={{
                  display: "flex", alignItems: "center", gap: "0.75rem",
                  padding: "1rem", background: paymentMethod === "card" ? "var(--surface-container)" : "var(--surface-container-low)",
                  borderRadius: "var(--radius-md)", cursor: "pointer",
                  fontSize: "0.9rem", fontWeight: 500,
                  border: paymentMethod === "card" ? "1px solid var(--primary)" : "1px solid transparent",
                  transition: "all 0.2s ease",
                }}>
                  <input type="radio" name="payment" value="card" checked={paymentMethod === "card"} onChange={() => setPaymentMethod("card")} />
                  <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    Credit / Debit Card
                    <svg width="20" height="14" viewBox="0 0 32 22" fill="none" style={{ opacity: 0.7 }}>
                      <rect width="32" height="22" rx="3" fill="#635BFF"/>
                      <path d="M13.3 14.4h-2l1.2-7.4h2l-1.2 7.4zm8.4-7.2c-.4-.1-1-.3-1.8-.3-2 0-3.4 1-3.4 2.5 0 1.1 1 1.7 1.8 2 .8.4 1 .6 1 1 0 .5-.6.8-1.2.8-.8 0-1.2-.1-1.9-.4l-.3-.1-.3 1.7c.5.2 1.3.4 2.2.4 2.1 0 3.5-1 3.5-2.6 0-.9-.5-1.5-1.7-2.1-.7-.3-1.2-.6-1.2-1 0-.3.4-.7 1.2-.7.7 0 1.2.1 1.6.3l.2.1.3-1.6z" fill="#fff"/>
                    </svg>
                  </span>
                </label>
              </div>

              {paymentMethod === "card" && (
                <p style={{
                  marginTop: "0.75rem",
                  fontSize: "0.8rem",
                  color: "var(--outline)",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  Secure payment powered by Stripe
                </p>
              )}
            </div>

            <button
              className="btn-primary w-full"
              onClick={handlePlaceOrder}
              disabled={stripeLoading || codLoading}
              style={{ position: "relative" }}
            >
              {stripeLoading || codLoading ? (
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                  <span className="spinner" />
                  Processing...
                </span>
              ) : paymentMethod === "card" ? (
                `Pay with Card · ₹${grandTotal.toLocaleString("en-IN")}`
              ) : (
                `Place Order · ₹${grandTotal.toLocaleString("en-IN")}`
              )}
            </button>
          </div>

          {/* Order Summary */}
          <div className="order-summary">
            <div className="order-summary-card">
              <h3>Order Summary</h3>

              {items.map((item) => (
                <div key={item.id} className="order-item">
                  <div
                    className="order-item-swatch"
                    style={{ background: item.gradient }}
                  />
                  <div className="order-item-details">
                    <h4>{item.name}</h4>
                    <p>Qty: {item.quantity}</p>
                  </div>
                  <div className="order-item-price">
                    ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                  </div>
                </div>
              ))}

              <div className="order-totals">
                <div className="order-total-row">
                  <span>Subtotal</span>
                  <span>₹{totalPrice.toLocaleString("en-IN")}</span>
                </div>
                <div className="order-total-row">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? "Free" : `₹${shipping}`}</span>
                </div>
                <div className="order-total-row grand">
                  <span>Total</span>
                  <span>₹{grandTotal.toLocaleString("en-IN")}</span>
                </div>
              </div>

              {shipping === 0 && (
                <p style={{
                  marginTop: "1rem", fontSize: "0.75rem",
                  color: "#2e7d32", textAlign: "center"
                }}>
                  ✓ You qualify for free shipping!
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
