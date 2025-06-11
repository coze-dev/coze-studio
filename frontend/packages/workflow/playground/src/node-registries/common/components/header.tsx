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
