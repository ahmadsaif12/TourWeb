"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { apiFetch } from "@/lib/api";
import type { Category } from "@/lib/types";

type Props = {
  categories: Category[];
};

type AddonDraft = {
  name: string;
  price: string;
};

const emptyAddon = { name: "", price: "" };

export function ListingForm({ categories }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [addons, setAddons] = useState<AddonDraft[]>([{ ...emptyAddon }]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: categories[0]?.value || "stay",
    price: "",
    cleaning_fee: "0",
    service_fee: "0",
    base_guests: "2",
    max_guests: "4",
    max_kids: "0",
    max_infants: "0",
    max_pets: "0",
    extra_guest_fee_per_night: "0",
    country: "",
    location: "",
    address: "",
    latitude: "",
    longitude: "",
    external_image_url: "",
    is_featured: false,
  });

  return (
    <form
      className="surface form-grid listing-form"
      onSubmit={async (event) => {
        event.preventDefault();
        setSaving(true);
        setMessage("");
        setError("");
        try {
          const payload = new FormData();
          Object.entries(form).forEach(([key, value]) => {
            payload.append(key, String(value));
          });
          payload.set(
            "addons",
            JSON.stringify(addons.filter((item) => item.name.trim()).map((item) => ({
              name: item.name.trim(),
              price: Number(item.price || "0"),
            }))),
          );
          if (image) {
            payload.append("image", image);
          }
          const created = await apiFetch<{ slug: string }>("/listings/", {
            method: "POST",
            body: payload,
          });
          setMessage("Listing created successfully.");
          router.push(`/listings/${created.slug}`);
        } catch (submitError) {
          setError(submitError instanceof Error ? submitError.message : "Unable to create listing.");
        } finally {
          setSaving(false);
        }
      }}
    >
      <div className="section-heading">
        <p className="eyebrow">New listing</p>
        <h1>Share your stay with travelers</h1>
        <p className="muted">This form maps directly to the Django listing model and uploads media to S3 when enabled.</p>
      </div>

      <div className="split">
        <label className="field">
          <span>Title</span>
          <input
            className="input"
            value={form.title}
            onChange={(event) => setForm({ ...form, title: event.target.value })}
            required
          />
        </label>
        <label className="field">
          <span>Category</span>
          <select
            className="input"
            value={form.category}
            onChange={(event) => setForm({ ...form, category: event.target.value })}
          >
            {categories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="field">
        <span>Description</span>
        <textarea
          className="textarea"
          rows={5}
          value={form.description}
          onChange={(event) => setForm({ ...form, description: event.target.value })}
          required
        />
      </label>

      <div className="split">
        <label className="field">
          <span>Price per night</span>
          <input
            className="input"
            type="number"
            min="0"
            step="0.01"
            value={form.price}
            onChange={(event) => setForm({ ...form, price: event.target.value })}
            required
          />
        </label>
        <label className="field">
          <span>Primary image</span>
          <input className="input" type="file" accept="image/*" onChange={(event) => setImage(event.target.files?.[0] || null)} />
        </label>
      </div>

      <label className="field">
        <span>Image URL (optional)</span>
        <input
          className="input"
          value={form.external_image_url}
          onChange={(event) => setForm({ ...form, external_image_url: event.target.value })}
          placeholder="https://images.unsplash.com/..."
        />
      </label>

      <div className="split">
        <label className="field">
          <span>Country</span>
          <input
            className="input"
            value={form.country}
            onChange={(event) => setForm({ ...form, country: event.target.value })}
            required
          />
        </label>
        <label className="field">
          <span>Location</span>
          <input
            className="input"
            value={form.location}
            onChange={(event) => setForm({ ...form, location: event.target.value })}
            required
          />
        </label>
      </div>

      <label className="field">
        <span>Address</span>
        <input
          className="input"
          value={form.address}
          onChange={(event) => setForm({ ...form, address: event.target.value })}
        />
      </label>

      <div className="split">
        <label className="field">
          <span>Latitude</span>
          <input
            className="input"
            value={form.latitude}
            onChange={(event) => setForm({ ...form, latitude: event.target.value })}
          />
        </label>
        <label className="field">
          <span>Longitude</span>
          <input
            className="input"
            value={form.longitude}
            onChange={(event) => setForm({ ...form, longitude: event.target.value })}
          />
        </label>
      </div>

      <div className="split">
        <label className="field">
          <span>Base guests</span>
          <input className="input" type="number" min="1" value={form.base_guests} onChange={(event) => setForm({ ...form, base_guests: event.target.value })} />
        </label>
        <label className="field">
          <span>Max guests</span>
          <input className="input" type="number" min="1" value={form.max_guests} onChange={(event) => setForm({ ...form, max_guests: event.target.value })} />
        </label>
        <label className="field">
          <span>Extra guest fee/night</span>
          <input className="input" type="number" min="0" step="0.01" value={form.extra_guest_fee_per_night} onChange={(event) => setForm({ ...form, extra_guest_fee_per_night: event.target.value })} />
        </label>
      </div>

      <div className="split">
        <label className="field">
          <span>Cleaning fee</span>
          <input className="input" type="number" min="0" step="0.01" value={form.cleaning_fee} onChange={(event) => setForm({ ...form, cleaning_fee: event.target.value })} />
        </label>
        <label className="field">
          <span>Service fee</span>
          <input className="input" type="number" min="0" step="0.01" value={form.service_fee} onChange={(event) => setForm({ ...form, service_fee: event.target.value })} />
        </label>
      </div>

      <div className="split">
        <label className="field">
          <span>Max kids</span>
          <input className="input" type="number" min="0" value={form.max_kids} onChange={(event) => setForm({ ...form, max_kids: event.target.value })} />
        </label>
        <label className="field">
          <span>Max infants</span>
          <input className="input" type="number" min="0" value={form.max_infants} onChange={(event) => setForm({ ...form, max_infants: event.target.value })} />
        </label>
        <label className="field">
          <span>Max pets</span>
          <input className="input" type="number" min="0" value={form.max_pets} onChange={(event) => setForm({ ...form, max_pets: event.target.value })} />
        </label>
      </div>

      <label className="checkbox-row">
        <input
          type="checkbox"
          checked={form.is_featured}
          onChange={(event) => setForm({ ...form, is_featured: event.target.checked })}
        />
        <span>Feature this listing on the home page</span>
      </label>

      <div className="surface-soft inner-stack">
        <div className="section-heading compact">
          <h2>Add-ons</h2>
          <p className="muted">Optional extras are stored as JSON and available to the booking flow.</p>
        </div>
        {addons.map((addon, index) => (
          <div key={`${index}-${addon.name}`} className="split">
            <label className="field">
              <span>Label</span>
              <input
                className="input"
                value={addon.name}
                onChange={(event) => {
                  const next = [...addons];
                  next[index] = { ...next[index], name: event.target.value };
                  setAddons(next);
                }}
              />
            </label>
            <label className="field">
              <span>Price</span>
              <input
                className="input"
                type="number"
                min="0"
                step="0.01"
                value={addon.price}
                onChange={(event) => {
                  const next = [...addons];
                  next[index] = { ...next[index], price: event.target.value };
                  setAddons(next);
                }}
              />
            </label>
          </div>
        ))}
        <button
          type="button"
          className="button button-ghost"
          onClick={() => setAddons([...addons, { ...emptyAddon }])}
        >
          Add another add-on
        </button>
      </div>

      {error ? <p className="form-error">{error}</p> : null}
      {message ? <p className="form-success">{message}</p> : null}
      <button type="submit" className="button button-solid button-wide" disabled={saving}>
        {saving ? "Saving listing..." : "Create listing"}
      </button>
    </form>
  );
}
