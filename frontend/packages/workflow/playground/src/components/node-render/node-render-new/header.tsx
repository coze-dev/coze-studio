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
