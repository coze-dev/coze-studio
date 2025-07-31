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

import { injectable, inject, named } from 'inversify';
import { ContributionProvider, Emitter } from '@flowgram-adapter/common';

import { type URI, URIHandler } from '../common';
import { type Resource, ResourceHandler } from './resource';

@injectable()
export class ResourceManager {
  protected resourceCacheMap = new Map<string, Resource>();

  protected onResourceCreateEmitter = new Emitter<Resource>();

  protected onResourceDisposeEmitter = new Emitter<Resource>();

  readonly onResourceCreate = this.onResourceCreateEmitter.event;

  readonly onResourceDispose = this.onResourceDisposeEmitter.event;

  @inject(ContributionProvider)
  @named(ResourceHandler)
  protected readonly contributionProvider: ContributionProvider<ResourceHandler>;

  get<T extends Resource>(uri: URI): T {
    const uriWithoutQuery = uri.withoutQuery().toString();
    const resourceFromCache = this.resourceCacheMap.get(uriWithoutQuery);
    if (resourceFromCache) {
      return resourceFromCache as T;
    }
    const handler = URIHandler.findSync<ResourceHandler>(
      uri,
      this.contributionProvider.getContributions(),
    );
    if (!handler) {
      throw new Error(`Unknown Resource handler: ${uri.toString()}`);
    }
    const newResource = handler.resolve(uri) as T;
    newResource.onDispose(() => {
      this.resourceCacheMap.delete(uriWithoutQuery);
      this.onResourceDisposeEmitter.fire(newResource);
    });
    this.resourceCacheMap.set(uriWithoutQuery, newResource);
    this.onResourceCreateEmitter.fire(newResource);
    return newResource;
  }

  getResourceListFromCache<T extends Resource = Resource>(): T[] {
    return Array.from(this.resourceCacheMap.values()) as T[];
  }

  clearCache(): void {
    for (const resource of this.resourceCacheMap.values()) {
      resource.dispose();
    }
  }
}
