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
 
/*******************************************************************************
 * test form 相关常量
 */
import get from 'lodash-es/get';
import { FILE_TYPES, ViewVariableType } from '@coze-workflow/base';
import { TimeCapsuleMode } from '@coze-arch/idl/playground_api';
import { IntelligenceType } from '@coze-arch/idl/intelligence_api';
import { I18n } from '@coze-arch/i18n';
import { PlaygroundApi } from '@coze-arch/bot-api';

import { getAccept } from '@/hooks/use-upload';
import { type ValueType } from '@/components/bot-project-select/types';

import { genFileTypeByViewVarType } from '../utils/common';
import { type TestFormField } from '../types';

/** 约定给 testset 的 key */
export { TESTSET_BOT_NAME } from '@coze-workflow/test-run/constants';

/** 约定给 testset 的对话 key */
export const TESTSET_CHAT_NAME = '_WORKFLOW_VARIABLE_NODE_CHAT_ID';

/** test form 类型 */
export enum TestFormType {
  /** 全量运行 */
  Default,
  /** 单节点运行 */
  Single,
}

/** 运行 test run 所用数据的来源 */
export enum TestRunDataSource {
  Aigc = 'aigc',
  Testset = 'testset',
  User = 'user',
}

/** 固定的 field name */
export enum FieldName {
  Node = '_node',
  Batch = '_batch',
  Input = '_input',
  Bot = '_bot',
  Chat = '_chat',
  Datasets = '_datasets',
  DatasetsIs = '_datasets_is',
  DatasetsName = '_datasets_name',
  DatasetsDescription = '_datasets_description',
  Setting = '_setting',
  JSON = '_json',
}

/** field 的基本模版 */
export const DEFAULT_FIELD_TEMPLATE = {
  required: true,
  decorator: {
    type: 'FormItem',
  },
};

/** node 节点的基本模版 */
export const NODE_FIELD_TEMPLATE = {
  type: 'FormObject',
  name: FieldName.Node,
  component: {
    type: 'FieldGroup',
  },
};

export const SETTING_FIELD_TEMPLATE = {
  type: 'FormObject',
  name: FieldName.Setting,
  component: {
    type: 'div',
  },
};

/** 批处理的模版 */
export const BATCH_FIELD_TEMPLATE = {
  type: 'FormObject',
  name: FieldName.Batch,
  component: {
    type: 'div',
  },
};

/** 输入的模版 */
export const INPUT_FIELD_TEMPLATE = {
  type: 'FormObject',
  name: FieldName.Input,
  component: {
    type: 'div',
  },
};

/** 整个 JSON 输入的模版 */
export const INPUT_JSON_FIELD_TEMPLATE = {
  type: 'FormObject',
  name: FieldName.JSON,
};

export const getConversationTemplate = chatFlowService => {
  const conversationDefaultVisible =
    chatFlowService?.selectItem?.type === IntelligenceType.Project;
  return {
    type: 'FormString',
    name: FieldName.Chat,
    required: true,
    title: I18n.t('wf_chatflow_74'),
    component: {
      type: 'ConversationSelect',
      props: {
        // 传入 bot 组件的 projectId（选择项为 bot 的场景不展示）
        projectId: `{{$parent.children?.find(item => item.type?.name === "${FieldName.Bot}")?.value}}`,
      },
    },
    decorator: {
      type: 'FormItem',
      props: {
        tooltip: I18n.t('wf_chatflow_154'),
      },
    },
    // bot / project 不选择的时候，conversation 不会展示
    // 初始化设置 false，其余回显逻辑在 packages/workflow/playground/src/components/test-run/test-form-sheet-v2/form-v2.tsx
    visible: conversationDefaultVisible,
    validator: [
      {
        triggerType: 'onBlur',
        required: true,
        message: I18n.t('workflow_testset_required_tip', {
          param_name: 'Conversation',
        }),
      },
      {
        triggerType: 'onBlur',
        validator: (value: string) => {
          if (!value) {
            return false;
          }
          return true;
        },
      },
    ],
  };
};

