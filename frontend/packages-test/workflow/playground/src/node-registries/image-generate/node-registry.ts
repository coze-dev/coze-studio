import {
  StandardNodeType,
  type WorkflowNodeRegistry,
} from '@coze-workflow/base';

import { type NodeTestMeta } from '@/test-run-kit';

import { test } from './node-test';
import { IMAGE_GENERATE_FORM_META } from './form-meta';

export const IMAGE_GENERATE_NODE_REGISTRY: WorkflowNodeRegistry<NodeTestMeta> =
  {
    type: StandardNodeType.ImageGenerate,
    width: 508,
    meta: {
      nodeDTOType: StandardNodeType.ImageGenerate,
      test,
      helpLink: '/open/docs/guides/image_generation_node',
    },
    formMeta: IMAGE_GENERATE_FORM_META,
  };
