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

import { type ShortCutCommand } from '@coze-agent-ide/tool-config';
import {
  type Components,
  InputType,
  SendType,
  type ToolParams,
} from '@coze-arch/bot-api/playground_api';

import type { ShortcutEditFormValues } from '../types';
import { initToolEnabledByToolTYpe } from '../../utils/tool-params';
import { getDSLFromComponents } from '../../utils/dsl-template';

export const getSubmitValue = (
  values: ShortcutEditFormValues,
): ShortCutCommand => {
  const newValues = { ...values };

  /**
   * Execute first, depending on whether components_list is included send_type
   */
  mutableSendType(newValues);

  const { send_type, use_tool = false } = newValues;

  mutableFormatCommandName(newValues);
  mutableSetCardSchemaForForm(newValues);

  if (send_type === SendType.SendTypeQuery && !use_tool) {
    mutableInitQueryFormValues(newValues);
  } else {
    mutableModifyToolParamsWhenComponentChange(newValues);
  }

  if (!use_tool) {
    mutableInitNotUseToolFormValues(newValues);
  }
  // TODO: hzf killing is unreasonable
  return newValues as ShortCutCommand;
};

const mutableSendType = (value: ShortcutEditFormValues) => {
  if (value?.components_list?.length) {
    value.send_type = SendType.SendTypePanel;
  } else {
    value.send_type = SendType.SendTypeQuery;
  }
};

/**
 * For compatibility, you need to modify the toolParams synchronously when modifying the default_value and hide of the components_list
 * 1.components_list.hide => !toolParams.refer_component
 * 2.components_list.default_value => refer_component：false && toolParams.default_value
 */
const mutableModifyToolParamsWhenComponentChange = (
  value: ShortcutEditFormValues,
): void => {
  const { components_list, tool_info: { tool_params_list } = {} } = value;
  if (!components_list || !tool_params_list) {
    return;
  }
  components_list.forEach(com => {
    const { default_value, hide } = com;
    const targetToolParams = findToolParamsByComponent(tool_params_list, com);
    if (!targetToolParams) {
      return;
    }
    targetToolParams.refer_component = !hide;
    targetToolParams.default_value = hide ? default_value?.value : '';
  });
};

export const findToolParamsByComponent = (
  params: Array<ToolParams>,
  component: Components,
) => params?.find(param => param.name === component.parameter);

// Initialize form parameters for query types
const mutableInitQueryFormValues = (values: ShortcutEditFormValues): void => {
  values.tool_type = undefined;
  values.plugin_id = '';
  values.work_flow_id = '';
  values.plugin_api_name = '';
  values.tool_info = {
    tool_name: '',
    tool_params_list: [],
  };
  values.components_list = [];
  values.card_schema = '';
};

// Initialize form parameters when using plug-in components
const mutableInitNotUseToolFormValues = (
  values: ShortcutEditFormValues,
): void => {
  values.tool_type = undefined;
  values.plugin_id = '';
  values.work_flow_id = '';
  values.plugin_api_name = '';
  values.tool_info = {
    tool_name: '',
    tool_params_list: [],
  };
  values.components_list?.forEach(com => {
    com.parameter = '';
  });
};

const mutableSetCardSchemaForForm = (values: ShortcutEditFormValues): void => {
  const { components_list } = values;
  const templateDsl = components_list
    ? getDSLFromComponents(components_list)
    : '';
  values.card_schema = JSON.stringify(templateDsl);
};

const mutableFormatCommandName = (values: ShortcutEditFormValues): void => {
  const { shortcut_command } = values;
  if (shortcut_command) {
    values.shortcut_command = `/${shortcut_command.trim()}`;
  }
};

/**
 * Filter toolParams exists, variables that do not exist in components
 * And refer_component = false,
 * Converted to components_list
 * For forward compatibility, the default parameters of tool in the old directive are placed in toolParams
 */
export const initComponentsListFromToolParams = (
  components: Components[],
  toolParams: Array<ToolParams>,
): Array<Components> => {
  const newComponents = components.slice();
  toolParams.forEach(param => {
    const { name, default_value, desc, refer_component } = param;
    if (!components.find(com => com.parameter === name)) {
      newComponents.push({
        name,
        description: desc,
        parameter: name,
        input_type: InputType.TextInput,
        hide: !refer_component,
        default_value: {
          type: InputType.TextInput,
          value: default_value,
        },
      });
    }
  });
  return newComponents;
};

/**
 * Compatible with outdated instructions
 * If the InputType is UploadImage, UploadDoc, UploadTable, UploadAudio,
 * Determine if upload_options is empty
 * Is empty, plus the corresponding upload_options
 */
export const initComponentsUploadOptions = (
  components: Components[],
): Components[] =>
  components.map(com => {
    const { input_type, upload_options } = com;
    if (
      !upload_options?.length &&
      input_type &&
      [
        InputType.UploadImage,
        InputType.UploadDoc,
        InputType.UploadTable,
        InputType.UploadAudio,
      ].includes(input_type)
    ) {
      return {
        ...com,
        upload_options: [input_type],
      };
    }
    return com;
  });

export const getInitialValues = (
  initShortcut?: ShortCutCommand,
): ShortcutEditFormValues => {
  // initialization
  if (!initShortcut) {
    return {
      send_type: SendType.SendTypeQuery,
      use_tool: false,
    };
  }
  // echo
  const {
    shortcut_command,
    tool_type,
    components_list,
    tool_info: { tool_params_list = [] } = {},
  } = initShortcut;
  const modifyComponentsListByToolParams = initComponentsListFromToolParams(
    components_list ?? [],
    tool_params_list,
  );
  const modifyComponentsListByUploadOptions = initComponentsUploadOptions(
    modifyComponentsListByToolParams,
  );

  return {
    ...initShortcut,
    shortcut_command: shortcut_command?.replace(/^\//, ''),
    use_tool: initToolEnabledByToolTYpe(tool_type),
    components_list: modifyComponentsListByUploadOptions,
  };
};

export const enableSendTypePanelHideTemplate = (shortcut?: ShortCutCommand) => {
  if (shortcut?.send_type !== SendType.SendTypePanel) {
    return false;
  }

  const { tool_params_list, tool_name } = shortcut?.tool_info ?? {};

  if (tool_name) {
    return (
      !!tool_params_list?.length &&
      tool_params_list.every(c => !c.refer_component)
    );
  }

  return (
    !!shortcut?.components_list?.length &&
    shortcut.components_list.every(c => c.hide)
  );
};

export const getFormValueFromShortcut = (shortcut?: ShortCutCommand) => {
  const { tool_params_list, tool_name } = shortcut?.tool_info ?? {};

  if (tool_name) {
    if (!tool_params_list?.length) {
      return {};
    }

    return tool_params_list.reduce((prev: Record<string, string>, curr) => {
      const key = curr.name;
      const defaultValue = curr?.default_value;

      if (!key || !defaultValue) {
        return prev;
      }

      prev[key] = defaultValue;

      return prev;
    }, {});
  }

  if (!shortcut?.components_list?.length) {
    return {};
  }

  return shortcut.components_list.reduce(
    (prev: Record<string, string>, curr) => {
      const key = curr.name;
      const { value } = curr?.default_value ?? {};
      if (!key || !value) {
        return prev;
      }

      prev[key] = value;

      return prev;
    },
    {},
  );
};
