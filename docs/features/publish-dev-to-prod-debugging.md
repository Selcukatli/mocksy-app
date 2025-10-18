# Debugging Publish to Production Feature

## Overview

This guide helps you debug the app publishing process from dev to production using the comprehensive logging system.

## Log Symbols

- 🚀 **[PUBLISH]** - Starting/sending from dev
- ✓ Success markers
- ✗ Error markers  
- ⊘ Skipped items
- 📤 Sending to prod
- 📥 Response from prod
- 🎯 **[RECEIVE]** - Receiving in prod
- 📝 Database operations
- 🎉 Success completion

## Viewing Logs

### Dev Deployment Logs (Source)

1. Go to https://dashboard.convex.dev
2. Select your **DEV** deployment
3. Click **Logs** tab
4. Filter for `[PUBLISH]` to see source-side logs

Look for:
- `🚀 [PUBLISH] Starting publish to prod for app:` - Request initiated
- `✓ [PUBLISH] Profile verified:` - Auth successful
- `✓ [PUBLISH] Prod URL configured:` - Environment set up correctly
- `✓ [PUBLISH] App loaded:` - App data retrieved
- `✓ [PUBLISH] Icon encoded, size:` - Icon transfer prep
- `✓ [PUBLISH] Cover encoded, size:` - Cover transfer prep
- `✓ [PUBLISH] Screen encoded:` - Each screen prep
- `📤 [PUBLISH] Sending HTTP request to prod:` - About to send
- `📥 [PUBLISH] Response status:` - Got response from prod
- `✓ [PUBLISH] Success response:` - Full success

### Production Deployment Logs (Destination)

1. Go to https://dashboard.convex.dev
2. Select your **PROD** deployment (energized-orca-703)
3. Click **Logs** tab
4. Filter for `[RECEIVE]` to see destination-side logs

Look for:
- `🎯 [RECEIVE] Received publish request from dev` - Request arrived
- `🎯 [RECEIVE] App name:` - App being created
- `✓ [RECEIVE] Profile found:` - Auth successful
- `✓ [RECEIVE] Icon stored:` - Icon saved to storage
- `✓ [RECEIVE] Cover stored:` - Cover saved to storage
- `📝 [RECEIVE] Creating app via internal mutation...` - App creation started
- `✓ [RECEIVE] App created with ID:` - App created successfully
- `✓ [RECEIVE] Screen created:` - Each screen created
- `🎉 [RECEIVE] Success!` - Full success

## Common Issues and What to Look For

### Issue: "Successfully Published" but no app in prod

**Check Dev Logs:**
1. Look for `📥 [PUBLISH] Response status:` - Is it 200?
2. Look for `✓ [PUBLISH] Success response:` - What does the response say?

**Check Prod Logs:**
1. Do you see ANY `[RECEIVE]` logs?
   - **No**: The request never reached prod (network/URL issue)
   - **Yes**: Continue checking...

2. Look for `✓ [RECEIVE] Profile found:`
   - **Missing**: Authentication failed in prod
   - **Present**: Auth worked

3. Look for `✓ [RECEIVE] App created with ID:`
   - **Missing**: Database insertion failed
   - **Present**: App was created!

4. Check the app ID in the success log and search for it in prod dashboard

### Issue: Authentication Error in Prod

**Symptoms:**
- `✗ [RECEIVE] No admin profile found in prod deployment`
- `⚠️ [RECEIVE] Admin with userId X not found, using fallback admin`

**How It Works:**
The system tries to match the admin from dev to prod using their Clerk `userId`:
1. Dev sends the admin's `userId` with the request
2. Prod looks up an admin profile with that same `userId`
3. If found, app is owned by the same person in both environments
4. If not found, falls back to any admin profile in prod

**Solution:**
Make sure the admin user has an account in BOTH dev and prod deployments:
1. The same Clerk account should work for both
2. The user must be marked as admin in both deployments
3. Check in prod dashboard: Data → profiles → verify your admin has `isAdmin: true`

**If you see the fallback message:**
- The app will still be created, but owned by a different admin
- This is okay for demo purposes
- For proper ownership, ensure the same admin exists in prod

### Issue: Network/Connection Error

**Symptoms:**
- `✗ [PUBLISH] Error publishing app to prod: Failed to fetch`
- No `[RECEIVE]` logs in prod at all

**Check:**
1. Verify `CONVEX_PROD_URL` is correct: `https://energized-orca-703.convex.cloud`
2. Check network connectivity
3. Verify prod deployment is running

### Issue: Image Transfer Failed

**Symptoms:**
- `✗ [PUBLISH] Failed to fetch icon/cover/screen:`

**Check:**
1. Are the storage URLs accessible?
2. Are the images too large?
3. Network timeout?

### Issue: Partial Success (Some Screens Fail)

**Symptoms:**
- `✓ [PUBLISH] Successfully encoded X of Y screens` - X < Y

**Check:**
1. Dev logs for specific screen errors
2. Image file sizes
3. Encoding failures

## Testing the Logs

1. **Try publishing an app**
2. **Open two browser tabs:**
   - Tab 1: Dev deployment logs
   - Tab 2: Prod deployment logs
3. **Watch in real-time** as the logs appear
4. **Compare the flow:**
   - Dev should show all PUBLISH steps
   - Prod should show all RECEIVE steps
   - They should match up

## Next Steps Based on Logs

### If request never reaches prod:
- Check `CONVEX_PROD_URL` environment variable
- Verify network access
- Check prod deployment health

### If auth fails in prod:
- Implement token passing in HTTP request (see Authentication Error section above)
- This is likely the current issue

### If app creates but you don't see it:
- Check `isDemo: true` filter in prod appstore
- Look for the app by name in prod database
- Check app status (should be "published")

## Quick Debug Commands

```bash
# Check dev env var
npx convex env list

# Should show: CONVEX_PROD_URL=https://energized-orca-703.convex.cloud

# Watch logs in real-time (run in separate terminals)
npx convex logs --watch  # Dev logs
npx convex logs --watch --prod  # Prod logs
```

## Success Indicators

**In Dev Logs:**
```
🚀 [PUBLISH] Starting publish to prod for app: k17abc123
✓ [PUBLISH] Profile verified: k17xyz456
✓ [PUBLISH] Prod URL configured: https://energized-orca-703.convex.cloud
✓ [PUBLISH] App loaded: My Amazing App
✓ [PUBLISH] Icon encoded, size: 45678 chars
✓ [PUBLISH] Found 3 app screens
✓ [PUBLISH] Successfully encoded 3 of 3 screens
📤 [PUBLISH] Sending HTTP request to prod
📥 [PUBLISH] Response status: 200 OK
✓ [PUBLISH] Success response: { "success": true, "appId": "k17def789", ... }
```

**In Prod Logs:**
```
🎯 [RECEIVE] Received publish request from dev
🎯 [RECEIVE] App name: My Amazing App
✓ [RECEIVE] Profile found: k17uvw999
✓ [RECEIVE] Icon stored: kg28abc123
📝 [RECEIVE] Creating app via internal mutation...
✓ [RECEIVE] App created with ID: k17def789
📝 [RECEIVE] Creating 3 app screens...
✓ [RECEIVE] Screen created: Home Screen
✓ [RECEIVE] Screen created: Profile Screen
✓ [RECEIVE] Screen created: Settings Screen
🎉 [RECEIVE] Success! App k17def789 created with 3 screens
```

