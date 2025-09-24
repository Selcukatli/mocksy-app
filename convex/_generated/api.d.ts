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
import type * as fileStorage_base64Files from "../fileStorage/base64Files.js";
import type * as fileStorage_files from "../fileStorage/files.js";
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
  "fileStorage/base64Files": typeof fileStorage_base64Files;
  "fileStorage/files": typeof fileStorage_files;
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
