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
