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

import {
  type Disposable,
  type MaybePromise,
  type Event,
} from '@flowgram-adapter/common';

import { type URI, type URIHandler } from '../common';

export interface ResourceInfo {
  displayName?: string; // Show title
  lastModification?: number | string; // Last modification time
  version?: number | string;
}
export interface Resource<T = any, INFO extends ResourceInfo = ResourceInfo>
  extends Disposable {
  readonly uri: URI;
  getInfo: () => MaybePromise<INFO>;
  updateInfo: (info: INFO) => void;
  readContent: () => MaybePromise<T>;
  saveContent: (content: T) => MaybePromise<void>;
  onInfoChange: Event<INFO>;
  onContentChange: Event<T>;
  onDispose: Event<void>;
}

export class ResourceError extends Error {
  static NotFound = -40000;

  static OutOfSync = -40001;

  static is(error: object | undefined, code: number): error is ResourceError {
    return error instanceof ResourceError && error.code === code;
  }

  constructor(
    readonly message: string,
    readonly code: number,
    readonly uri: URI,
  ) {
    super(message);
  }
}

export const ResourceHandler = Symbol('ResourceHandler');

export interface ResourceHandler<T extends Resource = Resource>
  extends URIHandler {
  /**
   * Create a resource
   * @param uri
   */
  resolve: (uri: URI) => T;
}
