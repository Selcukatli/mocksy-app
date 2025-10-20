export type ClerkWebhookEmailAddress = {
  email_address: string;
};

export type ClerkWebhookEvent = {
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

