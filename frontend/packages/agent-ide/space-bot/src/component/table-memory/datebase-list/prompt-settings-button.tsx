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

import { type PropsWithChildren, useState, useEffect } from 'react';

import { useToolItemContext, ToolItemAction } from '@coze-agent-ide/tool';
import { I18n } from '@coze-arch/i18n';
import { IconCozSetting } from '@coze-arch/coze-design/icons';
import { Popover, Typography, Switch } from '@coze-arch/coze-design';
import { MemoryApi } from '@coze-arch/bot-api';

export type PromptSettingsButtonProps = PropsWithChildren<{
  botId: string;
  databaseId: string;
  promptDisabled?: string;
}>;

export function PromptSettingsButton({
  botId,
  databaseId,
  promptDisabled,
}: PromptSettingsButtonProps) {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(true);

  useEffect(() => {
    const bool = promptDisabled === 'false' ? false : true;
    setChecked(!bool);
  }, [promptDisabled]);

  const { setIsForceShowAction } = useToolItemContext();

  useEffect(() => {
    setIsForceShowAction(visible);
  }, [visible]);

  const handleCheckedChange = (newValue: boolean) => {
    setLoading(true);
    MemoryApi.UpdateDatabaseBotSwitch({
      bot_id: botId,
      database_id: databaseId,
      prompt_disable: !newValue,
    })
      .then(() => setChecked(newValue))
      .finally(() => setLoading(false));
  };

  return (
    <Popover
      trigger="custom"
      visible={visible}
      onClickOutSide={() => setVisible(false)}
      position="bottomRight"
      style={{ width: '480px', padding: '12px 16px 16px' }}
      content={
        <>
          <Typography.Paragraph className="!font-bold leading-[24px] mb-[2px]">
            {I18n.t('db_optimize_034')}
          </Typography.Paragraph>
          <Typography.Paragraph type="secondary" fontSize="12px">
            {I18n.t('db_optimize_035')}
          </Typography.Paragraph>
          <div className="mt-[12px] flex justify-between">
            <Typography.Text className="!font-bold leading-[24px]">
              {I18n.t('db_optimize_036')}
            </Typography.Text>
            <Switch
              size="small"
              loading={loading}
              checked={checked}
              onChange={handleCheckedChange}
            />
          </div>
        </>
      }
    >
      <div>
        <ToolItemAction
          tooltips={I18n.t('db_optimize_034')}
          onClick={() => setVisible(true)}
        >
          <IconCozSetting className="text-base coz-fg-secondary" />
        </ToolItemAction>
      </div>
    </Popover>
  );
}
