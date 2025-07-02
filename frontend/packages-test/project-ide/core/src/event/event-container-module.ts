import { ContainerModule } from 'inversify';
import { bindContributionProvider, bindContributions } from '@flowgram-adapter/common';

import { LifecycleContribution } from '../common';
import { EventRegistry } from './event-registry';
import { EventContribution, EventService } from './event-contribution';

export const EventContainerModule = new ContainerModule(bind => {
  bindContributionProvider(bind, EventContribution);
  bind(EventService).toService(EventRegistry);
  bindContributions(bind, EventRegistry, [LifecycleContribution]);
});
