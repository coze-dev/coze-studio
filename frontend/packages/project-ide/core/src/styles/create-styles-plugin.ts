import { bindContributions, bindContributionProvider } from '@flowgram-adapter/common';

import { definePluginCreator, LifecycleContribution } from '../common';
import { ThemeService } from './theme';
import { StylingService, StylingContribution } from './styling';
import { StylesContribution } from './styles-contribution';
import { ColorService, ColorContribution } from './color';

const createStylesPlugin = definePluginCreator({
  onBind({ bind }) {
    // service
    bind(ThemeService).toSelf().inSingletonScope();
    bind(StylingService).toSelf().inSingletonScope();
    bind(ColorService).toSelf().inSingletonScope();
    // provider
    bindContributionProvider(bind, StylingContribution);
    bindContributionProvider(bind, ColorContribution);
    // contribution
    bindContributions(bind, StylesContribution, [
      LifecycleContribution,
      StylingContribution,
      ColorContribution,
    ]);
  },
});

export { createStylesPlugin };
