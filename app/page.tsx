"use client";

import Link from "next/link";
import { products } from "./data/products";
import FilteredCollection from "./components/FilteredCollection";

export default function HomePage() {
  return (
    <>
      <FilteredCollection
        initialProducts={products}
        activeCategory="All"
        showHeroCarousel={true}
        title="All Products"
        description="Discover our complete collection of premium attars, perfumes, cosmetics, and more."
      />

      {/* ─── WHOLESALE BANNER ─── */}
      <div className="section">
        <div className="wholesale-banner">
          <div className="wholesale-text">
            <h2>Join Our Exclusive Wholesale Community</h2>
            <p>
              Access premium fragrance tiers and artisanal wedding supplies with
              dedicated business support.
            </p>
            <Link href="/wholesale" className="btn-primary">
              Apply for Wholesale
            </Link>
          </div>
          <div className="wholesale-stats">
            <div className="wholesale-stat">
              <div className="stat-value">20%</div>
              <div className="stat-label">Volume Benefit</div>
            </div>
            <div className="wholesale-stat">
              <div className="stat-value">35%</div>
              <div className="stat-label">Elite Tier</div>
            </div>
            <div className="wholesale-stat">
              <div className="stat-value">Priority</div>
              <div className="stat-label">Express Shipping</div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── TRUST BADGES ─── */}
      <section className="section-tonal">
        <div className="section">
          <div className="trust-grid">
            <div className="trust-badge">
              <div className="trust-badge-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
              <h4>Free Shipping</h4>
              <p>On all orders above ₹999</p>
            </div>
            <div className="trust-badge">
              <div className="trust-badge-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="1" y="4" width="22" height="16" rx="2" />
                  <line x1="1" y1="10" x2="23" y2="10" />
                </svg>
              </div>
              <h4>COD Available</h4>
              <p>Pay at your doorstep</p>
            </div>
            <div className="trust-badge">
              <div className="trust-badge-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <h4>Genuine Products</h4>
              <p>100% authentic artisanal products</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