export const getBotFieldTemplate = (isNeedBotEnv, showBot, chatflowService) => {
  const { hasLTMNode = false } = isNeedBotEnv || {};
  /** 选择 bot 的模版 */
  const BOT_FIELD_TEMPLATE = {
    type: 'FormVoid',
    title: I18n.t('wf_chatflow_72'),
    name: FieldName.Bot,
    component: {
      type: 'FieldGroup',
    },
    children: showBot
      ? [
          {
            type: 'FormObject',
            name: FieldName.Bot,
            required: true,
            title: I18n.t('wf_chatflow_72'),
            component: {
              type: 'BotProjectSelect',
            },
            decorator: {
              type: 'FormItem',
            },
            validator: [
              {
                triggerType: 'onBlur',
                required: true,
                message: I18n.t('workflow_testset_required_tip', {
                  param_name: 'Bot',
                }),
              },
              {
                triggerType: 'onBlur',
                validator: async (
                  value?:
                    | {
                        id?: string;
                        type?: IntelligenceType;
                      }
                    | string,
                ) => {
                  const validateValue = (value as ValueType)?.id;
                  const isProject =
                    chatflowService?.selectItem?.type ===
                      IntelligenceType.Project ||
                    (value as ValueType)?.type === IntelligenceType.Project;
                  // 仅智能体支持 onBlur 逻辑，项目场景不支持
                  if (isProject) {
                    return true;
                  }
                  if (!validateValue) {
                    return true;
                  }
                  const botInfo = await PlaygroundApi.GetDraftBotInfoAgw({
                    bot_id: validateValue,
                  });
                  const timeCapsuleMode = get(
                    botInfo,
                    [
                      'data',
                      'bot_info',
                      'bot_tag_info',
                      'time_capsule_info',
                      'time_capsule_mode',
                    ],
                    TimeCapsuleMode.Off,
                  );
                  const ltmEnabled = timeCapsuleMode === TimeCapsuleMode.On;
                  if (hasLTMNode && !ltmEnabled) {
                    return 'This Bot does not have LTM enabled.';
                  }
                  return true;
                },
              },
            ],
          },
        ]
      : [],
  };

  return BOT_FIELD_TEMPLATE;
};

/** 保存到 datasets 的模版 */
export const DATASETS_FIELD_TEMPLATE = {
  type: 'FormObject',
  name: FieldName.Datasets,
  component: {
    type: 'div',
  },
  children: [
    {
      type: 'FormString',
      name: FieldName.DatasetsIs,
      component: {
        type: 'Checkbox',
        props: {
          title: I18n.t('workflow_debug_data_save'),
        },
      },
      decorator: {
        type: 'FormItem',
      },
    },
    // {
    //   type: 'FormString',
    //   name: FieldName.DatasetsName,
    //   title: I18n.t('workflow_testset_name'),
    //   component: {
    //     type: 'TestsetNameInput',
    //     props: {
    //       maxLength: 50,
    //     },
    //   },
    //   hidden: `{{ !$values?.${FieldName.Datasets}?.${FieldName.DatasetsIs} }}`,
    //   required: true,
    //   decorator: {
    //     type: 'FormItem',
    //   },
    //   validator: [
    //     {
    //       required: true,
    //       triggerType: 'onBlur',
    //       message: I18n.t('workflow_testset_required_tip', {
    //         param_name: '{{$self.title}}',
    //       }),
    //     },
    //   ],
    // },
    // {
    //   type: 'FormString',
    //   name: FieldName.DatasetsDescription,
    //   title: I18n.t('workflow_testset_desc'),
    //   component: {
    //     type: 'Input',
    //     props: {
    //       maxCount: 200,
    //       maxLength: 200,
    //     },
    //   },
    //   hidden: `{{ !$values?.${FieldName.Datasets}?.${FieldName.DatasetsIs} }}`,
    //   decorator: {
    //     type: 'FormItem',
    //   },
    // },
  ],
};

/**
 * 一些公共的 field 字段
 */
