import { ContainerModule } from 'inversify';
import { FlowRendererContribution } from '@flowgram-adapter/free-layout-editor';
import { PlaygroundContribution } from '@flowgram-adapter/free-layout-editor';
import { bindContributions } from '@flowgram-adapter/common';

import { WorkflowShortcutsRegistry } from './workflow-shorcuts-contribution';
import { WorkflowRenderContribution } from './workflow-render-contribution';

export const WorkflowRenderContainerModule = new ContainerModule(bind => {
  bindContributions(bind, WorkflowRenderContribution, [
    PlaygroundContribution,
    FlowRendererContribution,
  ]);
  bind(WorkflowShortcutsRegistry).toSelf().inSingletonScope();
});
