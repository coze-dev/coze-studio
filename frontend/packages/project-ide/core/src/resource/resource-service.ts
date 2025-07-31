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

import { injectable, inject } from 'inversify';

import { type URI } from '../common';
import { ResourceManager } from './resource-manager';
import { type Resource } from './resource';

@injectable()
export class ResourceService {
  @inject(ResourceManager) protected resourceManager: ResourceManager;

  get<T extends Resource>(uri: URI): T {
    return this.resourceManager.get<T>(uri.withoutQuery());
  }

  get onResourceCreate() {
    return this.resourceManager.onResourceCreate;
  }

  get onResourceDispose() {
    return this.resourceManager.onResourceDispose;
  }

  getResourceListFromCache<T extends Resource = Resource>(): T[] {
    return this.resourceManager.getResourceListFromCache<T>();
  }

  clearCache(): void {
    this.resourceManager.clearCache();
  }
}
