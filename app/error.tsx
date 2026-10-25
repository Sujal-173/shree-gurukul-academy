"use client";
import { useEffect } from "react";
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error("Website error:", error); }, [error]);
  return <main className="error-page"><h1>Something went wrong.</h1><p>Please try again. If the issue continues, contact the school office.</p><button className="button button-primary" onClick={() => reset()}>Try again</button></main>;
}
