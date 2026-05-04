"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (res.ok) {
        router.push("/auth/signin?registered=true");
      } else {
        const data = await res.json();
        setError(data.message || "Registration failed. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-standalone-wrapper">
      {/* Top Left Logo */}
      <div className="auth-header-fixed">
        <Link href="/" className="auth-logo">
          <span className="logo-text">Sidra</span>
          <span className="logo-sub">Attar Wala</span>
        </Link>
      </div>

      <div className="auth-container">
        <div className="auth-card glass-premium">
          <div className="auth-title-area">
            <h1>Create Account</h1>
            <p>Join our fragrant journey</p>
          </div>

          {error && (
            <div className="auth-error-message">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form-refined">
            <div className="auth-input-field">
              <label htmlFor="name">Full Name</label>
              <div className="input-icon-wrapper">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name"
                  required
                />
              </div>
            </div>

            <div className="auth-input-field">
              <label htmlFor="email">Email Address</label>
              <div className="input-icon-wrapper">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  required
                />
              </div>
            </div>

            <div className="auth-input-field">
              <label htmlFor="password">Password</label>
              <div className="input-icon-wrapper">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  minLength={8}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="auth-primary-btn"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Account"}
            </button>
          </form>

          <div className="auth-footer-refined">
            <p>Already have an account? <Link href="/auth/signin">Sign In</Link></p>
          </div>
        </div>
      </div>

      <style jsx>{`
        /* Reusing consistent styles from SignIn */
        .auth-standalone-wrapper {
          min-height: 100vh;
          background: radial-gradient(circle at center, #1a1a2e 0%, #0f0f1a 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          font-family: 'Inter', sans-serif;
          position: relative;
        }
        .auth-header-fixed {
          position: absolute;
          top: 30px;
          left: 30px;
        }
        .auth-container {
          width: 100%;
          max-width: 480px; /* Slightly wider for square look */
          animation: fadeIn 0.6s ease-out;
        }
        .auth-logo {
          text-decoration: none;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }
        .logo-text {
          font-size: 1.8rem; /* Slightly smaller for corner */
          font-weight: 800;
          color: #febd69;
          letter-spacing: -1px;
          line-height: 1;
        }
        .logo-sub {
          font-size: 0.65rem;
          color: #fff;
          text-transform: uppercase;
          letter-spacing: 3px;
          margin-top: 2px;
          opacity: 0.8;
        }
        .glass-premium {
          background: rgba(19, 25, 33, 0.85); /* More solid background */
          backdrop-filter: blur(20px);
          border: 1px solid rgba(254, 189, 105, 0.2);
          border-radius: 20px;
          padding: 50px; /* Increased padding for squareness */
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
          display: flex;
          flex-direction: column;
          aspect-ratio: 1 / 1; /* Force square aspect ratio if content permits */
          justify-content: center;
        }
        @media (max-width: 600px) {
          .glass-premium {
            aspect-ratio: auto; /* Fallback for small screens */
            padding: 30px;
          }
          .auth-header-fixed {
            position: static;
            margin-bottom: 30px;
            text-align: center;
          }
          .auth-logo {
            align-items: center;
          }
        }
        .auth-title-area {
          text-align: center;
          margin-bottom: 30px;
        }
        .auth-title-area h1 {
          color: #fff;
          font-size: 1.8rem;
          font-weight: 700;
          margin-bottom: 8px;
        }
        .auth-title-area p {
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.95rem;
        }
        .auth-error-message {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: #fca5a5;
          padding: 12px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 25px;
          font-size: 0.85rem;
        }
        .auth-input-field {
          margin-bottom: 20px;
        }
        .auth-input-field label {
          display: block;
          color: rgba(255, 255, 255, 0.8);
          font-size: 0.85rem;
          font-weight: 500;
          margin-bottom: 8px;
        }
        .input-icon-wrapper {
          position: relative;
        }
        .input-icon-wrapper svg {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(255, 255, 255, 0.3);
        }
        .input-icon-wrapper input {
          width: 100%;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 12px 12px 12px 42px;
          color: #fff;
          font-size: 0.95rem;
          transition: all 0.2s;
        }
        .input-icon-wrapper input:focus {
          outline: none;
          border-color: #febd69;
          background: rgba(255, 255, 255, 0.08);
          box-shadow: 0 0 0 4px rgba(254, 189, 105, 0.1);
        }
        .auth-primary-btn {
          width: 100%;
          background: #febd69;
          color: #131921;
          border: none;
          border-radius: 12px;
          padding: 14px;
          font-size: 1rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s;
          margin-top: 10px;
        }
        .auth-primary-btn:hover {
          background: #f3a847;
          transform: translateY(-1px);
          box-shadow: 0 10px 20px -10px rgba(243, 168, 71, 0.5);
        }
        .auth-primary-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .auth-footer-refined {
          margin-top: 30px;
          text-align: center;
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.9rem;
        }
        .auth-footer-refined a {
          color: #febd69;
          text-decoration: none;
          font-weight: 600;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 480px) {
          .glass-premium {
            padding: 25px;
          }
        }
      `}</style>
    </div>
  );
}
