import { notFound } from "next/navigation";

import { BookingWidget } from "@/components/booking-widget";
import { ReviewSection } from "@/components/review-section";
import { WishlistButton } from "@/components/wishlist-button";
import { formatMoney } from "@/lib/format";
import { serverFetchJson } from "@/lib/server-api";
import type { Listing, Review } from "@/lib/types";

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  try {
    const { id } = await params;
    const [listing, reviews] = await Promise.all([
      serverFetchJson<Listing>(`/listings/${id}/`),
      serverFetchJson<Review[]>(`/reviews/?listing=${id}`),
    ]);

    return (
      <div className="page-grid">
        <section className="surface">
          <div className="hero-actions" style={{ justifyContent: "space-between" }}>
            <div>
              <p className="eyebrow">{listing.category}</p>
              <h1 className="page-title">{listing.title}</h1>
              <p className="muted">
                {listing.location}, {listing.country}
              </p>
            </div>
            <WishlistButton listing={listing} />
          </div>

          <div className="split" style={{ marginTop: 24, alignItems: "start" }}>
            <div className="inner-stack">
              <div className="listing-media" style={{ borderRadius: 24 }}>
                {listing.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={listing.image_url} alt={listing.title} />
                ) : (
                  <div className="listing-placeholder">HamroTour</div>
                )}
              </div>
              <div className="surface-soft inner-stack">
                <div className="listing-row">
                  <span className="badge">{listing.review_count ? `${listing.average_rating.toFixed(1)} / 5` : "New listing"}</span>
                  <span className="muted small">{listing.review_count} review(s)</span>
                </div>
                <p>{listing.description}</p>
                <div className="hero-actions">
                  <span className="chip">{formatMoney(listing.price)} / night</span>
                  <span className="chip">{listing.base_guests}+ guests</span>
                  <span className="chip">{listing.max_guests} max</span>
                </div>
                {listing.addons?.length ? (
                  <div className="stack">
                    <h3>Add-ons</h3>
                    {listing.addons.map((addon) => (
                      <div key={addon.name} className="listing-row">
                        <span>{addon.name}</span>
                        <strong>{formatMoney(addon.price)}</strong>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>

            <BookingWidget listing={listing} />
          </div>
        </section>

        <ReviewSection listing={listing} initialReviews={reviews} />
      </div>
    );
  } catch {
    notFound();
  }
}
