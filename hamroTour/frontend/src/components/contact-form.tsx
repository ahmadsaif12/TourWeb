"use client";

import { useState } from "react";

import { apiFetch } from "@/lib/api";

export function ContactForm() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  return (
    <form
      className="surface form-grid"
      onSubmit={async (event) => {
        event.preventDefault();
        setLoading(true);
        setError("");
        setMessage("");
        try {
          await apiFetch("/contact/", {
            method: "POST",
            body: JSON.stringify(form),
          });
          setMessage("Thanks for reaching out. We'll get back to you soon.");
          setForm({ name: "", email: "", subject: "", message: "" });
        } catch (submitError) {
          setError(submitError instanceof Error ? submitError.message : "Unable to send message.");
        } finally {
          setLoading(false);
        }
      }}
    >
      <div className="section-heading compact">
        <p className="eyebrow">Support</p>
        <h1>We’d love to hear from you</h1>
      </div>

      <div className="split">
        <label className="field">
          <span>Name</span>
          <input className="input" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
        </label>
        <label className="field">
          <span>Email</span>
          <input className="input" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
        </label>
      </div>
      <label className="field">
        <span>Subject</span>
        <input className="input" value={form.subject} onChange={(event) => setForm({ ...form, subject: event.target.value })} required />
      </label>
      <label className="field">
        <span>Message</span>
        <textarea className="textarea" rows={6} value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} required />
      </label>
      {error ? <p className="form-error">{error}</p> : null}
      {message ? <p className="form-success">{message}</p> : null}
      <button type="submit" className="button button-solid button-wide" disabled={loading}>
        {loading ? "Sending..." : "Send message"}
      </button>
    </form>
  );
}
