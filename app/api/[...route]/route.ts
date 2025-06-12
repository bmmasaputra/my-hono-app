import { Hono } from "hono";
import { handle } from "hono/vercel";
import { factory } from "../factory";
import authApp from "../auth";
import contactApp from "../contact";
import { logger } from "hono/logger";

const api = factory
  .createApp()
  .route("/auth", authApp)
  .route("/contact", contactApp);

// Apply logger middleware to the API routes
api.use("*", logger());

// Create a base app and mount api at /api
const baseApp = new Hono();
baseApp.route("/api", api);

export const GET = handle(baseApp);
export const POST = handle(baseApp);
export const PUT = handle(baseApp);
export const DELETE = handle(baseApp);
export const PATCH = handle(baseApp);
