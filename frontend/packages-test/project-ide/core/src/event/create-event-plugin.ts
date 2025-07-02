import { definePluginCreator } from '../common';
import { EventContainerModule } from './event-container-module';

export const createEventPlugin = definePluginCreator<void>({
  containerModules: [EventContainerModule],
});
