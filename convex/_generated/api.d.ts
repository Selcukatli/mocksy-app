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
import type * as testBaml from "../testBaml.js";
import type * as utils_aisdk_aiModels from "../utils/aisdk/aiModels.js";
import type * as utils_aisdk_aiSdkActions from "../utils/aisdk/aiSdkActions.js";
import type * as utils_aisdk_aiSdkClient from "../utils/aisdk/aiSdkClient.js";
import type * as utils_aisdk_aiSdkStreamClient from "../utils/aisdk/aiSdkStreamClient.js";
import type * as utils_aisdk_index from "../utils/aisdk/index.js";
import type * as utils_aisdk_openaiDirect from "../utils/aisdk/openaiDirect.js";
import type * as utils_aisdk_test_testAiSdkActions from "../utils/aisdk/test/testAiSdkActions.js";
import type * as utils_aisdk_test_testGpt5Direct from "../utils/aisdk/test/testGpt5Direct.js";
import type * as utils_aisdk_types from "../utils/aisdk/types.js";
import type * as utils_fal_clients_falClient from "../utils/fal/clients/falClient.js";
import type * as utils_fal_clients_image_fluxImageClient from "../utils/fal/clients/image/fluxImageClient.js";
import type * as utils_fal_clients_image_fluxProUltraClient from "../utils/fal/clients/image/fluxProUltraClient.js";
import type * as utils_fal_clients_image_fluxSrpoClient from "../utils/fal/clients/image/fluxSrpoClient.js";
import type * as utils_fal_clients_image_geminiImageClient from "../utils/fal/clients/image/geminiImageClient.js";
import type * as utils_fal_clients_image_gptImageClient from "../utils/fal/clients/image/gptImageClient.js";
import type * as utils_fal_clients_image_imageModels from "../utils/fal/clients/image/imageModels.js";
import type * as utils_fal_clients_image_imagenImageClient from "../utils/fal/clients/image/imagenImageClient.js";
import type * as utils_fal_clients_image_kontextImageClient from "../utils/fal/clients/image/kontextImageClient.js";
import type * as utils_fal_clients_image_qwenImageClient from "../utils/fal/clients/image/qwenImageClient.js";
import type * as utils_fal_clients_video_klingVideoClient from "../utils/fal/clients/video/klingVideoClient.js";
import type * as utils_fal_clients_video_lucyVideoClient from "../utils/fal/clients/video/lucyVideoClient.js";
import type * as utils_fal_clients_video_seeDanceVideoClient from "../utils/fal/clients/video/seeDanceVideoClient.js";
import type * as utils_fal_clients_video_videoModels from "../utils/fal/clients/video/videoModels.js";
import type * as utils_fal_falImageActions from "../utils/fal/falImageActions.js";
import type * as utils_fal_falVideoActions from "../utils/fal/falVideoActions.js";
import type * as utils_fal_index from "../utils/fal/index.js";
import type * as utils_fal_test_testComprehensiveImage from "../utils/fal/test/testComprehensiveImage.js";
import type * as utils_fal_test_testComprehensiveVideo from "../utils/fal/test/testComprehensiveVideo.js";
import type * as utils_fal_test_testFalModelIds from "../utils/fal/test/testFalModelIds.js";
import type * as utils_fal_test_testFluxSrpo from "../utils/fal/test/testFluxSrpo.js";
import type * as utils_fal_test_testUnifiedAPI from "../utils/fal/test/testUnifiedAPI.js";
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
  testBaml: typeof testBaml;
  "utils/aisdk/aiModels": typeof utils_aisdk_aiModels;
  "utils/aisdk/aiSdkActions": typeof utils_aisdk_aiSdkActions;
  "utils/aisdk/aiSdkClient": typeof utils_aisdk_aiSdkClient;
  "utils/aisdk/aiSdkStreamClient": typeof utils_aisdk_aiSdkStreamClient;
  "utils/aisdk/index": typeof utils_aisdk_index;
  "utils/aisdk/openaiDirect": typeof utils_aisdk_openaiDirect;
  "utils/aisdk/test/testAiSdkActions": typeof utils_aisdk_test_testAiSdkActions;
  "utils/aisdk/test/testGpt5Direct": typeof utils_aisdk_test_testGpt5Direct;
  "utils/aisdk/types": typeof utils_aisdk_types;
  "utils/fal/clients/falClient": typeof utils_fal_clients_falClient;
  "utils/fal/clients/image/fluxImageClient": typeof utils_fal_clients_image_fluxImageClient;
  "utils/fal/clients/image/fluxProUltraClient": typeof utils_fal_clients_image_fluxProUltraClient;
  "utils/fal/clients/image/fluxSrpoClient": typeof utils_fal_clients_image_fluxSrpoClient;
  "utils/fal/clients/image/geminiImageClient": typeof utils_fal_clients_image_geminiImageClient;
  "utils/fal/clients/image/gptImageClient": typeof utils_fal_clients_image_gptImageClient;
  "utils/fal/clients/image/imageModels": typeof utils_fal_clients_image_imageModels;
  "utils/fal/clients/image/imagenImageClient": typeof utils_fal_clients_image_imagenImageClient;
  "utils/fal/clients/image/kontextImageClient": typeof utils_fal_clients_image_kontextImageClient;
  "utils/fal/clients/image/qwenImageClient": typeof utils_fal_clients_image_qwenImageClient;
  "utils/fal/clients/video/klingVideoClient": typeof utils_fal_clients_video_klingVideoClient;
  "utils/fal/clients/video/lucyVideoClient": typeof utils_fal_clients_video_lucyVideoClient;
  "utils/fal/clients/video/seeDanceVideoClient": typeof utils_fal_clients_video_seeDanceVideoClient;
  "utils/fal/clients/video/videoModels": typeof utils_fal_clients_video_videoModels;
  "utils/fal/falImageActions": typeof utils_fal_falImageActions;
  "utils/fal/falVideoActions": typeof utils_fal_falVideoActions;
  "utils/fal/index": typeof utils_fal_index;
  "utils/fal/test/testComprehensiveImage": typeof utils_fal_test_testComprehensiveImage;
  "utils/fal/test/testComprehensiveVideo": typeof utils_fal_test_testComprehensiveVideo;
  "utils/fal/test/testFalModelIds": typeof utils_fal_test_testFalModelIds;
  "utils/fal/test/testFluxSrpo": typeof utils_fal_test_testFluxSrpo;
  "utils/fal/test/testUnifiedAPI": typeof utils_fal_test_testUnifiedAPI;
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
