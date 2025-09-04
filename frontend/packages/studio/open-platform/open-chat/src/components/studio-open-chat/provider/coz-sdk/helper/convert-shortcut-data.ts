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

import { type ShortCutCommand } from '@coze-common/chat-area-plugins-chat-shortcuts';
import { SendType, ToolType, InputType } from '@coze-arch/idl/playground_api';

const refInputTypeMap = {
  text: InputType.TextInput,
  select: InputType.Select,
  file: InputType.MixUpload,
  image: InputType.UploadImage,
  audio: InputType.UploadAudio,
  doc: InputType.UploadDoc,
  table: InputType.UploadTable,
  code: InputType.CODE,
  zip: InputType.ARCHIVE,
  ppt: InputType.PPT,
  video: InputType.VIDEO,
  txt: InputType.TXT,
};
export interface ShortcutCommandInOpenApi {
  id: string;
  name: string;
  command: string;
  description: string;
  query_template: string;
  icon_url: string;
  components?: Array<{
    name: string;
    description: string;
    type: 'text' | 'file' | 'select';
    tool_parameter: string;
    is_hide: boolean;
    options: Array<string>;
    default_value: string;
  }>;
  tool?: {
    name: string;
    type: 'plugin' | 'workflow';
    plugin_id: string;
    plugin_api_name: string;
    workflow_id: string;
    params?: Array<{
      name: string;
      is_required: boolean;
      description: string;
      type: string;
      default_value: string;
      is_refer_component: boolean;
    }>;
  };
  send_type: 'panel' | 'query';
  card_schema: string;
}

export const convertShortcutData = (
  shortcutCommands?: ShortcutCommandInOpenApi[],
  botInfo?: {
    name?: string;
    iconUrl?: string;
    id?: string;
  },
): ShortCutCommand[] =>
  //@ts-expect-error: 不知道为什么报错
  shortcutCommands?.map(item => {
    const sendType =
      item.send_type &&
      (item.send_type === 'panel'
        ? SendType.SendTypePanel
        : SendType.SendTypeQuery);

    let componentsList;
    let toolType;
    if (sendType !== SendType.SendTypeQuery) {
      componentsList =
        item.components?.map(componentItem => ({
          name: componentItem.name,
          description: componentItem.description,
          parameter: componentItem.tool_parameter,
          hide: componentItem.is_hide,
          options:
            (componentItem.type === 'select' && componentItem.options) || [],

          input_type: refInputTypeMap[componentItem.type],
          upload_options:
            (componentItem.type === 'file' &&
              componentItem.options?.map(option => refInputTypeMap[option])) ||
            [],

          default_value: {
            value: componentItem.default_value || '',
            type: 0,
          },
        })) || [];
      if (item?.tool?.type && ['plugin', 'workflow'].includes(item.tool.type)) {
        toolType =
          item.tool.type === 'plugin'
            ? ToolType.ToolTypePlugin
            : ToolType.ToolTypeWorkFlow;
      }
    }

    return {
      object_id: botInfo?.id || '',
      command_name: item.name,
      shortcut_command: item.command,
      description: item.description,
      send_type: sendType,
      tool_type: toolType,
      work_flow_id: item?.tool?.workflow_id || '',
      plugin_id: item?.tool?.plugin_id || '',
      plugin_api_name: item?.tool?.name || '',
      template_query: item.query_template,
      components_list: componentsList,
      card_schema: item.card_schema,
      command_id: item.id,
      tool_info: {
        tool_name: item.tool?.name,
        tool_params_list:
          item.tool?.params?.map(param => ({
            name: param.name,
            required: param.is_required,
            desc: param.description,
            type: param.type,
            default_value: param.default_value,
            refer_component: param.is_refer_component,
          })) || [],
      },
      shortcut_icon: {
        url: item.icon_url,
      },
      bot_info: {
        icon_url: botInfo?.iconUrl || '',
        name: botInfo?.name || '',
      },
    };
  }) || [];
