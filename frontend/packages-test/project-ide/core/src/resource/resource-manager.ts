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
