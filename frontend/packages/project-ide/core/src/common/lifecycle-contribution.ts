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

/* eslint-disable @typescript-eslint/method-signature-style */
import { type MaybePromise } from '@flowgram-adapter/common';

export const LifecycleContribution = Symbol('LifecycleContribution');
/**
 * IDE Global Lifecycle Registration
 */
export interface LifecycleContribution {
  /**
   * IDE registration phase
   */
  onInit?(): void;
  /**
   * IDE loading phase, generally used to load global configuration, such as i18n data
   */
  onLoading?(): MaybePromise<void>;
  /**
   * IDE layout initialization phase, executed after onLoading
   */
  onLayoutInit?(): MaybePromise<void>;
  /**
   * The IDE starts to execute and the business logic can be loaded
   */
  onStart?(): MaybePromise<void>;
  /**
   * Execute before the browser'beforeunload ', if it returns true, it will be blocked
   */
  onWillDispose?(): boolean | void;
  /**
   * IDE destruction
   */
  onDispose?(): void;
}
