"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { logout, getStoredAuth } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import type { User } from "@/lib/types";

const navLinks = [
  { href: "/listings", label: "Explore" },
  { href: "/host/new", label: "Host a stay" },
  { href: "/wishlist", label: "Wishlist" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let active = true;

    const loadUser = async () => {
      const auth = getStoredAuth();
      if (!auth?.access) {
        if (active) {
          setUser(null);
        }
        return;
      }

      try {
        const me = await apiFetch<User>("/auth/me/");
        if (active) {
          setUser(me);
        }
      } catch {
        if (active) {
          setUser(null);
        }
      }
    };

    loadUser();

    const handleAuthChange = () => loadUser();
    window.addEventListener("hamrotour-auth-changed", handleAuthChange);

    return () => {
      active = false;
      window.removeEventListener("hamrotour-auth-changed", handleAuthChange);
    };
  }, []);

  return (
    <header className="site-header">
      <div className="site-shell site-header-inner">
        <Link href="/" className="brand">
          <span className="brand-mark">H</span>
          <span>
            <strong>HamroTour</strong>
            <small>Stay local, travel bold</small>
          </span>
        </Link>

        <nav className="site-nav">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
          {user ? (
            <>
              <Link href="/profile" className="nav-pill">
                {user.username}
              </Link>
              <button
                type="button"
                className="button button-ghost"
                onClick={async () => {
                  await logout();
                  setUser(null);
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="nav-pill">
                Login
              </Link>
              <Link href="/signup" className="button button-solid">
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
