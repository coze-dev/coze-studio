import { ContainerModule } from 'inversify';
import {
  WorkflowJSONFormatContribution,
  WorkflowDocument,
} from '@flowgram-adapter/free-layout-editor';
import { bindContributions } from '@flowgram-adapter/common';

import { WorkflowJSONFormat } from './workflow-json-format';
import { WorkflowDocumentWithFormat } from './workflow-document-with-format';
import { WorkflowNodesService } from './service';

export const WorkflowNodesContainerModule = new ContainerModule(
  (bind, unbind, isBound, rebind) => {
    bind(WorkflowNodesService).toSelf().inSingletonScope();
    bindContributions(bind, WorkflowJSONFormat, [
      WorkflowJSONFormatContribution,
    ]);
    // 这里兼容老的 画布 document
    bind(WorkflowDocumentWithFormat).toSelf().inSingletonScope();
    rebind(WorkflowDocument).toService(WorkflowDocumentWithFormat);
  },
);
