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

import React, {
  type FC,
  forwardRef,
  type RefObject,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

import { type Form } from '@coze-arch/bot-semi';
import {
  type shortcut_command,
  ToolType,
} from '@coze-arch/bot-api/playground_api';

import VarQueryTextareaWrapperWithField from '../var-query-textarea/field';
import { ComponentsTable } from '../components-table';
import type { ComponentsTableActions } from '../components-table';
import type {
  ShortcutEditFormValues,
  SkillsModalProps,
  ToolInfo,
} from '../../types';
import { getDSLFromComponents } from '../../../utils/dsl-template';
import { SkillSwitch } from './skill-switch';
import { getUnusedComponents, initComponentsByToolParams } from './method';
import { useHasUnusedComponentsConfirmModal } from './confirm-modal';

export interface IActionSwitchAreaProps {
  skillModal: FC<SkillsModalProps>;
  editedShortcut: ShortcutEditFormValues;
  formRef: RefObject<Form>;
  modalRef?: RefObject<HTMLDivElement>;
  isBanned: boolean;
}

export interface IActionSwitchAreaRef {
  getValues: () => ShortcutEditFormValues;
  validate: () => Promise<boolean>;
}

export const ActionSwitchArea = forwardRef<
  IActionSwitchAreaRef,
  IActionSwitchAreaProps
>((props, ref) => {
  const {
    editedShortcut,
    skillModal: SkillModal,
    formRef,
    isBanned,
    modalRef,
  } = props;

  const useTool = editedShortcut?.use_tool ?? false;

  const initialComponents = editedShortcut?.components_list?.length
    ? editedShortcut.components_list
    : [];

  const [components, setComponents] =
    useState<shortcut_command.Components[]>(initialComponents);

  const componentsRef = useRef<{
    formApi?: ComponentsTableActions;
  }>(null);

  const { open: openConfirmModal, node: ConfirmModal } =
    useHasUnusedComponentsConfirmModal();

  useImperativeHandle(ref, () => ({
    getValues: () => {
      const values = formRef.current?.formApi.getValues();
      return {
        ...values,
        components_list: components,
        use_tool: useTool,
        card_schema: getDSLFromComponents(components),
      };
    },
    validate: async () => {
      if (!formRef.current) {
        return false;
      }
      return await checkComponentsValid();
    },
  }));

  const onToolParamsChange = (toolInfo: ToolInfo | null) => {
    const {
      tool_type,
      plugin_id,
      plugin_api_name,
      api_id,
      tool_name,
      work_flow_id,
      tool_params_list = [],
    } = toolInfo || {};
    const newComponents = initComponentsByToolParams(tool_params_list);
    // TODO: hzf, it's a bit complicated, let's see if it can initValue
    formRef.current?.formApi.setValue('components_list', newComponents);
    setComponents(newComponents);
    // Only in this case do you need to manually update the data
    componentsRef.current?.formApi?.setValues(newComponents);

    formRef.current?.formApi.setValue('tool_type', tool_type);
    formRef.current?.formApi.setValue('plugin_id', plugin_id);
    tool_type === ToolType.ToolTypeWorkFlow &&
      formRef.current?.formApi.setValue('work_flow_id', work_flow_id);
    formRef.current?.formApi.setValue('plugin_api_name', plugin_api_name);
    formRef.current?.formApi.setValue('plugin_api_id', api_id);
    formRef.current?.formApi.setValue('tool_info', {
      tool_name,
      tool_params_list,
    });
  };

  const checkComponentsValid = async (): Promise<boolean> => {
    if (!formRef.current) {
      return false;
    }

    try {
      await componentsRef.current?.formApi?.validate();
      // eslint-disable-next-line @coze-arch/use-error-in-catch -- form validate
    } catch (err) {
      return false;
    }

    const componentNotUsed = getUnusedComponents(editedShortcut);
    if (componentNotUsed.length) {
      return await openConfirmModal(componentNotUsed);
    }

    return true;
  };

  useEffect(() => {
    formRef.current?.formApi.setValue('components_list', components);
  }, [components]);

  return (
    <>
      <SkillSwitch
        skillModal={SkillModal}
        isBanned={isBanned}
        onToolChange={onToolParamsChange}
        editedShortcut={editedShortcut}
      />
      <ComponentsTable
        toolType={useTool ? ToolType.ToolTypePlugin : undefined}
        toolInfo={editedShortcut?.tool_info ?? {}}
        ref={componentsRef}
        disabled={isBanned}
        components={components}
        onChange={newComponents => {
          setComponents(newComponents);
        }}
      />
      <VarQueryTextareaWrapperWithField
        field="template_query"
        value={editedShortcut?.template_query || ''}
        components={components}
        modalRef={modalRef}
      />
      {ConfirmModal}
    </>
  );
});
