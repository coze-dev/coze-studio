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

import { useEffect } from 'react';

import { useBotDetailIsReadonly } from '@coze-studio/bot-detail-store';
import { I18n } from '@coze-arch/i18n';
import { Tooltip } from '@coze-arch/coze-design';
import { Popconfirm, UIIconButton } from '@coze-arch/bot-semi';
import { IconStopOutlined, IconAuto } from '@coze-arch/bot-icons';

import commonStyles from '../../assets/styles/index.module.less';

interface AutoGenerateProps {
  needConfirmAgain: boolean;
  confirmAgainTexts: {
    title: string;
    content: string;
  };
  autoTrigger: boolean;
  loading: boolean;
  setLoading?: (autoLoading: boolean) => void;
  generate: () => void;
  cancel: () => void;
}

export const AutoGenerateButton: React.FC<AutoGenerateProps> = ({
  needConfirmAgain,
  confirmAgainTexts,
  loading,
  autoTrigger = false,
  setLoading,
  generate,
  cancel,
}) => {
  const isReadonly = useBotDetailIsReadonly();

  useEffect(() => {
    setLoading?.(loading);
  }, [loading]);

  const handleClick = () => {
    // When loading, stop generating
    if (loading) {
      cancel();
      return;
    }
    // When there is an opening statement, click to trigger the secondary confirmation pop-up window.
    if (needConfirmAgain) {
      return;
    }

    // The remaining triggers automatically generate opening logic
    generate();
  };

  const btn = (
    <span>
      <Tooltip
        content={
          loading
            ? I18n.t('stop_generating')
            : I18n.t('bot_edit_opening_tooltip')
        }
      >
        <UIIconButton
          className={commonStyles['icon-button-16']}
          iconSize="small"
          icon={loading ? <IconStopOutlined /> : <IconAuto />}
          onClick={handleClick}
        >
          {autoTrigger
            ? loading
              ? I18n.t('stop_generating')
              : I18n.t('bot_edit_opening_tooltip')
            : null}
        </UIIconButton>
      </Tooltip>
    </span>
  );
  return needConfirmAgain && !loading ? (
    <Popconfirm
      disabled={isReadonly}
      trigger="click"
      okType="danger"
      okText={I18n.t('bot_opening_remarks_replace_confirm_button')}
      cancelText={I18n.t('bot_opening_remarks_replace_cancel_button')}
      onConfirm={generate}
      {...confirmAgainTexts}
    >
      {btn}
    </Popconfirm>
  ) : (
    <span style={{ display: 'inline-block' }}>{btn}</span>
  );
};
