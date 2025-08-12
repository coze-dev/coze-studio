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

import { type FC, type ReactNode } from 'react';

import { useShallow } from 'zustand/react/shallow';
import { I18n } from '@coze-arch/i18n';
import { Popover } from '@coze-arch/bot-semi';
import { CollapsibleIconButton } from '@coze-studio/components/collapsible-icon-button';
import { InputSlider } from '@coze-studio/components';
import { useModelStore } from '@coze-studio/bot-detail-store/model';
import { ModelFormItem } from '@coze-agent-ide/model-manager';
import { IconCozChatSetting } from '@coze-arch/coze-design/icons';

const DialogueConfig: FC<{ tips: ReactNode }> = ({ tips }) => {
  const { model, setModelByImmer } = useModelStore(
    useShallow(state => ({
      model: state,
      setModelByImmer: state.setModelByImmer,
    })),
  );

  const handleChange = (value: number) => {
    setModelByImmer(draft => {
      if (!draft.config.ShortMemPolicy) {
        draft.config.ShortMemPolicy = { HistoryRound: value };
        return;
      }
      draft.config.ShortMemPolicy.HistoryRound = value;
    });
  };
  return (
    <div className="p-[24px]">
      <div className="leading-[32px] coz-fg-plus text-[20px] font-[500]">
        {I18n.t('workflow_agent_dialog_set')}
      </div>
      {tips ? (
        <div className="mt-[16px] coz-fg-secondary text-[14px] leading-[20px]">
          {tips}
        </div>
      ) : null}
      <div className="mt-[16px] coz-fg-plus text-[14px] leading-[20px] font-[500]">
        {I18n.t('workflow_agent_dialog_set_chathistory')}
      </div>
      <ModelFormItem
        popoverContent={I18n.t('model_config_history_round_explain')}
        label={I18n.t('model_config_history_round')}
      >
        <InputSlider
          step={1}
          min={0}
          max={100}
          decimalPlaces={0}
          value={model.config.ShortMemPolicy?.HistoryRound}
          onChange={handleChange}
        />
      </ModelFormItem>
    </div>
  );
};

const itemKey = Symbol.for('DialogueConfigView');

export const DialogueConfigView: FC<{
  tips: ReactNode;
}> = ({ tips }) => (
  <Popover
    className="overflow-hidden rounded-[12px] w-[600px]"
    trigger="click"
    autoAdjustOverflow={true}
    content={<DialogueConfig tips={tips} />}
  >
    <CollapsibleIconButton
      itemKey={itemKey}
      data-testid="bot.ide.bot_creator.set_model_view_button"
      icon={<IconCozChatSetting className="text-[16px]" />}
      text={I18n.t('workflow_agent_dialog_set')}
    />
  </Popover>
);
