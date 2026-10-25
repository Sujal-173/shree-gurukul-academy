"use client";

import { useState, type FormEvent } from "react";

export function AdminLoginForm() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    try {
      const response = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const result = await response.json() as { error?: string; redirect?: string };
      if (!response.ok) throw new Error(result.error || "Sign in failed.");
      window.location.assign(result.redirect || "/admin");
    } catch (err) { setError(err instanceof Error ? err.message : "Unable to sign in."); }
    finally { setBusy(false); }
  }
  return <form className="login-form" onSubmit={submit}>
    <div className="form-field"><label htmlFor="admin-email">Admin email</label><input id="admin-email" name="email" required type="email" maxLength={254} autoComplete="username" placeholder="admin@example.com"/></div>
    <div className="form-field"><label htmlFor="admin-password">Password</label><input id="admin-password" name="password" required type="password" maxLength={256} autoComplete="current-password" placeholder="Enter your password"/></div>
    {error && <p className="form-feedback error" role="alert">{error}</p>}
    <button className="button button-primary submit-button" type="submit" disabled={busy}>{busy ? "Signing in…" : "Sign in securely"}</button>
    <p className="form-note">Access is limited to the server-configured admin account. Public registration is disabled.</p>
  </form>;
}
