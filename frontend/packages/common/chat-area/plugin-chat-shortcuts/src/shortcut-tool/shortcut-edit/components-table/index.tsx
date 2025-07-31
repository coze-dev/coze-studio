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

import { forwardRef, useImperativeHandle, useRef, useState } from 'react';

import { DndProvider } from '@coze-studio/components/dnd-provider';
import { type OnMove } from '@coze-studio/components';
import { I18n } from '@coze-arch/i18n';
import { type FormApi } from '@coze-arch/bot-semi/Form';
import { Form, Table, Toast, Tooltip } from '@coze-arch/bot-semi';
import { IconAdd } from '@coze-arch/bot-icons';
import {
  InputType,
  ToolType,
  type ToolInfo,
  type shortcut_command,
} from '@coze-arch/bot-api/playground_api';

import { compTip } from '../components/tip';
import FieldLabel from '../components/field-label';
import ActionButton from '../components/action-button';
import { shortid } from '../../../utils/uuid';
import { type ComponentsWithId } from './types';
import { getColumns, tableComponents } from './table-components';
import {
  attachIdToComponents,
  checkDuplicateName,
  formatSubmitValues,
} from './method';
import { tableEmpty } from './empty';

import styles from './index.module.less';

export interface ComponentsTableProps {
  components: shortcut_command.Components[]; // Variable list
  onChange?: (components: shortcut_command.Components[]) => void;
  toolType?: shortcut_command.ToolType;
  toolInfo: ToolInfo;
  disabled: boolean;
}

export interface ComponentsTableActions {
  validate: () => Promise<shortcut_command.Components[]>;
  setValues: (values: shortcut_command.Components[]) => void;
}

const MAX_COMPONENTS = 10;

// Semi-controlled component, using initial value + exposed API to facilitate internal maintenance of local ID for dragging and dropping sorting identification data
export const ComponentsTable = forwardRef<
  { formApi?: ComponentsTableActions },
  ComponentsTableProps
  // eslint-disable-next-line @coze-arch/max-line-per-function
>(({ components, onChange, toolType, disabled, toolInfo }, ref) => {
  const [values, setValues] = useState<ComponentsWithId[]>(
    attachIdToComponents(components),
  );
  const formRef = useRef<FormApi<{ values: ComponentsWithId[] }>>();

  const onChangeInner = (newValues: ComponentsWithId[]) => {
    setValues(newValues);
    formRef.current?.setValues({ values: newValues }, { isOverride: true });
    onChange?.(formatSubmitValues(newValues));
  };

  useImperativeHandle(ref, () => ({
    formApi: formRef.current
      ? {
          validate: async (...props) => {
            // It is handled uniformly here to avoid multiple identical fields triggering multiple toasts.
            if (
              values.some(
                component =>
                  component.input_type === InputType.Select &&
                  !component.options?.length,
              )
            ) {
              Toast.error(
                I18n.t('shortcut_modal_selector_component_no_options_error'),
              );
              throw Error('shortcut_modal_selector_component_no_options_error');
            }
            if (
              formRef.current &&
              checkDuplicateName(values, formRef.current)
            ) {
              throw Error('duplicated names');
            }

            const submitValues = await formRef.current?.validate(...props);
            return formatSubmitValues(submitValues?.values ?? []);
          },
          setValues: newComponents => {
            const newValues = attachIdToComponents(newComponents);
            setValues(newValues);
            formRef.current?.setValues(
              { values: newValues },
              { isOverride: true },
            );
            formRef.current?.setTouched('values', false);
            formRef.current?.setError('values', '');
          },
        }
      : undefined,
  }));

  const onMove: OnMove<string> = (sourceId, targetId, isBefore) => {
    const newValues = [...values];
    const sourceIndex = newValues.findIndex(source => source.id === sourceId);
    const errors = formRef.current?.getError('values') || [];
    const sourceError = errors.splice(sourceIndex, 1)[0];
    const sourceItem = newValues.splice(sourceIndex, 1)[0];
    const targetIndex =
      newValues.findIndex(target => target.id === targetId) +
      (isBefore ? 0 : 1);
    sourceItem && newValues.splice(targetIndex, 0, sourceItem);
    errors.splice(targetIndex, 0, sourceError);
    // Do not trigger onChange if the index is the same before and after to avoid frequent rerender
    if (sourceIndex !== targetIndex) {
      onChangeInner(newValues);
      // Only after dragging sort, you need to manually update the form value
      formRef.current?.setValues(
        {
          values: newValues,
        },
        { isOverride: true },
      );
      formRef.current?.setError('values', errors);
    }
  };

  const showAdd =
    toolType === undefined ||
    ![ToolType.ToolTypeWorkFlow, ToolType.ToolTypePlugin].includes(toolType);

  const selected = !!toolInfo?.tool_name;
  const oversize = values.length >= MAX_COMPONENTS;

  const addBtn = (
    <ActionButton
      icon={<IconAdd />}
      disabled={oversize || disabled}
      onClick={() => {
        onChangeInner([
          ...values,
          {
            id: shortid(),
            input_type: InputType.TextInput,
          },
        ]);
      }}
    >
      {I18n.t('add')}
    </ActionButton>
  );

  const tipBtn = oversize ? (
    <Tooltip
      content={I18n.t('shortcut_modal_max_component_tip', {
        maxCount: MAX_COMPONENTS,
      })}
    >
      {addBtn}
    </Tooltip>
  ) : (
    addBtn
  );

  return (
    <div className="pb-6">
      <div className="flex items-center justify-between pb-1.5">
        <FieldLabel tip={compTip()}>
          {I18n.t('shortcut_modal_components')}
        </FieldLabel>
        {showAdd ? tipBtn : null}
      </div>
      <DndProvider>
        <Form<{ values: ComponentsWithId[] }>
          initValues={{ values }}
          // Manually trigger validation to avoid being affected by addition, deletion and drag-and-drop sorting
          trigger="custom"
          autoComplete="off"
          disabled={disabled}
          getFormApi={api => (formRef.current = api)}
          onValueChange={(newValues, changedValues) => {
            const changedKeys = Object.keys(changedValues);
            if (
              changedKeys.length === 1 &&
              // Trigger onChange only in form modification scenarios to avoid infinite loops
              changedKeys[0]?.startsWith('values.[')
            ) {
              onChangeInner([...newValues.values]);
              // Validation is only triggered for specific fields in the edit form scenario, and verification is not triggered in other scenarios (addition and deletion sorting of entire lines)
              setTimeout(() => {
                if (formRef.current) {
                  checkDuplicateName(newValues.values, formRef.current);
                }
                // @ts-expect-error -- The type definition of  semi cannot support multi-segment paths
                formRef.current?.validate([changedKeys[0]]);
              });
            }
          }}
        >
          <div className={styles.table}>
            <Table<ComponentsWithId>
              dataSource={values}
              size="small"
              columns={getColumns({
                components: values,
                onChange: onChangeInner,
                toolInfo,
                toolType,
                disabled,
              })}
              components={tableComponents}
              pagination={false}
              onRow={item => ({
                id: item?.id ?? '',
                sortable: (values?.length ?? 0) > 1 && !disabled,
                onMove,
              })}
              empty={tableEmpty(!showAdd, selected)}
            />
          </div>
        </Form>
      </DndProvider>
    </div>
  );
});
