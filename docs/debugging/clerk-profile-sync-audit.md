# Clerk Profile Sync Audit - October 19, 2025

## Issue Report

**User**: selcuk@bunch.live  
**User ID**: `user_34JHELpTPQl2hbNeTE7GGhM9LRp`  
**Issue**: Profile created in Convex database but missing `firstName` and `lastName` fields

## Webhook Payload Analysis

The Clerk webhook payload for user.created event **DID** contain the required fields:

```json
{
  "type": "user.created",
  "data": {
    "id": "user_34JHELpTPQl2hbNeTE7GGhM9LRp",
    "first_name": "Selcuk",  // ✅ Present
    "last_name": "Atli",     // ✅ Present
    "username": null,
    "email_addresses": [...],
    "image_url": "...",
    "profile_image_url": "..."
  }
}
```

## Code Analysis

### Current Implementation (convex/http.ts)

The webhook handler correctly extracts and passes all fields:

```typescript
const {
  id,
  username,
  image_url,
  profile_image_url,
  email_addresses,
  first_name,    // ✅ Extracted
  last_name,     // ✅ Extracted
} = evt.data;

await ctx.runMutation(internal.webhooks.upsertUserFromClerk, {
  userId: id,
  username: displayUsername,
  firstName: first_name ?? undefined,   // ✅ Passed
  lastName: last_name ?? undefined,     // ✅ Passed
  imageUrl: userImageUrl,
});
```

### Mutation Implementation (convex/webhooks.ts)

The mutation accepts and stores all fields:

```typescript
export const upsertUserFromClerk = internalMutation({
  args: {
    userId: v.string(),
    username: v.optional(v.string()),
    firstName: v.optional(v.string()),   // ✅ Defined
    lastName: v.optional(v.string()),    // ✅ Defined
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("profiles", {
      userId: args.userId,
      username: args.username,
      firstName: args.firstName,         // ✅ Stored
      lastName: args.lastName,           // ✅ Stored
      imageUrl: args.imageUrl,
      // ... other fields
    });
  },
});
```

## Root Cause Hypothesis

Since the code is correct, the issue is likely:

1. **Webhook not executing** - The webhook may have failed silently
2. **Profile created by client-side sync** - ProfileProvider only syncs username & imageUrl
3. **Missing logging** - No visibility into what's happening

## Debugging Improvements Made

### 1. Enhanced HTTP Endpoint Logging

Added detailed logging in `convex/http.ts`:

```typescript
console.log("📋 Extracted webhook data:", {
  id,
  username,
  first_name,
  last_name,
  image_url: image_url ? "present" : "null",
  profile_image_url: profile_image_url ? "present" : "null",
});

console.log("🔄 Calling upsertUserFromClerk with:", {
  userId: id,
  username: displayUsername,
  firstName: first_name ?? undefined,
  lastName: last_name ?? undefined,
  imageUrl: userImageUrl ? "present" : undefined,
});

try {
  await ctx.runMutation(internal.webhooks.upsertUserFromClerk, { /* ... */ });
  console.log("✅ Successfully called upsertUserFromClerk");
} catch (error) {
  console.error("❌ Error calling upsertUserFromClerk:", error);
  throw error;
}
```

### 2. Enhanced Mutation Logging

Added detailed logging in `convex/webhooks.ts`:

```typescript
console.log("🔵 upsertUserFromClerk called with args:", {
  userId: args.userId,
  username: args.username,
  firstName: args.firstName,
  lastName: args.lastName,
  imageUrl: args.imageUrl ? "present" : undefined,
});

console.log("🔍 Existing profile found:", existingProfile ? "YES" : "NO");

console.log("🔄 Change detection:", {
  usernameChanged,
  firstNameChanged,
  lastNameChanged,
  imageUrlChanged,
});

console.log("➕ Creating new profile with data:", { /* ... */ });
console.log(`✅ Created profile for user ${args.userId} with ID ${profileId}`);
```

## Most Likely Scenario

Based on the investigation, **the profile was likely created by the ProfileProvider (client-side sync), not the webhook**.

### Evidence:

1. **No webhook logs found** in Convex logs
2. **ProfileProvider only syncs username & imageUrl** (lines 63-67 in profile-provider.tsx):
   ```typescript
   ensureProfile({
     username: clerkUsername,
     imageUrl: clerkImageUrl,
     // ❌ firstName and lastName NOT passed
   });
   ```

3. **Profile exists but missing firstName/lastName** - consistent with client-side creation

## Solution

### Option 1: Fix ProfileProvider (Recommended)

Update `profile-provider.tsx` to sync all fields from Clerk:

```typescript
ensureProfile({
  username: user.username || undefined,
  firstName: user.firstName || undefined,     // ✅ Add
  lastName: user.lastName || undefined,       // ✅ Add
  imageUrl: user.imageUrl || undefined,
});
```

### Option 2: Trigger Manual Sync

For existing user, trigger a webhook resend from Clerk dashboard or call:

```typescript
// In Convex dashboard or via mutation
await ctx.runMutation(api.profiles.syncMyProfileFromClerk, {});
```

### Option 3: Database Patch (Immediate Fix)

Manually patch the profile:

```typescript
// In Convex dashboard
const profile = await ctx.db
  .query("profiles")
  .withIndex("by_user_id", (q) => q.eq("userId", "user_34JHELpTPQl2hbNeTE7GGhM9LRp"))
  .first();

await ctx.db.patch(profile._id, {
  firstName: "Selcuk",
  lastName: "Atli",
  updatedAt: Date.now(),
});
```

## Next Steps

1. ✅ **Added comprehensive logging** to both webhook and mutation
2. ⏳ **Trigger new webhook** from Clerk to test improved logging
3. ⏳ **Update ProfileProvider** to sync firstName/lastName
4. ⏳ **Update ensureCurrentUserProfile mutation** to accept firstName/lastName args
5. ⏳ **Document the fix** in clerk-convex-setup.mdc

## Testing Plan

1. Send test webhook from Clerk dashboard
2. Monitor Convex logs for:
   - "📋 Extracted webhook data:" 
   - "🔄 Calling upsertUserFromClerk with:"
   - "🔵 upsertUserFromClerk called with args:"
   - "✅ Created profile for user..." or "✅ Updated profile for user..."
3. Verify profile in database has all fields

## Log Patterns to Watch For

**Success Pattern:**
```
Webhook with ID msg_xxx and type user.created
📋 Extracted webhook data: {...}
🔄 Calling upsertUserFromClerk with: {...}
🔵 upsertUserFromClerk called with args: {...}
🔍 Existing profile found: NO
➕ Creating new profile with data: {...}
✅ Created profile for user xxx with ID xxx
✅ Successfully called upsertUserFromClerk
```

**Failure Pattern:**
```
Webhook with ID msg_xxx and type user.created
📋 Extracted webhook data: {...}
🔄 Calling upsertUserFromClerk with: {...}
❌ Error calling upsertUserFromClerk: [error details]
```

## Conclusion

The webhook code is correct and should work. The improved logging will reveal:
- Whether webhooks are executing at all
- What data is being passed at each step
- Any errors occurring during the process

Once we see the new logs from the next webhook event, we'll know exactly what's happening.

