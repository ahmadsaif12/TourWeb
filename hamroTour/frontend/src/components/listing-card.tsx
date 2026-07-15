import Link from "next/link";

import { formatMoney } from "@/lib/format";
import type { Listing } from "@/lib/types";

type Props = {
  listing: Listing;
};

export function ListingCard({ listing }: Props) {
  return (
    <Link href={`/listings/${listing.slug}`} className="listing-card">
      <div className="listing-media">
        {listing.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={listing.image_url} alt={listing.title} />
        ) : (
          <div className="listing-placeholder">
            <span>{listing.category}</span>
          </div>
        )}
      </div>
      <div className="listing-body">
        <div className="listing-row">
          <span className="badge">{listing.category}</span>
          <span className="muted small">
            {listing.review_count > 0 ? `${listing.average_rating.toFixed(1)} · ${listing.review_count} reviews` : "New stay"}
          </span>
        </div>
        <h3>{listing.title}</h3>
        <p className="muted">
          {listing.location}, {listing.country}
        </p>
        <div className="listing-row listing-price">
          <strong>{formatMoney(listing.price)}</strong>
          <span className="muted small">per night</span>
        </div>
      </div>
    </Link>
  );
}
