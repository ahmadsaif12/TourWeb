"use client";

import { useState } from "react";

import { apiFetch } from "@/lib/api";
import { formatMoney } from "@/lib/format";
import type { Booking, Listing } from "@/lib/types";

type Props = {
  listing: Listing;
};

export function BookingWidget({ listing }: Props) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<string>("");
  const [form, setForm] = useState({
    check_in: "",
    check_out: "",
    guests: "1",
    special_requests: "",
  });

  const pricePerNight = Number.parseFloat(listing.price) || 0;
  const nights = preview ? Number.parseInt(preview, 10) : 0;

  return (
    <section className="surface booking-card">
      <div className="listing-row">
        <div>
          <p className="eyebrow">Reserve now</p>
          <h3>{formatMoney(listing.price)} <span className="muted">/ night</span></h3>
        </div>
        <span className="badge">{listing.category}</span>
      </div>

      <form
        className="form-grid compact"
        onSubmit={async (event) => {
          event.preventDefault();
          setLoading(true);
          setError("");
          setMessage("");
          try {
            const payload = await apiFetch<Booking>("/bookings/", {
              method: "POST",
              body: JSON.stringify({
                listing: listing.id,
                check_in: form.check_in,
                check_out: form.check_out,
                guests: Number(form.guests),
                special_requests: form.special_requests,
              }),
            });
            setMessage(`Booking request created for ${payload.nights} night(s).`);
          } catch (submitError) {
            setError(submitError instanceof Error ? submitError.message : "Unable to book this listing.");
          } finally {
            setLoading(false);
          }
        }}
      >
        <div className="split">
          <label className="field">
            <span>Check in</span>
            <input
              className="input"
              type="date"
              value={form.check_in}
              onChange={(event) => setForm({ ...form, check_in: event.target.value })}
              onBlur={() => {
                if (form.check_in && form.check_out) {
                  const start = new Date(form.check_in);
                  const end = new Date(form.check_out);
                  const diff = Math.max(Math.ceil((end.getTime() - start.getTime()) / 86400000), 1);
                  setPreview(String(diff));
                }
              }}
              required
            />
          </label>
          <label className="field">
            <span>Check out</span>
            <input
              className="input"
              type="date"
              value={form.check_out}
              onChange={(event) => setForm({ ...form, check_out: event.target.value })}
              onBlur={() => {
                if (form.check_in && form.check_out) {
                  const start = new Date(form.check_in);
                  const end = new Date(form.check_out);
                  const diff = Math.max(Math.ceil((end.getTime() - start.getTime()) / 86400000), 1);
                  setPreview(String(diff));
                }
              }}
              required
            />
          </label>
        </div>

        <label className="field">
          <span>Guests</span>
          <input
            className="input"
            type="number"
            min="1"
            max={listing.max_guests}
            value={form.guests}
            onChange={(event) => setForm({ ...form, guests: event.target.value })}
            required
          />
        </label>

        <label className="field">
          <span>Special requests</span>
          <textarea
            className="textarea"
            rows={4}
            value={form.special_requests}
            onChange={(event) => setForm({ ...form, special_requests: event.target.value })}
            placeholder="Anything the host should know?"
          />
        </label>

        <div className="price-breakdown">
          <div className="listing-row">
            <span>{formatMoney(pricePerNight)} x {preview || 1} night(s)</span>
            <strong>{formatMoney(pricePerNight * (nights || 1))}</strong>
          </div>
          <div className="listing-row">
            <span>Cleaning fee</span>
            <strong>{formatMoney(listing.cleaning_fee)}</strong>
          </div>
          <div className="listing-row">
            <span>Service fee</span>
            <strong>{formatMoney(listing.service_fee)}</strong>
          </div>
        </div>

        {error ? <p className="form-error">{error}</p> : null}
        {message ? <p className="form-success">{message}</p> : null}
        <button type="submit" className="button button-solid button-wide" disabled={loading}>
          {loading ? "Submitting..." : "Request booking"}
        </button>
      </form>
    </section>
  );
}
