import {
  bindContributionProvider,
  bindContributions,
  type AsClass,
} from '@flowgram-adapter/common';

import { definePluginCreator, LifecycleContribution } from '../common';
import { LabelService } from './label-service';
import { LabelManager } from './label-manager';
import { LabelHandler } from './label-handler';

export interface LabelPluginOptions {
  handlers?: (AsClass<LabelHandler> | LabelHandler)[];
}

export const createLabelPlugin = definePluginCreator<LabelPluginOptions>({
  onBind: ({ bind }, opts) => {
    bindContributions(bind, LabelManager, [LifecycleContribution]);
    bind(LabelService).toService(LabelManager);
    bindContributionProvider(bind, LabelHandler);
    if (opts.handlers) {
      opts.handlers.forEach(handler => {
        if (typeof handler === 'function') {
          bind(handler).toSelf().inSingletonScope();
          bind(LabelHandler).toService(handler);
        } else {
          bind(LabelHandler).toConstantValue(handler);
        }
      });
    }
  },
});
