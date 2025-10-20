import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { Webhook } from "svix";
import { internal } from "./_generated/api";

type ClerkWebhookEmailAddress = {
  email_address: string;
};

type ClerkWebhookEvent = {
  type: string;
  data: {
    id: string;
    username?: string | null;
    image_url?: string | null;
    profile_image_url?: string | null;
    email_addresses?: ClerkWebhookEmailAddress[];
    first_name?: string | null;
    last_name?: string | null;
  };
};

const http = httpRouter();

// Webhook endpoint for Clerk
http.route({
  path: "/webhooks/clerk",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    // Get the webhook secret from environment variables
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

    if (!webhookSecret) {
      return new Response("Webhook secret not configured", { status: 500 });
    }

    // Get the headers
    const svixId = request.headers.get("svix-id");
    const svixTimestamp = request.headers.get("svix-timestamp");
    const svixSignature = request.headers.get("svix-signature");

    // If there are no Svix headers, error out
    if (!svixId || !svixTimestamp || !svixSignature) {
      return new Response("Error occurred -- no svix headers", { status: 400 });
    }

    // Get the body
    const payload = await request.text();

    // Create a new Svix instance with your secret
    const wh = new Webhook(webhookSecret);

    // Verify the payload with the headers
    let evt: ClerkWebhookEvent;
    try {
      evt = wh.verify(payload, {
        "svix-id": svixId,
        "svix-timestamp": svixTimestamp,
        "svix-signature": svixSignature,
      }) as ClerkWebhookEvent;
    } catch (err) {
      console.error("Error verifying webhook:", err);
      return new Response("Error occurred", { status: 400 });
    }

    // Handle the webhook event
    const eventType = evt.type;
    console.log(`Webhook with ID ${svixId} and type ${eventType}`);
    console.log("Webhook body:", evt.data);

    // Handle user events
    switch (eventType) {
      case "user.created":
      case "user.updated": {
        const {
          id,
          username,
          image_url,
          profile_image_url,
          email_addresses,
          first_name,
          last_name,
        } = evt.data;

        console.log("📋 Extracted webhook data:", {
          id,
          username,
          first_name,
          last_name,
          image_url: image_url ? "present" : "null",
          profile_image_url: profile_image_url ? "present" : "null",
        });

        // Build username from available data
        let displayUsername: string | undefined = username ?? undefined;
        if (!displayUsername && first_name && last_name) {
          displayUsername = `${first_name} ${last_name}`;
        } else if (!displayUsername && first_name) {
          displayUsername = first_name;
        } else if (
          !displayUsername &&
          email_addresses &&
          email_addresses.length > 0
        ) {
          displayUsername = email_addresses[0].email_address.split("@")[0];
        }

        // Use profile_image_url if available, fallback to image_url
        const userImageUrl = profile_image_url ?? image_url ?? undefined;

        console.log("🔄 Calling upsertUserFromClerk with:", {
          userId: id,
          username: displayUsername,
          firstName: first_name ?? undefined,
          lastName: last_name ?? undefined,
          imageUrl: userImageUrl ? "present" : undefined,
        });

        try {
          await ctx.runMutation(internal.webhooks.upsertUserFromClerk, {
            userId: id,
            username: displayUsername,
            firstName: first_name ?? undefined,
            lastName: last_name ?? undefined,
            imageUrl: userImageUrl,
          });
          console.log("✅ Successfully called upsertUserFromClerk");
        } catch (error) {
          console.error("❌ Error calling upsertUserFromClerk:", error);
          throw error;
        }
        break;
      }

      case "user.deleted": {
        const { id } = evt.data;
        await ctx.runMutation(internal.webhooks.deleteUserFromClerk, {
          userId: id,
        });
        break;
      }

      default:
        console.log(`Unhandled webhook event type: ${eventType}`);
    }

    return new Response("", { status: 200 });
  }),
});

export default http;
