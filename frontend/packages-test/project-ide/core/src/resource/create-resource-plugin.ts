import { type AsClass, bindContributionProvider } from '@flowgram-adapter/common';

// import { LabelHandler } from '../label';
import { definePluginCreator } from '../common';
import { ResourceService } from './resource-service';
import { ResourceManager } from './resource-manager';
import { ResourceHandler } from './resource';

export interface ResourcePluginOptions {
  handlers?: (AsClass<ResourceHandler<any>> | ResourceHandler<any>)[];
}

export const createResourcePlugin = definePluginCreator<ResourcePluginOptions>({
  onBind: ({ bind }, opts) => {
    bind(ResourceManager).toSelf().inSingletonScope();
    bind(ResourceService).toSelf().inSingletonScope();
    bindContributionProvider(bind, ResourceHandler);
    if (opts.handlers) {
      opts.handlers.forEach(handler => {
        if (typeof handler === 'function') {
          bind(handler).toSelf().inSingletonScope();
          bind(ResourceHandler).toService(handler);
        } else {
          bind(ResourceHandler).toConstantValue(handler);
        }
      });
    }
  },
  onInit: ctx => {},
});
