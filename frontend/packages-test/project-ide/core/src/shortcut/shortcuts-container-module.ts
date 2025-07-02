import { ContainerModule } from 'inversify';
import { bindContributionProvider } from '@flowgram-adapter/common';

import { LifecycleContribution } from '../common';
import { ShortcutsContribution, ShortcutsService } from './shortcuts-service';
import { KeybindingRegistry } from './keybinding';

export const ShortcutsContainerModule = new ContainerModule(bind => {
  bindContributionProvider(bind, ShortcutsContribution);

  bind(KeybindingRegistry).toSelf().inSingletonScope();
  bind(LifecycleContribution).toService(KeybindingRegistry);

  bind(ShortcutsService).toSelf().inSingletonScope();
  bind(LifecycleContribution).toService(ShortcutsService);
});
