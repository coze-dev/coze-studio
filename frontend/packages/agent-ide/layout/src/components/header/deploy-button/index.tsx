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

import { Fragment } from 'react';

import { usePageRuntimeStore } from '@coze-studio/bot-detail-store/page-runtime';
import { I18n } from '@coze-arch/i18n';
import { IconCozCheckMarkCircleFillPalette } from '@coze-arch/coze-design/icons';
import { Tooltip } from '@coze-arch/coze-design';
import { type Type } from '@coze-arch/bot-semi/Button';
import { BotDebugButton } from '@coze-agent-ide/space-bot/component';

import { useDeployService } from './hooks/service';

export interface DeployButtonUIProps {
  btnType?: Type;
  btnText?: string;
  customStyle?: Record<string, string>;
  readonly?: boolean;
  tooltip?: string;
  onClick?: () => void;
  showChangeTip?: boolean;
  disabled?: boolean;
  loading?: boolean;
}

export type DeployButtonProps = Omit<
  DeployButtonUIProps,
  'showChangeTip' | 'onClick' | 'disabled' | 'loading'
>;

export { useDeployService };

export const DeployButton: React.FC<DeployButtonProps> = props => {
  const { handlePublish } = useDeployService();

  const hasUnpublishChange = usePageRuntimeStore(s => s.hasUnpublishChange);

  const showChangeTip = hasUnpublishChange;
  return (
    <DeployButtonUI
      onClick={handlePublish}
      showChangeTip={showChangeTip}
      {...props}
    />
  );
};

export const DeployButtonUI = ({
  btnType = 'primary',
  btnText = I18n.t('bot_publish_button'),
  customStyle,
  readonly = false,
  tooltip,
  showChangeTip,
  onClick,
  disabled,
  loading,
}: DeployButtonUIProps) => {
  const showTip = showChangeTip || !!tooltip;
  const ToolTipCom = showTip ? Tooltip : Fragment;

  const btn = (
    <ToolTipCom
      content={tooltip || I18n.t('bot_has_changes_tip')}
      visible={showChangeTip}
    >
      <BotDebugButton
        data-testid="agent-ide.goto.publish-button"
        theme="solid"
        type={btnType}
        iconPosition="right"
        icon={
          showChangeTip ? (
            <IconCozCheckMarkCircleFillPalette className="w-[5px] h-[5px]" />
          ) : undefined
        }
        style={customStyle}
        disabled={disabled || readonly}
        onClick={onClick}
        loading={loading}
      >
        {btnText}
      </BotDebugButton>
    </ToolTipCom>
  );

  return disabled ? (
    <Tooltip
      content={I18n.t('devops_publish_multibranch_publish_disabled_tooltip')}
    >
      {btn}
    </Tooltip>
  ) : (
    btn
  );
};
