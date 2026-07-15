"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { login, register } from "@/lib/auth";

type Props = {
  mode: "login" | "signup";
};

export function AuthForm({ mode }: Props) {
  const router = useRouter();
  const isSignup = mode === "signup";
  const title = useMemo(
    () => (isSignup ? "Create your HamroTour account" : "Welcome back"),
    [isSignup],
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [form, setForm] = useState({
    identifier: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    city: "",
    phone: "",
    bio: "",
    isHost: false,
  });

  return (
    <div className="auth-shell">
      <div className="auth-card surface">
        <p className="eyebrow">{isSignup ? "Join HamroTour" : "Sign in"}</p>
        <h1>{title}</h1>
        <p className="muted">
          {isSignup
            ? "Create an account to book stays, save wishlists, and list your own places."
            : "Pick up where you left off and keep planning your next trip."}
        </p>

        <form
          className="form-grid"
          onSubmit={async (event) => {
            event.preventDefault();
            setLoading(true);
            setError("");
            try {
              if (isSignup) {
                const payload = new FormData();
                payload.append("username", form.username);
                payload.append("email", form.email);
                payload.append("password", form.password);
                payload.append("confirm_password", form.confirmPassword);
                payload.append("first_name", form.firstName);
                payload.append("last_name", form.lastName);
                payload.append("city", form.city);
                payload.append("phone", form.phone);
                payload.append("bio", form.bio);
                payload.append("is_host", String(form.isHost));
                if (avatar) {
                  payload.append("avatar", avatar);
                }
                await register(payload);
                router.push("/profile");
              } else {
                await login(form.identifier, form.password);
                router.push("/");
              }
            } catch (submitError) {
              setError(submitError instanceof Error ? submitError.message : "Something went wrong.");
            } finally {
              setLoading(false);
            }
          }}
        >
          {!isSignup ? (
            <label className="field">
              <span>Username or email</span>
              <input
                className="input"
                value={form.identifier}
                onChange={(event) => setForm({ ...form, identifier: event.target.value })}
                placeholder="yourname or you@example.com"
                required
              />
            </label>
          ) : (
            <>
              <div className="split">
                <label className="field">
                  <span>Username</span>
                  <input
                    className="input"
                    value={form.username}
                    onChange={(event) => setForm({ ...form, username: event.target.value })}
                    required
                  />
                </label>
                <label className="field">
                  <span>Email</span>
                  <input
                    className="input"
                    type="email"
                    value={form.email}
                    onChange={(event) => setForm({ ...form, email: event.target.value })}
                    required
                  />
                </label>
              </div>
              <div className="split">
                <label className="field">
                  <span>First name</span>
                  <input
                    className="input"
                    value={form.firstName}
                    onChange={(event) => setForm({ ...form, firstName: event.target.value })}
                  />
                </label>
                <label className="field">
                  <span>Last name</span>
                  <input
                    className="input"
                    value={form.lastName}
                    onChange={(event) => setForm({ ...form, lastName: event.target.value })}
                  />
                </label>
              </div>
              <div className="split">
                <label className="field">
                  <span>City</span>
                  <input
                    className="input"
                    value={form.city}
                    onChange={(event) => setForm({ ...form, city: event.target.value })}
                  />
                </label>
                <label className="field">
                  <span>Phone</span>
                  <input
                    className="input"
                    value={form.phone}
                    onChange={(event) => setForm({ ...form, phone: event.target.value })}
                  />
                </label>
              </div>
              <label className="field">
                <span>Short bio</span>
                <textarea
                  className="textarea"
                  rows={4}
                  value={form.bio}
                  onChange={(event) => setForm({ ...form, bio: event.target.value })}
                />
              </label>
              <label className="field">
                <span>Profile photo</span>
                <input
                  className="input"
                  type="file"
                  accept="image/*"
                  onChange={(event) => setAvatar(event.target.files?.[0] || null)}
                />
              </label>
              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={form.isHost}
                  onChange={(event) => setForm({ ...form, isHost: event.target.checked })}
                />
                <span>Yes, I want to host listings too</span>
              </label>
            </>
          )}

          <label className="field">
            <span>Password</span>
            <input
              className="input"
              type="password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              required
            />
          </label>

          {isSignup ? (
            <label className="field">
              <span>Confirm password</span>
              <input
                className="input"
                type="password"
                value={form.confirmPassword}
                onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })}
                required
              />
            </label>
          ) : null}

          {error ? <p className="form-error">{error}</p> : null}

          <button className="button button-solid button-wide" type="submit" disabled={loading}>
            {loading ? "Please wait..." : isSignup ? "Create account" : "Sign in"}
          </button>
        </form>

        <p className="muted auth-switch">
          {isSignup ? "Already have an account?" : "Need an account?"}{" "}
          <Link href={isSignup ? "/login" : "/signup"}>{isSignup ? "Log in" : "Create one"}</Link>
        </p>
      </div>
    </div>
  );
}
