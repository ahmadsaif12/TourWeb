import Link from "next/link";

import { ListingGrid } from "@/components/listing-grid";
import { formatMoney } from "@/lib/format";
import { serverFetchJson } from "@/lib/server-api";
import type { Category, Listing } from "@/lib/types";

export default async function HomePage() {
  const [featuredListings, categories] = await Promise.all([
    serverFetchJson<Listing[]>("/listings/?featured=true"),
    serverFetchJson<Category[]>("/categories/"),
  ]);

  const topListing = featuredListings[0];

  return (
    <div className="page-grid">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">HamroTour reimagined</p>
          <h1>Stay closer to the journey.</h1>
          <p>
            A modern travel marketplace for Nepal and beyond, rebuilt with a Django API, Next.js frontend,
            and S3-backed media uploads in place of Cloudinary.
          </p>
          <div className="hero-actions">
            <Link className="button button-solid" href="/listings">
              Explore stays
            </Link>
            <Link className="button button-ghost" href="/host/new">
              Host your place
            </Link>
          </div>
        </div>

        <div className="hero-panel">
          <div className="hero-image" />
          <div className="hero-panel-content">
            <div className="hero-stats">
            <div className="stat-card">
                <strong>{featuredListings.length}</strong>
                <span className="muted">featured escapes</span>
              </div>
              <div className="stat-card">
                <strong>{categories.length}</strong>
                <span className="muted">categories</span>
              </div>
              <div className="stat-card">
                <strong>{topListing ? formatMoney(topListing.price) : "$0"}</strong>
                <span className="muted">starting price</span>
              </div>
            </div>
            <p className="muted">
              Built for fast browsing, simple bookings, and media uploads stored in Amazon S3.
            </p>
          </div>
        </div>
      </section>

      <section className="surface">
        <div className="section-heading compact">
          <p className="eyebrow">Categories</p>
          <h2>Browse by vibe</h2>
        </div>
        <div className="hero-actions">
          {categories.map((category) => (
            <Link key={category.value} href={`/listings?category=${category.value}`} className="chip">
              {category.label}
            </Link>
          ))}
        </div>
      </section>

      <section className="surface">
        <div className="section-heading compact">
          <p className="eyebrow">Featured</p>
          <h2>Curated stays worth opening first</h2>
        </div>
        <ListingGrid listings={featuredListings} emptyLabel="Featured listings will appear here once hosts publish them." />
      </section>
    </div>
  );
}
