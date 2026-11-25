import { notFound } from "next/navigation";

// Disable the Sentry example page to prevent visitors
// from intentionally triggering application errors.
export default function Page() {
  notFound();
}
