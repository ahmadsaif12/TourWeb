"use client";

import { useState } from "react";

import { apiFetch } from "@/lib/api";
import { formatDate } from "@/lib/format";
import type { Listing, Review } from "@/lib/types";

type Props = {
  listing: Listing;
  initialReviews: Review[];
};

export function ReviewSection({ listing, initialReviews }: Props) {
  const [reviews, setReviews] = useState(initialReviews);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    rating: "5",
    comment: "",
  });

  return (
    <section className="surface inner-stack">
      <div className="section-heading compact">
        <p className="eyebrow">Reviews</p>
        <h2>Guest feedback</h2>
      </div>

      <div className="stack">
        {reviews.length ? (
          reviews.map((review) => (
            <article key={review.id} className="review-item">
              <div className="listing-row">
                <strong>{review.author.username}</strong>
                <span className="badge">{review.rating}/5</span>
              </div>
              <p className="muted">{review.comment || "No comment left."}</p>
              <p className="muted small">{formatDate(review.created_at)}</p>
            </article>
          ))
        ) : (
          <p className="muted">Be the first to leave a review for this stay.</p>
        )}
      </div>

      <form
        className="form-grid compact"
        onSubmit={async (event) => {
          event.preventDefault();
          setLoading(true);
          setError("");
          try {
            const review = await apiFetch<Review>("/reviews/", {
              method: "POST",
              body: JSON.stringify({
                listing: listing.id,
                rating: Number(form.rating),
                comment: form.comment,
              }),
            });
            setReviews((current) => [review, ...current]);
            setForm({ rating: "5", comment: "" });
          } catch (submitError) {
            setError(submitError instanceof Error ? submitError.message : "Unable to submit review.");
          } finally {
            setLoading(false);
          }
        }}
      >
        <div className="split">
          <label className="field">
            <span>Rating</span>
            <select className="input" value={form.rating} onChange={(event) => setForm({ ...form, rating: event.target.value })}>
              {[5, 4, 3, 2, 1].map((value) => (
                <option key={value} value={value}>
                  {value} star{value === 1 ? "" : "s"}
                </option>
              ))}
            </select>
          </label>
          <div className="field">
            <span>Listing</span>
            <div className="badge">{listing.title}</div>
          </div>
        </div>
        <label className="field">
          <span>Comment</span>
          <textarea
            className="textarea"
            rows={4}
            value={form.comment}
            onChange={(event) => setForm({ ...form, comment: event.target.value })}
            placeholder="Tell future guests what stood out."
          />
        </label>
        {error ? <p className="form-error">{error}</p> : null}
        <button type="submit" className="button button-solid" disabled={loading}>
          {loading ? "Publishing..." : "Post review"}
        </button>
      </form>
    </section>
  );
}
