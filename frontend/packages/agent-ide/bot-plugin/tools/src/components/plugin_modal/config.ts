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

import { cloneDeep } from 'lodash-es';
import { I18n } from '@coze-arch/i18n';
import {
  type AssistParameterType,
  ParameterLocation,
  ParameterType,
} from '@coze-arch/bot-api/plugin_develop';
import { type ExtInfoText } from '@coze-studio/plugin-shared';
import { FileTypeEnum } from '@coze-studio/file-kit/logic';

import { type APIParameterRecord } from './types/params';

export const childrenRecordName = 'sub_parameters'; // sub-node name
export const ROWKEY = 'id'; // unique device identifier
export const ARRAYTAG = '[Array Item]'; // Array element identifier
export const ROOTTAG = '[Root Item]'; // Root is the identifier of the array
export const STARTNODE = 0;
export const REQUESTNODE = 1;
export const RESPONSENODE = 2;
export const DEBUGNODE = 3;
export const ENDSTEP = 4;
// Incoming method options
export const parameterLocationOptions = [
  {
    label: 'Body',
    value: ParameterLocation.Body,
  },
  {
    label: 'Path',
    value: ParameterLocation.Path,
  },
  {
    label: 'Query',
    value: ParameterLocation.Query,
  },
  {
    label: 'Header',
    value: ParameterLocation.Header,
  },
];

export enum ParameterTypeExtend {
  /**
   * extension type
   * One-to-one correspondence with AssistParameterType
   */
  DEFAULT = 10001,
  IMAGE,
  DOC,
  CODE,
  PPT,
  TXT,
  EXCEL,
  AUDIO,
  ZIP,
  VIDEO,
}

const enumDomain = 10000;
export const assistToExtend = (
  type: AssistParameterType,
): ParameterTypeExtend => type + enumDomain;

export const extendToAssist = (
  type: ParameterTypeExtend,
): AssistParameterType => type - enumDomain;

export type PluginParameterType = ParameterType | ParameterTypeExtend;

interface ParameterTypeOption {
  label: string;
  value: ParameterType | ParameterTypeExtend;
  children?: Array<{
    label: string;
    value: ParameterTypeExtend;
  }>;
}

/**
 * The basic type before the unextended File type is used in many places, and start needs to be reserved.
 */
export const parameterTypeOptions: Array<ParameterTypeOption> = [
  {
    label: 'String',
    value: ParameterType.String,
  },
  {
    label: 'Integer',
    value: ParameterType.Integer,
  },
  {
    label: 'Number',
    value: ParameterType.Number,
  },
  {
    label: 'Object',
    value: ParameterType.Object,
  },
  {
    label: 'Array',
    value: ParameterType.Array,
  },
  {
    label: 'Boolean',
    value: ParameterType.Bool,
  },
];

export const parameterTypeOptionsSub: Array<ParameterTypeOption> = [
  {
    label: 'Array<String>',
    value: ParameterType.String,
  },
  {
    label: 'Array<Integer>',
    value: ParameterType.Integer,
  },
  {
    label: 'Array<Number>',
    value: ParameterType.Number,
  },
  {
    label: 'Array<Object>',
    value: ParameterType.Object,
  },
  {
    label: 'Array<Boolean>',
    value: ParameterType.Bool,
  },
];
/**
 * Unexpanded File type, base type, used in many places, need to keep end
 */

export const parameterTypeExtendMap: Record<
  ParameterTypeExtend,
  {
    label: string;
    listLabel: string;
    fileTypes: FileTypeEnum[];
  }
