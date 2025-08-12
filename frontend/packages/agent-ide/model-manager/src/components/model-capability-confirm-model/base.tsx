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

import { useState, type FC } from 'react';

import { groupBy } from 'lodash-es';
import { useBotSkillStore } from '@coze-studio/bot-detail-store/bot-skill';
import { I18n } from '@coze-arch/i18n';
import { IconCozCross } from '@coze-arch/coze-design/icons';
import {
  Button,
  Checkbox,
  Modal,
  IconButton,
  Space,
} from '@coze-arch/coze-design';
import {
  type Model,
  ModelFuncConfigStatus,
  ModelFuncConfigType,
} from '@coze-arch/bot-api/developer_api';
import { ToolGroupKey, ToolKey } from '@coze-agent-ide/tool-config';
import {
  type useRegisteredToolKeyConfigList,
  abilityKey2ModelFunctionConfigType,
} from '@coze-agent-ide/tool';
import { mergeModelFuncConfigStatus } from '@coze-agent-ide/bot-editor-context-store';

type IRegisteredToolKeyConfig = ReturnType<
  typeof useRegisteredToolKeyConfigList
>[number];

const getToolGroupText = (key: ToolGroupKey): string =>
  ({
    [ToolGroupKey.SKILL]: I18n.t('bot_edit_type_skills'),
    [ToolGroupKey.KNOWLEDGE]: I18n.t('bot_edit_type_knowledge'),
    [ToolGroupKey.MEMORY]: I18n.t('bot_edit_type_memory'),
    [ToolGroupKey.DIALOG]: I18n.t('bot_edit_type_dialog'),
    [ToolGroupKey.CHARACTER]: I18n.t('bot_edit_type_character'),
    [ToolGroupKey.HOOKS]: 'Hooks',
  }[key]);

const getToolText = (toolKey: ToolKey) =>
  ({
    [ToolKey.PLUGIN]: I18n.t('Plugins'),
    [ToolKey.WORKFLOW]: I18n.t('Workflows'),
    [ToolKey.IMAGEFLOW]: I18n.t('imageflow_title'),
    // Abandoned
    [ToolKey.KNOWLEDGE]: '',
    [ToolKey.VARIABLE]: I18n.t('user_profile'),
    [ToolKey.DATABASE]: I18n.t('bot_database'),
    [ToolKey.LONG_TERM_MEMORY]: I18n.t('timecapsule_1228_001'),
    [ToolKey.FILE_BOX]: I18n.t('Starling_filebox_name'),
    [ToolKey.TRIGGER]: I18n.t('platfrom_triggers_title'),
    [ToolKey.ONBOARDING]: I18n.t('bot_preview_opening_remarks'),
    [ToolKey.SUGGEST]: I18n.t('bot_edit_suggestion'),
    [ToolKey.VOICE]: I18n.t('bot_edit_voices_title'),
    [ToolKey.BACKGROUND]: I18n.t('bgi_title'),
    [ToolKey.DOCUMENT]: I18n.t('dataset_detail_type_text'),
    [ToolKey.TABLE]: I18n.t('dataset_detail_type_table'),
    [ToolKey.PHOTO]: I18n.t('knowledge_photo_025'),
    [ToolKey.SHORTCUT]: I18n.t('bot_ide_shortcut'),
    [ToolKey.DEV_HOOKS]: 'Hooks',
    [ToolKey.USER_INPUT]: I18n.t('chat_setting_user_input_default_mode'),
  }[toolKey]);

const AlertGroups: FC<{ items: AlertItem[] }> = ({ items }) => {
  const grouped = groupBy(items, 'groupTitle');
  return (
    <div>
      {Object.entries(grouped).map(([groupTitle, groupItems]) => (
        <div
          key={groupTitle}
          className="py-[12px] flex items-center coz-stroke-primary border-0 border-solid border-b gap-5 pr-2"
        >
          <div className="min-w-[60px]">{groupTitle}</div>
          <div className="flex-1 overflow-hidden whitespace-pre-line">
            {groupItems.map(item => item.title).join(', ')}
          </div>
        </div>
      ))}
    </div>
  );
};

export interface AlertItem {
  title: string;
  groupTitle: string;
}

