"use client";

import { useEffect, useState } from "react";

import { apiFetch } from "@/lib/api";
import { getStoredAuth } from "@/lib/auth";
import { ListingGrid } from "@/components/listing-grid";
import Link from "next/link";
import type { Listing } from "@/lib/types";

export function WishlistPanel() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    let active = true;

    const load = async () => {
      const auth = getStoredAuth();
      if (!auth?.access) {
        if (active) {
          setAuthenticated(false);
          setLoading(false);
        }
        return;
      }

      if (active) {
        setAuthenticated(true);
      }

      try {
        const response = await apiFetch<Listing[]>("/listings/?wishlist=true");
        if (active) {
          setListings(response);
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "Unable to load wishlist.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    load();
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return <div className="surface">Loading wishlist...</div>;
  }

  if (!authenticated) {
    return (
      <section className="surface inner-stack">
        <div className="section-heading compact">
          <p className="eyebrow">Wishlist</p>
          <h1>Your saved stays</h1>
        </div>
        <div className="empty-state">
          <p className="muted">Log in to save and revisit your favorite stays.</p>
          <div className="button-row">
            <Link href="/login" className="button button-solid">
              Login
            </Link>
            <Link href="/signup" className="button button-ghost">
              Sign up
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="surface inner-stack">
      <div className="section-heading compact">
        <p className="eyebrow">Wishlist</p>
        <h1>Your saved stays</h1>
      </div>
      {error ? <p className="form-error">{error}</p> : null}
      <ListingGrid listings={listings} emptyLabel="You have not saved any listings yet." />
    </section>
  );
}
