import Link from "next/link";

import { ListingGrid } from "@/components/listing-grid";
import { formatMoney } from "@/lib/format";
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
  const [featuredListings, categories] = await Promise.all([
    serverFetchJson<Listing[]>("/listings/?featured=true"),
    serverFetchJson<Category[]>("/categories/"),
  ]);

  const topListing = featuredListings[0];
  const spotlight = featuredListings.slice(0, 4);

  return (
    <div className="page-grid">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">HamroTour reimagined</p>
          <h1>Explore extraordinary stays.</h1>
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
          <div className="hero-pills">
            <span className="chip chip-soft">Verified hosts</span>
            <span className="chip chip-soft">Fast booking</span>
            <span className="chip chip-soft">S3 media</span>
          </div>
        </div>

        <div className="hero-panel">
          <div className="hero-mosaic">
            {spotlight.length ? (
              spotlight.map((listing, index) => (
                <Link
                  key={listing.id}
                  href={`/listings/${listing.slug}`}
                  className={`hero-tile ${index === 0 ? "hero-tile--lead" : ""}`}
                >
                  {listing.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={listing.image_url} alt={listing.title} />
                  ) : (
                    <div className="listing-placeholder">
                      <span>{listing.category}</span>
                    </div>
                  )}
                  <div className="hero-tile-copy">
                    <span className="hero-tile-kicker">
                      {listing.is_featured ? "Featured stay" : listing.category}
                    </span>
                    <strong>{listing.title}</strong>
                    <span>{listing.location}, {listing.country}</span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="hero-empty">
                <p className="eyebrow">Demo ready</p>
                <strong>Add sample listings to unlock the full homepage collage.</strong>
              </div>
            )}
          </div>
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
        <div className="category-rail">
          {categories.map((category) => (
            <Link key={category.value} href={`/listings?category=${category.value}`} className="category-card">
              <span className="category-glyph">{categoryGlyphs[category.value] || "•"}</span>
              <strong>{category.label}</strong>
              <span>Curated escapes</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="surface surface-emphasis">
        <div className="section-heading compact">
          <p className="eyebrow">Why HamroTour</p>
          <h2>Built for modern travel discovery</h2>
        </div>
        <div className="feature-grid">
          <article className="feature-card">
            <span className="feature-kicker">Search</span>
            <h3>Quick discovery</h3>
            <p>Search by country, price, guests, and category with a clean rail that feels fast on mobile.</p>
          </article>
          <article className="feature-card">
            <span className="feature-kicker">Media</span>
            <h3>S3-ready uploads</h3>
            <p>Listings can use Amazon S3 for storage while keeping imported demo content visible out of the box.</p>
          </article>
          <article className="feature-card">
            <span className="feature-kicker">Bookings</span>
            <h3>Simple booking flow</h3>
            <p>Check dates, add guests, and keep the booking experience lightweight without losing key details.</p>
          </article>
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
