import { ListingForm } from "@/components/listing-form";
import { serverFetchJson } from "@/lib/server-api";
import type { Category } from "@/lib/types";

export default async function NewListingPage() {
  const categories = await serverFetchJson<Category[]>("/categories/");
  return <ListingForm categories={categories} />;
}
