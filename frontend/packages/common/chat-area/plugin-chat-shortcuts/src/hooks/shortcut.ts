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

import { cloneDeep, merge } from 'lodash-es';
import websocketManager from '@coze-common/websocket-manager-adapter';
import {
  getFileInfo,
  type TextAndFileMixMessageProps,
} from '@coze-common/chat-core';
import {
  ContentType,
  type SendMessageOptions,
  useSendMultimodalMessage,
  useSendTextMessage,
} from '@coze-common/chat-area';
import { type PartialRequired } from '@coze-arch/bot-typings/common';
import { EVENT_NAMES, sendTeaEvent } from '@coze-arch/bot-tea';
import { ToolType } from '@coze-arch/bot-api/playground_api';
import type { ShortCutCommand } from '@coze-agent-ide/tool-config';

import { getQueryFromTemplate } from '../utils/shortcut-query';
import { enableSendTypePanelHideTemplate } from '../shortcut-tool/shortcut-edit/method';
import {
  type OnBeforeSendQueryShortcutParams,
  type OnBeforeSendTemplateShortcutParams,
} from '../shortcut-bar/types';
import {
  type FileValue,
  type TValue,
} from '../components/short-cut-panel/widgets/types';

export const useSendTextQueryMessage = () => {
  const sendTextMessage = useSendTextMessage();
  return (params: {
    queryTemplate: string;
    options?: SendMessageOptions;
    onBeforeSend?: (
      sendParams: OnBeforeSendQueryShortcutParams,
    ) => OnBeforeSendQueryShortcutParams;
    shortcut: ShortCutCommand;
  }) => {
    const {
      queryTemplate,
      onBeforeSend,
      options: inputOptions,
      shortcut,
    } = params;
    const { tool_type } = shortcut;
    const useTool =
      tool_type !== undefined &&
      [ToolType.ToolTypeWorkFlow, ToolType.ToolTypePlugin].includes(tool_type);

    const message = {
      payload: {
        text: queryTemplate,
        mention_list: [],
      },
    };

    const pluginParams = useTool ? getPluginDefaultParams(shortcut) : {};

    const options = merge(
      {
        extendFiled: {
          ...pluginParams,
          device_id: String(websocketManager.deviceId),
        },
      },
      inputOptions,
    );
    const { message: newMessage, options: newOptions } = onBeforeSend?.({
      message,
      options,
    }) || {
      message,
      options,
    };
    sendTextMessage(
      {
        text: newMessage.payload.text,
        mentionList: newMessage.payload.mention_list,
      },
      'shortcut',
      newOptions,
    );
    sendTeaEvent(EVENT_NAMES.shortcut_use, {
      tool_type,
      use_components: !!shortcut.components_list?.length,
      show_panel: enableSendTypePanelHideTemplate(shortcut),
    });
  };
};

export const useSendUseToolMessage = () => {
  const sendMultimodalMessage = useSendMultimodalMessage();
  return ({
    shortcut,
    options: inputOptions,
    componentsFormValues,
    onBeforeSendTemplateShortcut,
    withoutComponentsList = false,
  }: {
    shortcut: ShortCutCommand;
    componentsFormValues: Record<string, TValue>;
    options?: SendMessageOptions;
    onBeforeSendTemplateShortcut?: (
      params: OnBeforeSendTemplateShortcutParams,
    ) => OnBeforeSendTemplateShortcutParams;
    withoutComponentsList?: boolean;
  }) => {
    const { tool_type } = shortcut;
    const sendQuery = getTemplateQuery(
      shortcut,
      componentsFormValues,
      /**
       * Calling store without parameters does not have a pixentList
       */
      withoutComponentsList,
    );
    const useTool =
      tool_type !== undefined &&
      [ToolType.ToolTypeWorkFlow, ToolType.ToolTypePlugin].includes(tool_type);

    const pluginParams = useTool
      ? getPluginParams(shortcut, componentsFormValues)
      : {};

    const imageAndFileList = getImageAndFileList(componentsFormValues);

    const message: TextAndFileMixMessageProps = {
      payload: {
        mixList: [
          {
            type: ContentType.Text,
            // TODO needs to see if it can be optimized.
            /**
             * Prevent sending empty messages (no dialog bubble box) = > Use spaces to occupy space
             */
            text: sendQuery || ' ',
          },
          ...imageAndFileList,
        ],
        mention_list: [],
      },
    };

    const options = merge(
      {
        extendFiled: {
          ...pluginParams,
          device_id: String(websocketManager.deviceId),
        },
      },
      inputOptions,
    );

    const handledParams = onBeforeSendTemplateShortcut?.({
      message: cloneDeep(message),
      options: cloneDeep(options),
    }) || {
      message,
      options,
    };
    sendMultimodalMessage(
      handledParams.message ?? message,
      'shortcut',
      handledParams.options,
    );
    sendTeaEvent(EVENT_NAMES.shortcut_use, {
      tool_type,
      use_components: !!shortcut.components_list?.length,
      show_panel: !enableSendTypePanelHideTemplate(shortcut),
    });
  };
};

interface ToolParamValue {
  value: string;
  resource_type: 'uri' | '';
}

