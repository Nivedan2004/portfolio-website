import * as Sentry from "@sentry/nextjs";
import { connection } from "next/server";

// Custom error for testing IncidentPing
class DatabaseConnectionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DatabaseConnectionError";
  }
}

// Development-only route for testing automatic incident alerts
export async function GET() {
  await connection();

  // Prevent intentional errors in production
  if (process.env.NODE_ENV !== "development") {
    return new Response("Not Found", { status: 404 });
  }

  // Simulate a database connection failure
  const error = new DatabaseConnectionError(
    "Simulated database connection timeout after 5000ms.",
  );

  // Use a separate fingerprint to create a new Sentry issue
  Sentry.captureException(error, {
    fingerprint: ["incidentping-database-timeout-v4"],
    tags: {
      component: "database",
      source: "incidentping-test",
    },
  });

  // Allow Sentry to transmit the event
  await Sentry.flush(2000);

  return new Response("Simulated Internal Server Error", {
    status: 500,
  });
}
