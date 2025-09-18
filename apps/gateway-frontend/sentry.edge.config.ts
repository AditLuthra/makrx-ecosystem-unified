// This file configures the initialization of Sentry on the Edge runtime.
// The config you add here will be used whenever an Edge function is requested.
// The config you add here will be used whenever a server-side route is accessed.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || "0.1"),
  debug: process.env.NODE_ENV === "development", // Enable debug in development
  // Adjust this value in production, or use tracesSampler for greater control
  // tracesSampleRate: 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  // debug: false,
});