export const ModelCapabilityAlertModelContent: FC<{
  notSupported: AlertItem[];
  poorSupported: AlertItem[];
  modelName: string;
  onOk: () => void;
  onCancel: () => void;
}> = ({ notSupported, poorSupported, modelName, onOk, onCancel }) => {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="coz-fg-plus text-[20px]">
          {I18n.t('confirm_switch_model')}
        </div>
        <IconButton
          icon={<IconCozCross />}
          onClick={onCancel}
          theme="borderless"
        />
      </div>
      <div className="coz-fg-primary text-[14px]">
        {I18n.t('model_support_poor_warning', {
          modelName,
        })}
      </div>
      {notSupported.length ? (
        <div className="mt-[24px]">
          <div className="coz-fg-secondary text-[12px]">
            {I18n.t('model_not_supported')}
          </div>
          <AlertGroups items={notSupported} />
        </div>
      ) : null}
      {poorSupported.length ? (
        <div className="mt-[24px]">
          <div className="coz-fg-secondary text-[12px]">
            {I18n.t('model_support_poor')}
          </div>
          <AlertGroups items={poorSupported} />
        </div>
      ) : null}
      <div className="mt-[24px] flex items-center justify-between">
        <Checkbox onChange={e => setDontShowAgain(!!e.target.checked)}>
          {I18n.t('do_not_remind_again')}
        </Checkbox>
        <Space>
          <Button
            color="primary"
            onClick={() => {
              onCancel();
            }}
          >
            {I18n.t('Cancel')}
          </Button>
          <Button
            color="brand"
            onClick={() => {
              if (dontShowAgain) {
                localStorage.setItem(DONT_SHOW_TIPS_LOCAL_CACHE_KEY, 'true');
              }
              onOk();
            }}
          >
            {I18n.t('Confirm')}
          </Button>
        </Space>
      </div>
    </div>
  );
};

// TODO uniformly encapsulates the localStorage service and manages the lifecycle of the local cache
export const DONT_SHOW_TIPS_LOCAL_CACHE_KEY =
  'model_capability_check_do_not_show_again';

export const checkModelAbility = (
  toolKeyConfigList: IRegisteredToolKeyConfig[],
  config: NonNullable<Model['func_config']>,
): [AlertItem[], AlertItem[]] =>
  toolKeyConfigList.reduce<[AlertItem[], AlertItem[]]>(
    ([notSupportedRes, poorSupportedRes], item) => {
      const { hasValidData, toolKey, toolGroupKey } = item;
      // Check only if the current tool configuration exists
      if (hasValidData) {
        const modelFunctionConfigType =
          abilityKey2ModelFunctionConfigType(toolKey);
        if (!modelFunctionConfigType) {
          return [notSupportedRes, poorSupportedRes];
        }
        let modelFunctionConfigStatus = config[modelFunctionConfigType];
        if (toolGroupKey === ToolGroupKey.KNOWLEDGE) {
          const { auto } = useBotSkillStore.getState().knowledge.dataSetInfo;
          if (toolGroupKey === ToolGroupKey.KNOWLEDGE) {
            const autoConfigStatus =
              config[
                auto
                  ? ModelFuncConfigType.KnowledgeAutoCall
                  : ModelFuncConfigType.KnowledgeOnDemandCall
              ];
            modelFunctionConfigStatus = mergeModelFuncConfigStatus(
              // @ts-expect-error fix me late
              autoConfigStatus,
              modelFunctionConfigStatus,
            );
          }
        }

        const alertItem: AlertItem = {
          groupTitle: getToolGroupText(item.toolGroupKey),
          title: item.toolTitle ?? getToolText(item.toolKey),
        };
        if (modelFunctionConfigStatus === ModelFuncConfigStatus.NotSupport) {
          notSupportedRes.push(alertItem);
        }
        if (modelFunctionConfigStatus === ModelFuncConfigStatus.PoorSupport) {
          poorSupportedRes.push(alertItem);
        }
      }
      return [notSupportedRes, poorSupportedRes];
    },
    [[], []],
  );

export const confirm = ({
  notSupported,
  poorSupported,
  modelName,
}: {
  notSupported: AlertItem[];
  poorSupported: AlertItem[];
  modelName: string;
}): Promise<boolean> => {
  if (notSupported.length > 0 || poorSupported.length > 0) {
    return new Promise(resolve => {
      const modal = Modal.confirm({
        header: null,
        // It needs to be higher than the default z-index 1030 of the popover configured by the model.
        zIndex: 1031,
        mask: false,
        width: 480,
        onCancel: () => {
          resolve(false);
          modal.destroy();
        },
        content: (
          <ModelCapabilityAlertModelContent
            notSupported={notSupported}
            poorSupported={poorSupported}
            modelName={modelName}
            onOk={() => {
              resolve(true);
              modal.destroy();
            }}
            onCancel={() => {
              resolve(false);
              modal.destroy();
            }}
          />
        ),
        footer: false,
        showCancelButton: false,
      });
    });
  }
  return Promise.resolve(true);
};

