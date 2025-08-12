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

import { useMemo } from 'react';

import {
  Field,
  type FieldRenderProps,
  useCurrentEntity,
} from '@flowgram-adapter/free-layout-editor';
import { WorkflowNode } from '@coze-workflow/base';

import { useDefaultNodeMeta } from '@/nodes-v2/hooks/use-default-node-meta';
import { type NodeHeaderValue } from '@/nodes-v2/components/node-header';
import { NodeHeader } from '@/nodes-v2';
import { useGlobalState } from '@/hooks';
import { useWatch } from '@/form';

export function Header({
  extraOperation,
  nodeDisabled,
  readonlyAllowDeleteOperation,
}: {
  extraOperation?: React.ReactNode;
  nodeDisabled?: boolean;
  readonlyAllowDeleteOperation?: boolean;
}) {
  const defaultNodeMeta = useDefaultNodeMeta();
  const node = useCurrentEntity();
  const { projectId } = useGlobalState();
  const wrappedNode = useMemo(() => new WorkflowNode(node), [node]);
  const triggerIsOpen = useWatch<Boolean>('trigger.isOpen');

  const showTrigger = useMemo(
    () => wrappedNode.registry?.meta?.showTrigger?.({ projectId }),
    [projectId],
  );
  return (
    <Field
      name={'nodeMeta'}
      deps={['outputs', 'batchMode']}
      defaultValue={defaultNodeMeta as unknown as NodeHeaderValue}
    >
      {({ field, fieldState }: FieldRenderProps<NodeHeaderValue>) => (
        <NodeHeader
          {...field}
          showErrorIgnore
          errors={fieldState?.errors || []}
          hideTest={wrappedNode.registry?.meta?.hideTest}
          readonly={wrappedNode.registry?.meta?.headerReadonly}
          showTrigger={showTrigger}
          triggerIsOpen={triggerIsOpen}
          extraOperation={extraOperation}
          nodeDisabled={nodeDisabled}
          readonlyAllowDeleteOperation={readonlyAllowDeleteOperation}
        />
      )}
    </Field>
  );
}
