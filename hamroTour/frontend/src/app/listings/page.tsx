import Link from "next/link";

import { ListingGrid } from "@/components/listing-grid";
import { serverFetchJson } from "@/lib/server-api";
import type { Category, Listing } from "@/lib/types";

type SearchParams = Record<string, string | string[] | undefined>;

function pick(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const categories = await serverFetchJson<Category[]>("/categories/");
  const params = new URLSearchParams();
  const search = pick(searchParams.search);
  const category = pick(searchParams.category);
  const country = pick(searchParams.country);
  const guests = pick(searchParams.guests);
  const minPrice = pick(searchParams.min_price);
  const maxPrice = pick(searchParams.max_price);

  if (search) params.set("search", search);
  if (category) params.set("category", category);
  if (country) params.set("country", country);
  if (guests) params.set("guests", guests);
  if (minPrice) params.set("min_price", minPrice);
  if (maxPrice) params.set("max_price", maxPrice);

  const listings = await serverFetchJson<Listing[]>(`/listings/${params.toString() ? `?${params.toString()}` : ""}`);

  return (
    <div className="page-grid">
      <section className="surface">
        <div className="section-heading">
          <p className="eyebrow">Explore</p>
          <h1>Find your next escape</h1>
        </div>
        <form className="form-grid" action="/listings" method="get">
          <div className="split">
            <label className="field">
              <span>Search</span>
              <input className="input" name="search" defaultValue={search || ""} placeholder="City, stay, host..." />
            </label>
            <label className="field">
              <span>Country</span>
              <input className="input" name="country" defaultValue={country || ""} placeholder="Nepal" />
            </label>
          </div>
          <div className="split">
            <label className="field">
              <span>Category</span>
              <select className="input" name="category" defaultValue={category || ""}>
                <option value="">All categories</option>
                {categories.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Guests</span>
              <input className="input" name="guests" type="number" min="1" defaultValue={guests || ""} />
            </label>
          </div>
          <div className="split">
            <label className="field">
              <span>Min price</span>
              <input className="input" name="min_price" type="number" min="0" defaultValue={minPrice || ""} />
            </label>
            <label className="field">
              <span>Max price</span>
              <input className="input" name="max_price" type="number" min="0" defaultValue={maxPrice || ""} />
            </label>
          </div>
          <div className="button-row">
            <button className="button button-solid" type="submit">
              Search stays
            </button>
            <Link className="button button-ghost" href="/listings">
              Clear filters
            </Link>
          </div>
        </form>
      </section>

      <section className="surface">
        <div className="section-heading compact">
          <p className="eyebrow">Results</p>
          <h2>{listings.length} listing(s)</h2>
        </div>
        <ListingGrid listings={listings} emptyLabel="No matches found. Try a different search or category." />
      </section>
    </div>
  );
}
