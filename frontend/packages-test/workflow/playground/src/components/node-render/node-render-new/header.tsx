import { useCallback } from 'react';

import { WorkflowNode } from '@coze-workflow/base';
import {
  useCurrentEntity,
  type FormModelV2,
  Form,
  Field,
  type FieldRenderProps,
  FlowNodeFormData,
} from '@flowgram-adapter/free-layout-editor';

import {
  NodeHeader,
  type NodeHeaderValue,
  useDefaultNodeMeta,
} from '@/nodes-v2';
import { useGlobalState } from '@/hooks';

import styles from './header.module.less';

export function Header() {
  const node = useCurrentEntity();
  const defaultNodeMeta = useDefaultNodeMeta();

  const { projectId } = useGlobalState();
  const renderNodeV2Header = useCallback(() => {
    const formModel = node
      .getData(FlowNodeFormData)
      .getFormModel<FormModelV2>();
    const triggerIsOpen = formModel.getValueIn('trigger.isOpen');
    const formControl = formModel?.formControl;
    const wrappedNode = new WorkflowNode(node);
    return (
      <Form control={formControl}>
        <Field
          name={'nodeMeta'}
          deps={['outputs', 'batchMode']}
          defaultValue={defaultNodeMeta as unknown as NodeHeaderValue}
        >
          {({ field, fieldState }: FieldRenderProps<NodeHeaderValue>) => (
            <NodeHeader
              {...field}
              readonly={!!wrappedNode?.registry?.meta?.headerReadonly}
              hideTest={!!wrappedNode?.registry?.meta?.hideTest}
              readonlyAllowDeleteOperation={
                !!wrappedNode?.registry?.meta
                  ?.headerReadonlyAllowDeleteOperation
              }
              showTrigger={
                !!wrappedNode.registry?.meta?.showTrigger?.({ projectId })
              }
              triggerIsOpen={triggerIsOpen}
              outputsPath={'outputs'}
              batchModePath={'batchMode'}
              extraOperation={wrappedNode?.registry?.getHeaderExtraOperation?.(
                formModel.getValues(),
                node,
              )}
              errors={fieldState?.errors || []}
            />
          )}
        </Field>
      </Form>
    );
  }, [defaultNodeMeta, node]);
  return (
    <div className={styles['node-render-new-header']}>
      {renderNodeV2Header()}
    </div>
  );
}