> = {
  [ParameterTypeExtend.DEFAULT]: {
    label: 'File',
    listLabel: 'Array<File>',
    fileTypes: [FileTypeEnum.DEFAULT_UNKNOWN],
  },
  [ParameterTypeExtend.IMAGE]: {
    label: 'Image',
    listLabel: 'Array<Image>',
    fileTypes: [FileTypeEnum.IMAGE],
  },
  [ParameterTypeExtend.DOC]: {
    label: 'Doc',
    listLabel: 'Array<Doc>',
    fileTypes: [FileTypeEnum.DOCX, FileTypeEnum.PDF],
  },
  [ParameterTypeExtend.CODE]: {
    label: 'Code',
    listLabel: 'Array<Code>',
    fileTypes: [FileTypeEnum.CODE],
  },
  [ParameterTypeExtend.PPT]: {
    label: 'PPT',
    listLabel: 'Array<PPT>',
    fileTypes: [FileTypeEnum.PPT],
  },
  [ParameterTypeExtend.TXT]: {
    label: 'TXT',
    listLabel: 'Array<TXT>',
    fileTypes: [FileTypeEnum.TXT],
  },
  [ParameterTypeExtend.EXCEL]: {
    label: 'Excel',
    listLabel: 'Array<Excel>',
    fileTypes: [FileTypeEnum.EXCEL, FileTypeEnum.CSV],
  },
  [ParameterTypeExtend.AUDIO]: {
    label: 'Audio',
    listLabel: 'Array<Audio>',
    fileTypes: [FileTypeEnum.AUDIO],
  },
  [ParameterTypeExtend.ZIP]: {
    label: 'Zip',
    listLabel: 'Array<Zip>',
    fileTypes: [FileTypeEnum.ARCHIVE],
  },
  [ParameterTypeExtend.VIDEO]: {
    label: 'Video',
    listLabel: 'Array<Video>',
    fileTypes: [FileTypeEnum.VIDEO],
  },
};

const getParameterTypeOptionsWithCustom = (enableFileType = false) => {
  if (!enableFileType) {
    return parameterTypeOptions;
  }

  const parameterTypeOptionsWithCustom = cloneDeep(parameterTypeOptions);
  parameterTypeOptionsWithCustom.splice(1, 0, {
    label: 'File',
    value: ParameterTypeExtend.DEFAULT,
    children: Object.entries(parameterTypeExtendMap).map(
      ([type, { label }]) => ({
        label,
        value: Number(type) as ParameterTypeExtend,
      }),
    ),
  });

  return parameterTypeOptionsWithCustom;
};

const getParameterTypeOptionsSubWithCustom = (enableFileType = false) => {
  if (!enableFileType) {
    return parameterTypeOptionsSub;
  }

  const parameterTypeOptionsSubWithCustom = cloneDeep(parameterTypeOptionsSub);
  parameterTypeOptionsSubWithCustom.splice(1, 0, {
    label: 'Array<File>',
    value: ParameterTypeExtend.DEFAULT,
    children: Object.entries(parameterTypeExtendMap).map(
      ([type, { listLabel }]) => ({
        label: listLabel,
        value: Number(type) as ParameterTypeExtend,
      }),
    ),
  });

  return parameterTypeOptionsSubWithCustom;
};

export const getPluginParameterTypeOptions = (
  isArrayType: boolean,
  enableFileType: boolean,
) =>
  isArrayType
    ? getParameterTypeOptionsSubWithCustom(enableFileType)
    : getParameterTypeOptionsWithCustom(enableFileType);

const parameterTypeOptionsMap = parameterTypeOptions.reduce(
  (prev: Partial<Record<PluginParameterType, string>>, curr) => {
    prev[curr.value] = curr.label;
    return prev;
  },
  {
    ...Object.entries(parameterTypeExtendMap).reduce(
      (prev, [type, { label }]) => {
        // @ts-expect-error -- linter-disable-autofix
        prev[type] = label;
        return prev;
      },
      {},
    ),
    [ParameterTypeExtend.DEFAULT]: 'File',
  },
);

