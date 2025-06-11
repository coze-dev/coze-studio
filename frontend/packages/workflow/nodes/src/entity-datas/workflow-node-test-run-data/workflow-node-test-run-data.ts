import { EntityData } from '@flowgram-adapter/free-layout-editor';
import { type WorkflowNodeEntity } from '@flowgram-adapter/free-layout-editor';

import { type NodeTestRunResult } from './typings';

export class WorkflowNodeTestRunData extends EntityData<NodeTestRunResult | null> {
  static readonly type = 'WorkflowNodeTestRunData';
  entity: WorkflowNodeEntity;

  get result(): NodeTestRunResult | null {
    return this.data;
  }

  set result(result: NodeTestRunResult | null) {
    this.update(result);
  }

  getDefaultData(): NodeTestRunResult | null {
    return null;
  }
}
