"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { apiFetch } from "@/lib/api";
import { clearStoredAuth, getStoredAuth } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import type { Booking, Listing, Notification, User } from "@/lib/types";
import { ListingGrid } from "@/components/listing-grid";

export function ProfilePanel() {
  const [user, setUser] = useState<User | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    bio: "",
    phone: "",
    city: "",
    is_host: false,
  });
  const [avatar, setAvatar] = useState<File | null>(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      const auth = getStoredAuth();
      if (!auth?.access) {
        if (active) {
          setLoading(false);
        }
        return;
      }

      try {
        const [me, bookingData, listingData, notificationData] = await Promise.all([
          apiFetch<User>("/auth/me/"),
          apiFetch<Booking[]>("/bookings/"),
          apiFetch<Listing[]>("/listings/?mine=true"),
          apiFetch<Notification[]>("/notifications/"),
        ]);

        if (!active) {
          return;
        }

        setUser(me);
        setBookings(bookingData);
        setListings(listingData);
        setNotifications(notificationData);
        setForm({
          bio: me.bio || "",
          phone: me.phone || "",
          city: me.city || "",
          is_host: me.is_host,
        });
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "Unable to load profile.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    load();
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return <div className="surface">Loading profile...</div>;
  }

  if (!user) {
    return (
      <div className="surface inner-stack">
        <h1>Sign in to manage your profile</h1>
        <p className="muted">Your bookings, hosted stays, wishlist, and notifications all live behind your account.</p>
        <div className="button-row">
          <Link href="/login" className="button button-solid">Login</Link>
          <Link href="/signup" className="button button-ghost">Create account</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="stack">
      <section className="surface profile-hero">
        <div className="profile-avatar">
          {user.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.avatar_url} alt={user.username} />
          ) : (
            <span>{user.username.slice(0, 1).toUpperCase()}</span>
          )}
        </div>
        <div className="profile-copy">
          <p className="eyebrow">Your account</p>
          <h1>{user.username}</h1>
          <p className="muted">{user.email}</p>
          <p className="muted">{user.city || "No city set yet"}</p>
        </div>
        <button
          type="button"
          className="button button-ghost"
          onClick={async () => {
            clearStoredAuth();
            window.location.href = "/";
          }}
        >
          Logout
        </button>
      </section>

      <section className="surface">
        <div className="section-heading compact">
          <p className="eyebrow">Profile</p>
          <h2>Update your details</h2>
        </div>
        <form
          className="form-grid compact"
          onSubmit={async (event) => {
            event.preventDefault();
            setSaving(true);
            setError("");
            try {
              const payload = new FormData();
              payload.append("bio", form.bio);
              payload.append("phone", form.phone);
              payload.append("city", form.city);
              payload.append("is_host", String(form.is_host));
              if (avatar) {
                payload.append("avatar", avatar);
              }
              const updated = await apiFetch<User>("/auth/me/", {
                method: "PATCH",
                body: payload,
              });
              setUser(updated);
            } catch (submitError) {
              setError(submitError instanceof Error ? submitError.message : "Unable to update profile.");
            } finally {
              setSaving(false);
            }
          }}
        >
          <div className="split">
            <label className="field">
              <span>City</span>
              <input className="input" value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} />
            </label>
            <label className="field">
              <span>Phone</span>
              <input className="input" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
            </label>
          </div>
          <label className="field">
            <span>Bio</span>
            <textarea className="textarea" rows={4} value={form.bio} onChange={(event) => setForm({ ...form, bio: event.target.value })} />
          </label>
          <label className="field">
            <span>Avatar</span>
            <input className="input" type="file" accept="image/*" onChange={(event) => setAvatar(event.target.files?.[0] || null)} />
          </label>
          <label className="checkbox-row">
            <input type="checkbox" checked={form.is_host} onChange={(event) => setForm({ ...form, is_host: event.target.checked })} />
            <span>Host listings</span>
          </label>
          {error ? <p className="form-error">{error}</p> : null}
          <button type="submit" className="button button-solid" disabled={saving}>
            {saving ? "Updating..." : "Save profile"}
          </button>
        </form>
      </section>

      <section className="surface inner-stack">
        <div className="section-heading compact">
          <p className="eyebrow">Notifications</p>
          <h2>Recent activity</h2>
        </div>
        <div className="stack">
          {notifications.length ? (
            notifications.map((item) => (
              <article key={item.id} className="notification-item">
                <div className="listing-row">
                  <strong>{item.title}</strong>
                  <span className="muted small">{formatDate(item.created_at)}</span>
                </div>
                <p className="muted">{item.message}</p>
              </article>
            ))
          ) : (
            <p className="muted">No notifications yet.</p>
          )}
        </div>
      </section>

      <section className="surface inner-stack">
        <div className="section-heading compact">
          <p className="eyebrow">Your bookings</p>
          <h2>Trips and requests</h2>
        </div>
        <div className="stack">
          {bookings.length ? (
            bookings.map((booking) => (
              <article key={booking.id} className="booking-row">
                <div>
                  <strong>{booking.listing_detail.title}</strong>
                  <p className="muted">
                    {formatDate(booking.check_in)} to {formatDate(booking.check_out)} · {booking.guests} guest(s)
                  </p>
                </div>
                <span className="badge">{booking.status}</span>
              </article>
            ))
          ) : (
            <p className="muted">No bookings yet.</p>
          )}
        </div>
      </section>

      <section className="surface inner-stack">
        <div className="section-heading compact">
          <p className="eyebrow">Hosted stays</p>
          <h2>Your listings</h2>
        </div>
        <ListingGrid listings={listings} emptyLabel="You haven’t published any listings yet." />
      </section>
    </div>
  );
}