const parameterTypeOptionsSubMap = parameterTypeOptionsSub.reduce(
  (prev: Partial<Record<PluginParameterType, string>>, curr) => {
    prev[curr.value] = curr.label;
    return prev;
  },
  {
    ...Object.entries(parameterTypeExtendMap).reduce(
      (prev, [type, { listLabel }]) => {
        // @ts-expect-error -- linter-disable-autofix
        prev[type] = listLabel;
        return prev;
      },
      {},
    ),
    [ParameterTypeExtend.DEFAULT]: 'Array<File>',
  },
);

export const getParameterTypeLabel = (
  type: PluginParameterType,
  isArrayType = false,
) =>
  isArrayType
    ? parameterTypeOptionsSubMap[type]
    : parameterTypeOptionsMap[type];

export const getParameterTypeLabelFromRecord = (
  record: APIParameterRecord,
  isArrayType = false,
) => {
  let type: PluginParameterType = record.type as PluginParameterType;
  if (record?.assist_type) {
    type = assistToExtend(record.assist_type);
  }
  return getParameterTypeLabel(type, isArrayType);
};

export const methodType: ExtInfoText[] = [
  {
    type: 'title',
    text: 'Get',
  },
  {
    type: 'text',
    text: I18n.t('plugin_tooltip_url'),
  },
  {
    type: 'demo',
    text: 'GET /users?userId=123',
  },
  {
    type: 'text',
    text: I18n.t('used_to_obtain_user_information_with_id_123'),
  },
  {
    type: 'br',
  },
  {
    type: 'title',
    text: 'Post',
  },
  {
    type: 'text',
    text: I18n.t(
      'submit_data_to_a_specified_resource__often_used_to_submit_forms_or_upload_files_',
    ),
  },
  {
    type: 'demo',
    text: 'POST /users',
  },
  {
    type: 'text',
    text: I18n.t('attach_user_data_to_create_a_new_user_'),
  },
  {
    type: 'title',
    text: 'Put',
  },
  {
    type: 'text',
    text: I18n.t(
      'upload_data_or_resources_to_a_specified_location__often_used_to_update_existing_',
    ),
  },
  {
    type: 'demo',
    text: 'PUT /users/123',
  },
  {
    type: 'text',
    text: I18n.t('used_to_update_user_information_with_id_123_'),
  },
  {
    type: 'title',
    text: 'Delete',
  },
  {
    type: 'text',
    text: I18n.t(
      'requests_the_server_to_delete_the_specified_resource__example_',
    ),
  },
  {
    type: 'demo',
    text: 'DELETE /users/123',
  },
  {
    type: 'text',
    text: I18n.t('used_to_delete_the_user_with_id_123_'),
  },
  {
    type: 'title',
    text: I18n.t('Create_tool_s1_method_patch_tooltip_title'),
  },
  {
    type: 'text',
    text: I18n.t('Create_tool_s1_method_patch_tooltip_desp'),
  },
  {
    type: 'demo',
    text: I18n.t('Create_tool_s1_method_patch_tooltip_url'),
  },
  {
    type: 'text',
    text: I18n.t('Create_tool_s1_method_patch_tooltip_explain'),
  },
];

export enum ParamsFormErrorStatus {
  NO_ERROR = 0,
  NAME_EMPTY = 1,
  // Chinese
  CHINESE = 2,
  // repeat
  REPEAT = 3,
  ASCII = 4,
  // not filled in
  DESC_EMPTY = 5,
}

export const paramsFormErrorStatusText = {
  [ParamsFormErrorStatus.NO_ERROR]: '',
  [ParamsFormErrorStatus.NAME_EMPTY]: I18n.t(
    'Create_newtool_s2_table_name_error1',
  ),
  [ParamsFormErrorStatus.CHINESE]: I18n.t(
    'Create_newtool_s2_table_name_error2',
  ),
  [ParamsFormErrorStatus.REPEAT]: I18n.t('plugin_Parameter_name_error'),
  [ParamsFormErrorStatus.ASCII]: I18n.t('create_plugin_modal_descrip_error'),
  [ParamsFormErrorStatus.DESC_EMPTY]: I18n.t(
    'Create_newtool_s3_table_des_empty',
  ),
};
