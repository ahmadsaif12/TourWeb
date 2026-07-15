import type { Listing } from "@/lib/types";
import { ListingCard } from "@/components/listing-card";

type Props = {
  listings: Listing[];
  emptyLabel?: string;
};

export function ListingGrid({ listings, emptyLabel = "No listings found." }: Props) {
  if (!listings.length) {
    return <div className="empty-state">{emptyLabel}</div>;
  }

  return (
    <div className="listing-grid">
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}
