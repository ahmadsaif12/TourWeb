import Link from "next/link";

import { WishlistButton } from "@/components/wishlist-button";
import { formatMoney } from "@/lib/format";
import type { Listing } from "@/lib/types";

type Props = {
  listing: Listing;
};

export function ListingCard({ listing }: Props) {
  return (
    <article className="listing-card">
      <WishlistButton listing={listing} compact />
      <Link href={`/listings/${listing.slug}`} className="listing-card-link">
        <div className="listing-media">
          {listing.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={listing.image_url} alt={listing.title} />
          ) : (
            <div className="listing-placeholder">
              <span>{listing.category}</span>
            </div>
          )}
          <div className="listing-media-overlay">
            <span className="badge badge-emphasis">{listing.is_featured ? "Featured" : listing.category}</span>
            <span className="listing-view">View stay</span>
          </div>
        </div>
        <div className="listing-body">
          <div className="listing-row listing-row-top">
            <span className="badge">{listing.category}</span>
            <span className="muted small">
              {listing.review_count > 0 ? `★ ${listing.average_rating.toFixed(1)} · ${listing.review_count}` : "New stay"}
            </span>
          </div>
          <h3>{listing.title}</h3>
          <p className="muted listing-location">
            {listing.location}, {listing.country}
          </p>
          <div className="listing-row listing-price">
            <strong>{formatMoney(listing.price)}</strong>
            <span className="muted small">per night</span>
          </div>
          <div className="listing-tag-row">
            <span className="chip chip-soft">{listing.base_guests}+ guests</span>
            <span className="chip chip-soft">{listing.max_guests} max</span>
          </div>
        </div>
      </Link>
    </article>
  );
}
