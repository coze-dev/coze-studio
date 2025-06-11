import { bindContributions } from '@flowgram-adapter/common';

import { ShortcutsContribution } from '../shortcut/shortcuts-service';
import { definePluginCreator, LifecycleContribution } from '../common';
import { CommandContribution } from '../command';
import { NavigationService } from './navigation-service';
import { NavigationHistory } from './navigation-history';
import { NavigationContribution } from './navigation-contribution';

export interface NavigationPluginOptions {
  uriScheme?: string;
}

export const createNavigationPlugin =
  definePluginCreator<NavigationPluginOptions>({
    onBind: ({ bind }) => {
      bind(NavigationHistory).toSelf().inSingletonScope();
      bind(NavigationService).toSelf().inSingletonScope();
      bindContributions(bind, NavigationContribution, [
        LifecycleContribution,
        CommandContribution,
        ShortcutsContribution,
      ]);
    },
    onInit(ctx, opts) {
      if (opts.uriScheme) {
        ctx.container.get(NavigationService).setScheme(opts.uriScheme);
      }
    },
  });
