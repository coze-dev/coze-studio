import {
  DEFAULT_NODE_META_PATH,
  DEFAULT_OUTPUTS_PATH,
  type WorkflowNodeRegistry,
} from '@coze-workflow/nodes';
import { StandardNodeType } from '@coze-workflow/base';

import { type NodeTestMeta } from '@/test-run-kit';

import { test } from './node-test';
import { HTTP_FORM_META } from './form-meta';

export const HTTP_NODE_REGISTRY: WorkflowNodeRegistry<NodeTestMeta> = {
  type: StandardNodeType.Http,
  meta: {
    nodeDTOType: StandardNodeType.Http,
    style: {
      width: 360,
    },
    size: { width: 360, height: 130.7 },
    nodeMetaPath: DEFAULT_NODE_META_PATH,
    outputsPath: DEFAULT_OUTPUTS_PATH,
    test,
    helpLink: '/open/docs/guides/http_node',
  },
  formMeta: HTTP_FORM_META,
};
