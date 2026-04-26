"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useCart } from "../context/CartContext";
import { useTheme } from "../context/ThemeContext";

export default function Header() {
  const { totalItems, setIsOpen } = useCart();
  const { theme, toggleTheme } = useTheme();
  const { data: session, status } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const searchParams = useSearchParams();
  const currentCat = searchParams ? searchParams.get('cat') : '';

  const userName = session?.user?.name || session?.user?.email?.split("@")[0] || "";
  const isLoggedIn = status === "authenticated";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  return (
    <>
       <header className={`site-header ${scrolled ? "scrolled" : ""}`}>
        <div className="header-inner">
          {/* Logo */}
          <Link href="/" className="logo">
            <span className="logo-text">Sidra</span>
            <span className="logo-sub">Attar Wala</span>
          </Link>

          {/* Search Bar */}
          <div className="header-search">
            <select className="header-search-select" aria-label="Search dropdown">
              <option value="all">All</option>
              <option value="attars">Attars</option>
              <option value="perfumes">Perfumes</option>
              <option value="cosmetics">Cosmetics</option>
              <option value="gifts">Gifts</option>
              <option value="nikah">Sadi / Nikah</option>
              <option value="namaz">Prayer / Namaz</option>
              <option value="books">Islamic Books</option>
              <option value="fancy">Fancy Items</option>
            </select>
            <input 
              type="text" 
              className="header-search-input" 
              placeholder="Search Sidra Attar Wala" 
            />
            <button className="header-search-btn" aria-label="Search button">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
            </button>
          </div>

          {/* Actions */}
          <div className="header-actions">
            <button
              className="header-icon-btn theme-btn hide-mobile"
              onClick={toggleTheme}
              aria-label="Toggle Theme"
            >
              {theme === "dark" ? (
                <>
                  <span className="header-icon-subtext">Theme</span>
                  <span className="header-icon-text">Light Mode</span>
                </>
              ) : (
                <>
                  <span className="header-icon-subtext">Theme</span>
                  <span className="header-icon-text">Dark Mode</span>
                </>
              )}
            </button>

            <Link href="/account" className="header-icon-btn location-btn hide-mobile" style={{ flexDirection: 'row', alignItems: 'center', gap: '4px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: '2px' }}>
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              <div className="location-text">
                <span className="header-icon-subtext">Delivering to Mumbai</span>
                <span className="header-icon-text">Update location</span>
              </div>
            </Link>

            {/* Auth-aware Account Link */}
            <Link href={isLoggedIn ? "/account" : "/auth/signin"} className="header-icon-btn">
              <span className="header-icon-subtext">
                {isLoggedIn ? `Hello, ${userName}` : "Hello, sign in"}
              </span>
              <span className="header-icon-text">Account</span>
            </Link>

            <Link href="/account" className="header-icon-btn hide-mobile">
              <span className="header-icon-subtext">Returns</span>
              <span className="header-icon-text">&amp; Orders</span>
            </Link>

            <button
              className="header-icon-btn cart-btn"
              onClick={() => setIsOpen(true)}
              aria-label="Cart"
            >
              <div className="cart-icon-wrapper">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
                <span className="cart-count">{totalItems}</span>
              </div>
              <span className="header-icon-text hide-mobile" style={{ paddingBottom: '2px' }}>Cart</span>
            </button>
          </div>
        </div>

        {/* Sub Header / Navigation */}
        <div className="header-bottom">
          {/* Menu Button and All Link */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button
              className="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
              style={{ marginRight: '4px' }}
            >
              <span className="hamburger">
                <span></span>
                <span></span>
                <span></span>
              </span>
            </button>
            <Link 
              href="/collections?cat=All" 
              className={`all-btn ${(currentCat === 'All' || !currentCat) ? 'active-nav' : ''}`}
            >
              All
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="main-nav">
            <Link href="/collections?cat=Today%27s+Deals" className={currentCat === "Today's Deals" ? "active-nav" : ""}>Today&apos;s Deals</Link>
            <Link href="/collections?cat=Attars" className={currentCat === "Attars" ? "active-nav" : ""}>Attars</Link>
            <Link href="/collections?cat=Luxury+Perfumes" className={currentCat === "Luxury Perfumes" ? "active-nav" : ""}>Luxury Perfumes</Link>
            <Link href="/collections?cat=Oud+Combos" className={currentCat === "Oud Combos" ? "active-nav" : ""}>Oud Combos</Link>
            <Link href="/collections?cat=Cosmetics" className={currentCat === "Cosmetics" ? "active-nav" : ""}>Cosmetics</Link>
            <Link href="/collections?cat=Gift+Hampers" className={currentCat === "Gift Hampers" ? "active-nav" : ""}>Gift Hampers</Link>
            <Link href="/collections?cat=Sadi+Nikah+Special" className={(currentCat === "Sadi Nikah Special" || currentCat === "Sadi / Nikah Special") ? "active-nav" : ""}>Sadi / Nikah Special</Link>
            <Link href="/collections?cat=Prayer+Namaz" className={(currentCat === "Prayer Namaz" || currentCat === "Prayer / Namaz") ? "active-nav" : ""}>Prayer / Namaz</Link>
            <Link href="/collections?cat=Islamic+Books" className={currentCat === "Islamic Books" ? "active-nav" : ""}>Islamic Books</Link>
            <Link href="/collections?cat=Customer+Service" className={currentCat === "Customer Service" ? "active-nav" : ""}>Customer Service</Link>
          </nav>
        </div>
      </header>

      {/* Side Drawer Overlay */}
      <div 
        className={`side-drawer-overlay ${mobileMenuOpen ? "open" : ""}`} 
        onClick={() => setMobileMenuOpen(false)}
      />
      
      {/* Side Drawer Menu */}
      <div className={`side-drawer ${mobileMenuOpen ? "open" : ""}`}>
        <div className="side-drawer-header">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="5" />
            <path d="M20 21a8 8 0 1 0-16 0" />
          </svg>
          <h3>{isLoggedIn ? `Hello, ${userName}` : "Hello, Sign in"}</h3>
          <button className="side-drawer-close" onClick={() => setMobileMenuOpen(false)} aria-label="Close menu">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="side-drawer-content">
          <div className="side-drawer-section">
            <div className="side-drawer-title">Trending</div>
            <Link href="/collections?cat=Best+Sellers" className="side-drawer-link" onClick={() => setMobileMenuOpen(false)}>Best Sellers</Link>
            <Link href="/collections?cat=New+Releases" className="side-drawer-link" onClick={() => setMobileMenuOpen(false)}>New Releases</Link>
          </div>
          
          <div className="side-drawer-section">
            <div className="side-drawer-title">Shop By Category</div>
            <Link href="/collections?cat=Attars" className="side-drawer-link" onClick={() => setMobileMenuOpen(false)}>
              Attars
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </Link>
            <Link href="/collections?cat=Luxury+Perfumes" className="side-drawer-link" onClick={() => setMobileMenuOpen(false)}>
              Luxury Perfumes
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </Link>
            <Link href="/collections?cat=Oud+Combos" className="side-drawer-link" onClick={() => setMobileMenuOpen(false)}>
              Oud Combos
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </Link>
            <Link href="/collections?cat=Cosmetics" className="side-drawer-link" onClick={() => setMobileMenuOpen(false)}>
              Cosmetics
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </Link>
            <Link href="/collections?cat=Gift+Hampers" className="side-drawer-link" onClick={() => setMobileMenuOpen(false)}>
              Gift Hampers
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </Link>
            <Link href="/collections?cat=Sadi+Nikah+Special" className="side-drawer-link" onClick={() => setMobileMenuOpen(false)}>
              Sadi / Nikah Special
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </Link>
            <Link href="/collections?cat=Prayer+Namaz" className="side-drawer-link" onClick={() => setMobileMenuOpen(false)}>
              Prayer / Namaz Items
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </Link>
          </div>

          <div className="side-drawer-section" style={{ borderBottom: 'none' }}>
            <div className="side-drawer-title">Help & Settings</div>
            <Link href="/account" className="side-drawer-link" onClick={() => setMobileMenuOpen(false)}>Your Account</Link>
            <Link href="/account" className="side-drawer-link" onClick={() => setMobileMenuOpen(false)}>Returns & Orders</Link>
            <Link href="/account" className="side-drawer-link" onClick={() => setMobileMenuOpen(false)}>Delivery Location</Link>
            <Link href="/collections?cat=Customer+Service" className="side-drawer-link" onClick={() => setMobileMenuOpen(false)}>Customer Service</Link>
            <button className="side-drawer-link" style={{ width: '100%' }} onClick={() => { toggleTheme(); setMobileMenuOpen(false); }}>
              Toggle Theme ({theme === 'dark' ? 'Light Mode' : 'Dark Mode'})
            </button>
            {isLoggedIn ? (
              <button
                className="side-drawer-link"
                style={{ width: '100%' }}
                onClick={() => { signOut(); setMobileMenuOpen(false); }}
              >
                Sign Out
              </button>
            ) : (
              <Link href="/auth/signin" className="side-drawer-link" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
