import { ContainerModule } from 'inversify';
import { bindContributions } from '@flowgram-adapter/common';
import { WorkflowShortcutsContribution } from '@coze-workflow/render';

import { WorkflowHistoryShortcutsContribution } from './workflow-history-shortcuts-contribution';
import { WorkflowHistoryConfig } from './workflow-history-config';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const WorkflowHistoryContainerModule = new ContainerModule(bind => {
  bindContributions(bind, WorkflowHistoryShortcutsContribution, [
    WorkflowShortcutsContribution,
  ]);
  bind(WorkflowHistoryConfig).toSelf().inSingletonScope();
});
