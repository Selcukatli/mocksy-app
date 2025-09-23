/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as appScreens from "../appScreens.js";
import type * as apps from "../apps.js";
import type * as fileStorage_fileActions from "../fileStorage/fileActions.js";
import type * as fileStorage_fileQueries from "../fileStorage/fileQueries.js";
import type * as fileStorage_fileUploads from "../fileStorage/fileUploads.js";
import type * as http from "../http.js";
import type * as profiles from "../profiles.js";
import type * as screenshotSets from "../screenshotSets.js";
import type * as screenshots from "../screenshots.js";
import type * as webhooks from "../webhooks.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  appScreens: typeof appScreens;
  apps: typeof apps;
  "fileStorage/fileActions": typeof fileStorage_fileActions;
  "fileStorage/fileQueries": typeof fileStorage_fileQueries;
  "fileStorage/fileUploads": typeof fileStorage_fileUploads;
  http: typeof http;
  profiles: typeof profiles;
  screenshotSets: typeof screenshotSets;
  screenshots: typeof screenshots;
  webhooks: typeof webhooks;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
