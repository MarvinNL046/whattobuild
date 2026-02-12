/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as actions_email from "../actions/email.js";
import type * as actions_monitoring from "../actions/monitoring.js";
import type * as actions_regenerate from "../actions/regenerate.js";
import type * as actions_research from "../actions/research.js";
import type * as credits from "../credits.js";
import type * as crons from "../crons.js";
import type * as lib_auth from "../lib/auth.js";
import type * as monitoredNiches from "../monitoredNiches.js";
import type * as queries from "../queries.js";
import type * as results from "../results.js";
import type * as savedIdeas from "../savedIdeas.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "actions/email": typeof actions_email;
  "actions/monitoring": typeof actions_monitoring;
  "actions/regenerate": typeof actions_regenerate;
  "actions/research": typeof actions_research;
  credits: typeof credits;
  crons: typeof crons;
  "lib/auth": typeof lib_auth;
  monitoredNiches: typeof monitoredNiches;
  queries: typeof queries;
  results: typeof results;
  savedIdeas: typeof savedIdeas;
  users: typeof users;
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
