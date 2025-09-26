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
import type * as templateScreenshots from "../templateScreenshots.js";
import type * as templateVariants from "../templateVariants.js";
import type * as templates from "../templates.js";
import type * as utils_aisdk_aiModels from "../utils/aisdk/aiModels.js";
import type * as utils_aisdk_aiSdkActions from "../utils/aisdk/aiSdkActions.js";
import type * as utils_aisdk_aiSdkClient from "../utils/aisdk/aiSdkClient.js";
import type * as utils_aisdk_aiSdkStreamClient from "../utils/aisdk/aiSdkStreamClient.js";
import type * as utils_aisdk_index from "../utils/aisdk/index.js";
import type * as utils_aisdk_openaiDirect from "../utils/aisdk/openaiDirect.js";
import type * as utils_aisdk_test_testAiSdkActions from "../utils/aisdk/test/testAiSdkActions.js";
import type * as utils_aisdk_test_testGpt5Direct from "../utils/aisdk/test/testGpt5Direct.js";
import type * as utils_aisdk_types from "../utils/aisdk/types.js";
import type * as utils_fal_clients_falImageClient from "../utils/fal/clients/falImageClient.js";
import type * as utils_fal_clients_fluxImageClient from "../utils/fal/clients/fluxImageClient.js";
import type * as utils_fal_clients_fluxProUltraClient from "../utils/fal/clients/fluxProUltraClient.js";
import type * as utils_fal_clients_geminiImageClient from "../utils/fal/clients/geminiImageClient.js";
import type * as utils_fal_clients_gptImageClient from "../utils/fal/clients/gptImageClient.js";
import type * as utils_fal_clients_imagenImageClient from "../utils/fal/clients/imagenImageClient.js";
import type * as utils_fal_clients_kontextImageClient from "../utils/fal/clients/kontextImageClient.js";
import type * as utils_fal_clients_nanoBananaClient from "../utils/fal/clients/nanoBananaClient.js";
import type * as utils_fal_clients_qwenImageClient from "../utils/fal/clients/qwenImageClient.js";
import type * as utils_fal_falImageActions from "../utils/fal/falImageActions.js";
import type * as utils_fal_index from "../utils/fal/index.js";
import type * as utils_fal_test_testImageActions from "../utils/fal/test/testImageActions.js";
import type * as utils_fal_types from "../utils/fal/types.js";
import type * as utils_logger from "../utils/logger.js";
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
  templateScreenshots: typeof templateScreenshots;
  templateVariants: typeof templateVariants;
  templates: typeof templates;
  "utils/aisdk/aiModels": typeof utils_aisdk_aiModels;
  "utils/aisdk/aiSdkActions": typeof utils_aisdk_aiSdkActions;
  "utils/aisdk/aiSdkClient": typeof utils_aisdk_aiSdkClient;
  "utils/aisdk/aiSdkStreamClient": typeof utils_aisdk_aiSdkStreamClient;
  "utils/aisdk/index": typeof utils_aisdk_index;
  "utils/aisdk/openaiDirect": typeof utils_aisdk_openaiDirect;
  "utils/aisdk/test/testAiSdkActions": typeof utils_aisdk_test_testAiSdkActions;
  "utils/aisdk/test/testGpt5Direct": typeof utils_aisdk_test_testGpt5Direct;
  "utils/aisdk/types": typeof utils_aisdk_types;
  "utils/fal/clients/falImageClient": typeof utils_fal_clients_falImageClient;
  "utils/fal/clients/fluxImageClient": typeof utils_fal_clients_fluxImageClient;
  "utils/fal/clients/fluxProUltraClient": typeof utils_fal_clients_fluxProUltraClient;
  "utils/fal/clients/geminiImageClient": typeof utils_fal_clients_geminiImageClient;
  "utils/fal/clients/gptImageClient": typeof utils_fal_clients_gptImageClient;
  "utils/fal/clients/imagenImageClient": typeof utils_fal_clients_imagenImageClient;
  "utils/fal/clients/kontextImageClient": typeof utils_fal_clients_kontextImageClient;
  "utils/fal/clients/nanoBananaClient": typeof utils_fal_clients_nanoBananaClient;
  "utils/fal/clients/qwenImageClient": typeof utils_fal_clients_qwenImageClient;
  "utils/fal/falImageActions": typeof utils_fal_falImageActions;
  "utils/fal/index": typeof utils_fal_index;
  "utils/fal/test/testImageActions": typeof utils_fal_test_testImageActions;
  "utils/fal/types": typeof utils_fal_types;
  "utils/logger": typeof utils_logger;
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