export const COMMON_FIELD = {
  required: true,
  decorator: {
    type: 'FormItem',
  },
  validator: [
    {
      required: true,
      triggerType: 'onBlur',
      message: I18n.t('workflow_testset_required_tip', {
        param_name: '{{$self.title}}',
      }),
    },
  ],
};

type FileTypes =
  | ViewVariableType.Image
  | ViewVariableType.File
  | ViewVariableType.File
  | ViewVariableType.Image
  | ViewVariableType.Doc
  | ViewVariableType.Code
  | ViewVariableType.Ppt
  | ViewVariableType.Txt
  | ViewVariableType.Excel
  | ViewVariableType.Audio
  | ViewVariableType.Zip
  | ViewVariableType.Video
  | ViewVariableType.Svg
  | ViewVariableType.Voice
  | ViewVariableType.ArrayImage
  | ViewVariableType.ArrayFile
  | ViewVariableType.ArrayDoc
  | ViewVariableType.ArrayCode
  | ViewVariableType.ArrayPpt
  | ViewVariableType.ArrayTxt
  | ViewVariableType.ArrayExcel
  | ViewVariableType.ArrayAudio
  | ViewVariableType.ArrayZip
  | ViewVariableType.ArrayVideo
  | ViewVariableType.ArraySvg
  | ViewVariableType.ArrayVoice;

const FILE_TYPE_FIELD_MAP: Record<FileTypes, TestFormField> = FILE_TYPES.reduce(
  (map, type) => {
    const multiple = ViewVariableType.isArrayType(type);

    return {
      ...map,
      [type]: {
        type: 'FormString',
        component: {
          type: 'File',
          props: {
            multiple,
            accept: getAccept(type),
            inputType: type,
            fileType: genFileTypeByViewVarType(type),
            enableInputURL: true,
          },
        },
      },
    };
  },
  {},
) as Record<FileTypes, TestFormField>;

/** 各类型到 field 的映射 */
export const NOT_FILE_TYPE_FIELD_MAP: Record<
  Exclude<ViewVariableType, FileTypes>,
  TestFormField
> = {
  [ViewVariableType.String]: {
    type: 'FormString',
    component: {
      type: 'Input',
    },
  },
  [ViewVariableType.Integer]: {
    type: 'FormNumber',
    component: {
      type: 'InputInteger',
    },
  },
  [ViewVariableType.Boolean]: {
    type: 'FormBoolean',
    initialValue: true,
    component: {
      type: 'Switch',
    },
  },
  [ViewVariableType.Number]: {
    type: 'FormNumber',
    component: {
      type: 'InputNumber',
    },
  },
  [ViewVariableType.Time]: {
    type: 'FormString',
    component: {
      type: 'InputTime',
    },
  },
  [ViewVariableType.Object]: {
    type: 'FormString',
    component: {
      type: 'JsonEditor',
    },
    initialValue: '{}',
  },
  [ViewVariableType.ArrayString]: {
    type: 'FormString',
    component: {
      type: 'JsonEditor',
    },
    initialValue: '[]',
  },
  [ViewVariableType.ArrayInteger]: {
    type: 'FormString',
    component: {
      type: 'JsonEditor',
    },
    initialValue: '[]',
  },
  [ViewVariableType.ArrayBoolean]: {
    type: 'FormString',
    component: {
      type: 'JsonEditor',
    },
    initialValue: '[]',
  },
  [ViewVariableType.ArrayNumber]: {
    type: 'FormString',
    component: {
      type: 'JsonEditor',
    },
    initialValue: '[]',
  },
  [ViewVariableType.ArrayObject]: {
    type: 'FormString',
    component: {
      type: 'JsonEditor',
    },
    initialValue: '[]',
  },
  [ViewVariableType.ArrayTime]: {
    type: 'FormString',
    component: {
      type: 'JsonEditor',
    },
    initialValue: '[]',
  },
};

export const TYPE_FIELD_MAP: Record<ViewVariableType, TestFormField> = {
  ...NOT_FILE_TYPE_FIELD_MAP,
  ...FILE_TYPE_FIELD_MAP,
};
