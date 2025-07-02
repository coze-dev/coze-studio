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
