import { describe, beforeEach, it, expect } from 'vitest';
import {
  WorkflowDocument,
  type WorkflowNodeEntity,
} from '@flowgram-adapter/free-layout-editor';

import { complexMock } from '../workflow.mock';
import { createContainer } from '../create-container';
import {
  EncapsulateGenerateService,
  type GenerateSubWorkflowNodeOptions,
} from '../../src/generate';

describe('encapsulate-generate-service', () => {
  let encapsulateGenerateService: EncapsulateGenerateService;
  let workflowDocument: WorkflowDocument;
  beforeEach(async () => {
    const container = createContainer();
    workflowDocument = container.get<WorkflowDocument>(WorkflowDocument);
    encapsulateGenerateService = container.get<EncapsulateGenerateService>(
      EncapsulateGenerateService,
    );

    await workflowDocument.fromJSON(complexMock);
  });

  it('should generate workflow json', async () => {
    const nodes = ['102906', '154702'].map(id =>
      workflowDocument.getNode(id),
    ) as WorkflowNodeEntity[];
    const res = await encapsulateGenerateService.generateWorkflowJSON(nodes);
    expect(res).toMatchSnapshot();
  });

  it('should generate sub workflow node', async () => {
    const options: GenerateSubWorkflowNodeOptions = {
      workflowId: '1',
      name: 'test',
      desc: 'test',
      spaceId: '1',
    };
    const res =
      await encapsulateGenerateService.generateSubWorkflowNode(options);
    expect(res).toMatchSnapshot();
  });
});
