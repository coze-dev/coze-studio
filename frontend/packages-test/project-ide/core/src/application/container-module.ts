import { ContainerModule, type interfaces } from 'inversify';
import { bindContributionProvider } from '@flowgram-adapter/common';

import {
  OpenHandler,
  DefaultOpenerService,
  OpenerService,
} from '../common/open-service';
import {
  PluginContext,
  LifecycleContribution,
  ContainerFactory,
  ContextKeyService,
  ContextMatcher,
  StorageService,
  LocalStorageService,
  WindowService,
} from '../common';
import { Application } from './application';

export const IDEContainerModule = new ContainerModule(bind => {
  bind(Application).toSelf().inSingletonScope();
  bindContributionProvider(bind, OpenHandler);
  bind(DefaultOpenerService).toSelf().inSingletonScope();
  bind(WindowService).toSelf().inSingletonScope();
  bind(OpenerService).toService(DefaultOpenerService);

  bind(ContextKeyService).toSelf().inSingletonScope();
  bind(ContextMatcher).toService(ContextKeyService);

  bind(PluginContext)
    .toDynamicValue(ctx => ({
      get<T>(identifier: interfaces.ServiceIdentifier<T>): T {
        return ctx.container.get<T>(identifier);
      },
      getAll<T>(identifier: interfaces.ServiceIdentifier<T>): T[] {
        return ctx.container.getAll<T>(identifier);
      },
      container: ctx.container,
    }))
    .inSingletonScope();
  bind(ContainerFactory)
    .toDynamicValue(ctx => ctx.container)
    .inSingletonScope();
  bindContributionProvider(bind, LifecycleContribution);
  bind(StorageService).to(LocalStorageService).inSingletonScope();
});
