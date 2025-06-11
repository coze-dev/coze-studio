import { injectable } from 'inversify';
import {
  type NodeContribution,
  type NodeManager,
  registerNodeErrorRender,
  registerNodePlaceholderRender,
} from '@flowgram-adapter/free-layout-editor';

import { nodeSystemErrorRender } from '../components/node-system-error-render';
import { NodePlaceholder } from '../components/node-placeholder';

@injectable()
export class WorkflowNodeContribution implements NodeContribution {
  onRegister(nodeManager: NodeManager) {
    registerNodeErrorRender(nodeManager, nodeSystemErrorRender);
    registerNodePlaceholderRender(nodeManager, NodePlaceholder);
  }
}
