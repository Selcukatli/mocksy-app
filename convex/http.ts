import { httpRouter } from "convex/server";
import { handleClerkWebhook } from "./webhooks/clerk/handler";

const http = httpRouter();

// Webhook endpoint for Clerk
http.route({
  path: "/webhooks/clerk",
  method: "POST",
  handler: handleClerkWebhook,
});

export default http;
