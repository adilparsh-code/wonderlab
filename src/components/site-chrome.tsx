"use client";

import { useState } from "react";

const navItems = [
  { href: "/arcade/", label: "Arcade" },
  { href: "/how-it-works/", label: "How it works" },
  { href: "/coding-lab/", label: "Coding Lab" },
  { href: "/challenges/", label: "Challenges" },
  { href: "/about/", label: "About" },
];

export function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="nav-wrap">
        <a className="brand" href="/" aria-label="WonderLab home">
          <span className="brand-mark" aria-hidden="true">
            W.
          </span>
          WonderLab
        </a>
        <button
          className="mobile-menu-button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-expanded={mobileMenuOpen}
          aria-label="Toggle navigation menu"
          type="button"
        >
          <span style={{ transform: mobileMenuOpen ? "rotate(45deg) translate(5px, 5px)" : "none" }} />
          <span style={{ opacity: mobileMenuOpen ? 0 : 1 }} />
          <span style={{ transform: mobileMenuOpen ? "rotate(-45deg) translate(7px, -7px)" : "none" }} />
        </button>
        <nav className={`nav-links ${mobileMenuOpen ? "active" : ""}`} aria-label="Main navigation">
          {navItems.map((item) => (
            <a
              href={item.href}
              key={item.href}
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}