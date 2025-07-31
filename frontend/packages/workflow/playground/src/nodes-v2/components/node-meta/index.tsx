/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  Field,
  type FieldRenderProps,
  useCurrentEntity,
} from '@flowgram-adapter/free-layout-editor';
import { WorkflowNode } from '@coze-workflow/base';

import { useDefaultNodeMeta } from '@/nodes-v2/hooks/use-default-node-meta';
import { type NodeHeaderValue } from '@/nodes-v2/components/node-header';
import { NodeHeader } from '@/nodes-v2/components/node-header';

interface NodeMetaProps {
  fieldName?: string;
  deps?: string[];
  outputsPath?: string;
  batchModePath?: string;
}

const NodeMeta = ({
  fieldName = 'nodeMeta',
  deps,
  outputsPath,
  batchModePath,
}: NodeMetaProps) => {
  const defaultNodeMeta = useDefaultNodeMeta();
  const node = useCurrentEntity();
  const wrappedNode = new WorkflowNode(node);

  return (
    <Field
      name={fieldName}
      deps={deps}
      defaultValue={defaultNodeMeta as unknown as NodeHeaderValue}
    >
      {({ field, fieldState }: FieldRenderProps<NodeHeaderValue>) => (
        <NodeHeader
          {...field}
          outputsPath={outputsPath}
          batchModePath={batchModePath}
          hideTest={!!wrappedNode?.registry?.meta?.hideTest}
          errors={fieldState?.errors || []}
        />
      )}
    </Field>
  );
};

export default NodeMeta;
