"use client";

import { useState } from "react";

import { apiFetch } from "@/lib/api";
import type { Listing } from "@/lib/types";

type Props = {
  listing: Listing;
  compact?: boolean;
};

export function WishlistButton({ listing, compact = false }: Props) {
  const [wishlisted, setWishlisted] = useState(listing.is_wishlisted);
  const [loading, setLoading] = useState(false);

  return (
    <button
      type="button"
      className={compact ? `wishlist-btn ${wishlisted ? "active" : ""}` : `button ${wishlisted ? "button-solid" : "button-ghost"}`}
      aria-label={wishlisted ? "Remove from wishlist" : "Save to wishlist"}
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        try {
          await apiFetch(`/listings/${listing.slug}/wishlist/`, {
            method: wishlisted ? "DELETE" : "POST",
          });
          setWishlisted((value) => !value);
        } finally {
          setLoading(false);
        }
      }}
    >
      {compact ? (
        <span aria-hidden="true">{loading ? "…" : wishlisted ? "♥" : "♡"}</span>
      ) : loading ? (
        "Updating..."
      ) : wishlisted ? (
        "Saved to wishlist"
      ) : (
        "Save to wishlist"
      )}
    </button>
  );
}
