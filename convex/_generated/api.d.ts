/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as authGuard from "../authGuard.js";
import type * as locations from "../locations.js";
import type * as nurseries from "../nurseries.js";
import type * as pokmaswas from "../pokmaswas.js";
import type * as profiles from "../profiles.js";
import type * as siteConfig from "../siteConfig.js";
import type * as stats from "../stats.js";
import type * as surveyPhotos from "../surveyPhotos.js";
import type * as surveys from "../surveys.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  authGuard: typeof authGuard;
  locations: typeof locations;
  nurseries: typeof nurseries;
  pokmaswas: typeof pokmaswas;
  profiles: typeof profiles;
  siteConfig: typeof siteConfig;
  stats: typeof stats;
  surveyPhotos: typeof surveyPhotos;
  surveys: typeof surveys;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
