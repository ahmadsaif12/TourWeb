import Link from "next/link";

import { ListingGrid } from "@/components/listing-grid";
import { serverFetchJson } from "@/lib/server-api";
import type { Category, Listing } from "@/lib/types";

const categoryGlyphs: Record<string, string> = {
  stay: "⌂",
  apartment: "▦",
  hotel: "✦",
  villa: "◈",
  cabin: "▲",
  camp: "⛺",
  resort: "☼",
  experience: "✧",
};

export default async function HomePage() {
  const [listings, categories] = await Promise.all([
    serverFetchJson<Listing[]>("/listings/"),
    serverFetchJson<Category[]>("/categories/"),
  ]);

  return (
    <div className="wl-home">
      {/* Red Wanderlust-style banner */}
      <section className="wl-banner">
        <div className="wl-banner-content">
          <h1 className="wl-banner-title">Explore Extraordinary Stays</h1>
          <p className="wl-banner-subtitle">
            Discover unique homes, cabins, villas &amp; more around Nepal and beyond
          </p>
          <div className="wl-banner-actions">
            <Link className="wl-banner-chip" href="/listings">
              <span aria-hidden="true">🛡️</span>
              <span>Verified Hosts</span>
            </Link>
            <Link className="wl-banner-chip" href="/contact">
              <span aria-hidden="true">🎧</span>
              <span>24/7 Support</span>
            </Link>
            <Link className="wl-banner-chip" href="/listings">
              <span aria-hidden="true">⭐</span>
              <span>Top Rated</span>
            </Link>
            <Link className="wl-banner-chip" href="/host/new">
              <span aria-hidden="true">🏠</span>
              <span>Become a Host</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Category icon filter rail */}
      <nav className="wl-filters" aria-label="Browse by category">
        <Link href="/listings" className="wl-filter wl-filter-active">
          <span className="wl-filter-icon" aria-hidden="true">✨</span>
          <span>All</span>
        </Link>
        {categories.map((category) => (
          <Link key={category.value} href={`/listings?category=${category.value}`} className="wl-filter">
            <span className="wl-filter-icon" aria-hidden="true">{categoryGlyphs[category.value] || "•"}</span>
            <span>{category.label}</span>
          </Link>
        ))}
      </nav>

      {/* 4-column listing grid with wishlist hearts + price badges */}
      <section className="wl-grid-section">
        <ListingGrid listings={listings} emptyLabel="No listings found. Try a different search or explore all categories." />
      </section>
    </div>
  );
}