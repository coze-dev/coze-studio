import {
  DEFAULT_NODE_META_PATH,
  DEFAULT_OUTPUTS_PATH,
} from '@coze-workflow/nodes';
import {
  StandardNodeType,
  type WorkflowNodeRegistry,
} from '@coze-workflow/base';

import { test, type NodeTestMeta } from './node-test';
import { JSON_STRINGIFY_FORM_META } from './form-meta';
import { INPUT_PATH } from './constants';

export const JSON_STRINGIFY_NODE_REGISTRY: WorkflowNodeRegistry<NodeTestMeta> =
  {
    type: StandardNodeType.JsonStringify,
    meta: {
      nodeDTOType: StandardNodeType.JsonStringify,
      size: { width: 360, height: 130.7 },
      nodeMetaPath: DEFAULT_NODE_META_PATH,
      outputsPath: DEFAULT_OUTPUTS_PATH,
      inputParametersPath: INPUT_PATH,
      test,
    },
    formMeta: JSON_STRINGIFY_FORM_META,
  };
