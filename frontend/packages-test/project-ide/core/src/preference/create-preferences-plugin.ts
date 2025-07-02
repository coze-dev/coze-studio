import { bindContributions, bindContributionProvider } from '@flowgram-adapter/common';

import { definePluginCreator, LifecycleContribution } from '../common';
import { PreferencesManager } from './preferences-manager';
import { PreferencesContribution } from './preferences-contribution';
import { PreferenceContribution } from './preference-contribution';

interface PreferencesPluginOptions {
  defaultData?: any;
}

const createPreferencesPlugin = definePluginCreator<PreferencesPluginOptions>({
  onBind({ bind }) {
    bind(PreferencesManager).toSelf().inSingletonScope();
    bindContributions(bind, PreferencesContribution, [LifecycleContribution]);
    bindContributionProvider(bind, PreferenceContribution);
  },
  onInit(ctx, opts) {
    ctx.container.get(PreferencesManager).init(opts?.defaultData);
  },
});

export { createPreferencesPlugin, type PreferencesPluginOptions };