const getGroupTittleByConfigType = (type: ModelFuncConfigType): string =>
  // @ts-expect-error fix me late
  ({
    [ModelFuncConfigType.Plugin]: I18n.t('bot_edit_type_skills'),
    [ModelFuncConfigType.Workflow]: I18n.t('bot_edit_type_skills'),
    [ModelFuncConfigType.ImageFlow]: I18n.t('bot_edit_type_skills'),
    [ModelFuncConfigType.Trigger]: I18n.t('bot_edit_type_skills'),
    [ModelFuncConfigType.KnowledgeText]: I18n.t('bot_edit_type_knowledge'),
    [ModelFuncConfigType.KnowledgeTable]: I18n.t('bot_edit_type_knowledge'),
    [ModelFuncConfigType.KnowledgePhoto]: I18n.t('bot_edit_type_knowledge'),
    [ModelFuncConfigType.KnowledgeAutoCall]: I18n.t('bot_edit_type_knowledge'),
    [ModelFuncConfigType.KnowledgeOnDemandCall]: I18n.t(
      'bot_edit_type_knowledge',
    ),
    [ModelFuncConfigType.Variable]: I18n.t('bot_edit_type_memory'),
    [ModelFuncConfigType.Database]: I18n.t('bot_edit_type_memory'),
    [ModelFuncConfigType.LongTermMemory]: I18n.t('bot_edit_type_memory'),
    [ModelFuncConfigType.FileBox]: I18n.t('bot_edit_type_memory'),
    [ModelFuncConfigType.Onboarding]: I18n.t('bot_edit_type_dialog'),
    [ModelFuncConfigType.Suggestion]: I18n.t('bot_edit_type_dialog'),
    [ModelFuncConfigType.ShortcutCommand]: I18n.t('bot_edit_type_dialog'),
    [ModelFuncConfigType.BackGroundImage]: I18n.t('bot_edit_type_dialog'),
    [ModelFuncConfigType.TTS]: I18n.t('bot_edit_type_character'),
    [ModelFuncConfigType.MultiAgentRecognize]: I18n.t(
      'agentflow_transfer_ conversation_settings_title',
    ),
    [ModelFuncConfigType.HookInfo]: 'Hooks',
  }[type]);

const getTitleByConfigType = (type: ModelFuncConfigType): string =>
  // @ts-expect-error fix me late
  ({
    [ModelFuncConfigType.Plugin]: I18n.t('Plugins'),
    [ModelFuncConfigType.Workflow]: I18n.t('Workflows'),
    [ModelFuncConfigType.ImageFlow]: I18n.t('imageflow_title'),
    [ModelFuncConfigType.Trigger]: I18n.t('platfrom_triggers_title'),
    [ModelFuncConfigType.KnowledgeText]: I18n.t('dataset_detail_type_text'),
    [ModelFuncConfigType.KnowledgeTable]: I18n.t('dataset_detail_type_table'),
    [ModelFuncConfigType.KnowledgePhoto]: I18n.t('knowledge_photo_025'),
    [ModelFuncConfigType.KnowledgeAutoCall]: I18n.t('dataset_automatic_call'),
    [ModelFuncConfigType.KnowledgeOnDemandCall]: I18n.t(
      'dataset_on_demand_call',
    ),
    [ModelFuncConfigType.Variable]: I18n.t('user_profile'),
    [ModelFuncConfigType.Database]: I18n.t('bot_database'),
    [ModelFuncConfigType.LongTermMemory]: I18n.t('timecapsule_1228_001'),
    [ModelFuncConfigType.FileBox]: I18n.t('Starling_filebox_name'),
    [ModelFuncConfigType.Onboarding]: I18n.t('bot_preview_opening_remarks'),
    [ModelFuncConfigType.Suggestion]: I18n.t('bot_edit_suggestion'),
    [ModelFuncConfigType.ShortcutCommand]: I18n.t('bot_ide_shortcut'),
    [ModelFuncConfigType.BackGroundImage]: I18n.t('bgi_title'),
    [ModelFuncConfigType.TTS]: I18n.t('bot_edit_voices_title'),
    [ModelFuncConfigType.MultiAgentRecognize]: I18n.t(
      'agentflow_transfer_ conversation_settings_mode_node_title',
    ),
    [ModelFuncConfigType.HookInfo]: 'Hooks',
  }[type]);

export const mapConfigTypeToAlertItem = (
  type: ModelFuncConfigType,
): AlertItem => ({
  groupTitle: getGroupTittleByConfigType(type),
  title: getTitleByConfigType(type),
});
