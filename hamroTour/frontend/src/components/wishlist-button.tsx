"use client";

import { useState } from "react";

import { apiFetch } from "@/lib/api";
import type { Listing } from "@/lib/types";

type Props = {
  listing: Listing;
};

export function WishlistButton({ listing }: Props) {
  const [wishlisted, setWishlisted] = useState(listing.is_wishlisted);
  const [loading, setLoading] = useState(false);

  return (
    <button
      type="button"
      className={`button ${wishlisted ? "button-solid" : "button-ghost"}`}
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
      {loading ? "Updating..." : wishlisted ? "Saved to wishlist" : "Save to wishlist"}
    </button>
  );
}
