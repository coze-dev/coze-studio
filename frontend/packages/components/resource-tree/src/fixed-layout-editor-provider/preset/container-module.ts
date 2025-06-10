import { ContainerModule } from 'inversify';
import {
  bindContributions,
  FlowDocumentContribution,
  FlowRendererContribution,
} from '@flowgram-adapter/fixed-layout-editor';

import { FlowRegisters } from './flow-registers';

export const FixedLayoutContainerModule = new ContainerModule(bind => {
  bindContributions(bind, FlowRegisters, [
    FlowDocumentContribution,
    FlowRendererContribution,
  ]);
});
