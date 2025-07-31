/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/** Bot details page source: currently only bot and explore list */
export enum BotPageFromEnum {
  Bot = 'bot', //bot list
  Explore = 'explore', //Explore List
  Store = 'store',
  Template = 'template',
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- had to any
export type Obj = Record<string, any>;

/**
 * Show the full type
 *
 * @example
 * type Intersection = { a: string } & { b: number };
 * type Result = Expand<Intersection>;
 * // Result: { a: string; b: number }
 */
export type Expand<T extends Obj> = T extends infer U
  ? { [K in keyof U]: U[K] }
  : never;

/**
 * Required only for specific fields, often used to correct server level type declaration errors
 *
 * @example
 * interface Agent {
 *  id?: string;
 *  name?: string;
 *  desc?: string
 * }
 * type Result = PartialRequired<Agent, 'id' | 'name'>;
 */
export type PartialRequired<T extends Obj, K extends keyof T> = Expand<
  {
    [P in K]-?: T[P];
  } & Pick<T, Exclude<keyof T, K>>
>;