const getPluginParams = (
  shortcut: ShortCutCommand,
  componentsFormValues: Record<string, TValue>,
) => {
  const {
    plugin_id,
    plugin_api_name,
    components_list,
    tool_info: { tool_params_list } = {},
  } = shortcut;

  const filterImagesValues = filterComponentFormValues(
    componentsFormValues,
    value => {
      const { fileInstance, url } = value;
      const resourceType = fileInstance ? 'uri' : '';
      return {
        value: url,
        resource_type: resourceType,
      };
    },
    value => ({
      value,
      resource_type: '',
    }),
  );

  // The parameter attribute value in key: components_list: the corresponding value in values | default_value
  const runPluginVariables = (tool_params_list ?? []).reduce<
    Record<string, ToolParamValue>
  >((acc, cur) => {
    const { default_value, name, refer_component } = cur;
    if (!name) {
      return acc;
    }
    if (!refer_component) {
      acc[name] = {
        value: default_value ?? '',
        resource_type: '',
      };
      return acc;
    }
    const targetComponentName = components_list?.find(
      com => com.parameter === name,
    )?.name;
    const componentValue =
      targetComponentName && filterImagesValues[targetComponentName];
    if (componentValue) {
      acc[name] = componentValue as ToolParamValue;
    }
    return acc;
  }, {});

  if (!Object.keys(runPluginVariables).length) {
    return {
      shortcut_cmd_id: shortcut.command_id,
      toolList: [],
    };
  }

  return {
    shortcut_cmd_id: shortcut.command_id,
    toolList: [
      {
        plugin_id,
        api_name: plugin_api_name ?? '',
        parameters: runPluginVariables,
      },
    ],
  };
};

const getPluginDefaultParams = (shortcut: ShortCutCommand) => {
  const {
    plugin_id,
    plugin_api_name,
    tool_info: { tool_params_list } = {},
  } = shortcut;

  // The parameter attribute value in key: components_list: the corresponding value in values | default_value
  const runPluginVariables = (tool_params_list ?? []).reduce<
    Record<string, ToolParamValue>
  >((acc, cur) => {
    const { default_value, name } = cur;
    if (!name) {
      return acc;
    }

    acc[name] = {
      value: default_value ?? '',
      resource_type: '',
    };

    return acc;
  }, {});

  return {
    shortcut_cmd_id: shortcut.command_id,
    toolList: [
      {
        plugin_id,
        api_name: plugin_api_name ?? '',
        parameters: runPluginVariables,
      },
    ],
  };
};

export const getTemplateQuery = (
  shortcut: ShortCutCommand,
  componentsFormValues: Record<string, TValue>,
  withoutComponentsList = false,
) => {
  const { template_query, components_list } = shortcut;
  if (!template_query) {
    throw new Error('template_query is not defined');
  }
  // Processing image files
  const componentListValue = getComponentListValue(
    components_list,
    componentsFormValues,
  );

  if (withoutComponentsList) {
    return getQueryFromTemplate(template_query, componentsFormValues ?? {});
  }

  return getQueryFromTemplate(template_query, componentListValue);
};

const filterComponentFormValues = (
  componentsFormValues: Record<string, TValue>,
  setImageAndFileValue: (value: FileValue) => unknown,
  setTextValue: (value: string) => unknown,
) =>
  Object.keys(componentsFormValues).reduce<Record<string, unknown>>(
    (acc, cur) => {
      const value = componentsFormValues[cur];
      // file type
      if (typeof value === 'object' && value.fileInstance) {
        acc[cur] = setImageAndFileValue(value);
        return acc;
      }
      // plain text type
      acc[cur] = setTextValue(value as string);
      return acc;
    },
    {},
  );

export const getImageAndFileList = (
  componentsFormValues: Record<string, TValue>,
): TextAndFileMixMessageProps['payload']['mixList'] =>
  Object.keys(componentsFormValues).reduce<
    TextAndFileMixMessageProps['payload']['mixList']
  >((acc, cur) => {
    const value = componentsFormValues[cur];
    if (isComponentFile(value)) {
      acc.push({
        type: ContentType.File,
        file: value.fileInstance,
        uri: value.url,
      });
      return acc;
    }
    if (isComponentImage(value)) {
      acc.push({
        type: ContentType.Image,
        file: value.fileInstance,
        uri: value.url,
        width: value.width || 0,
        height: value.height || 0,
      });
      return acc;
    }
    return acc;
  }, []);

const isComponentFile = (
  value: TValue,
): value is PartialRequired<FileValue, 'fileInstance' | 'url'> =>
  Boolean(
    typeof value === 'object' &&
      value.fileInstance &&
      getFileInfo(value.fileInstance)?.fileType !== 'image',
  );

const isComponentImage = (
  value: TValue,
): value is PartialRequired<FileValue, 'fileInstance' | 'url'> =>
  Boolean(
    typeof value === 'object' &&
      value.fileInstance &&
      getFileInfo(value.fileInstance)?.fileType === 'image',
  );

// Get component_list value with default value
export const getComponentListValue = (
  componentsList: ShortCutCommand['components_list'],
  componentsFormValues: Record<string, TValue>,
): Record<string, string> => {
  const filterValues = filterComponentFormValues(
    componentsFormValues,
    value => value?.fileInstance?.name,
    value => value,
  );

  // The parameter attribute value in key: components_list: the corresponding value in values | default_value
  return (componentsList ?? []).reduce<Record<string, string>>((acc, cur) => {
    const { default_value, name, hide } = cur;
    if (!name) {
      return acc;
    }
    if (hide) {
      acc[name] = default_value?.value ?? '';
      return acc;
    }
    const componentValue = filterValues[name];
    if (componentValue) {
      acc[name] = componentValue as string;
    }
    return acc;
  }, {});
};
