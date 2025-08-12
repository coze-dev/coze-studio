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

import React from 'react';

import { DataNamespace, dataReporter } from '@coze-data/reporter';
import { REPORT_EVENTS } from '@coze-arch/report-events';
import { I18n } from '@coze-arch/i18n';
import { UIIconButton, Icon, Tooltip, UIModal } from '@coze-arch/bot-semi';
import { IconCloseKnowledge, IconWarningSize24 } from '@coze-arch/bot-icons';
import { KnowledgeApi } from '@coze-arch/bot-api';

import { ReactComponent as SvgTranslate } from '@/assets/icon_translate.svg';

import styles from './index.module.less';

export interface AutoGenerateButtonProps {
  currentValue: string;
  document_id: string;
  disable: boolean;
  onChange: (value: string) => void;
  onProgress: (loading: boolean) => void;
}

export const AutoGenerateButton: React.FC<AutoGenerateButtonProps> = ({
  currentValue,
  document_id,
  disable,
  onChange,
  onProgress,
}) => {
  const handleGenerate = async () => {
    const generateCaption = async () => {
      onProgress(true);
      try {
        const res = await KnowledgeApi.ExtractPhotoCaption({
          document_id,
        });
        if (res.caption) {
          onChange(res.caption);
        }
      } catch (error) {
        dataReporter.errorEvent(DataNamespace.KNOWLEDGE, {
          eventName: REPORT_EVENTS.KnowledgeGeneratePhotoCaption,
          error: error as Error,
        });
      } finally {
        onProgress(false);
      }
    };
    // If there is no caption, do not confirm
    if (!currentValue) {
      await generateCaption();
      return;
    }
    UIModal.warning({
      // Required parameters to confirm modal style
      className: styles['confirm-modal'],
      closeIcon: <IconCloseKnowledge />,

      // custom parameters
      title: I18n.t('knowledge_photo_021'),
      content: I18n.t('knowledge_photo_022'),
      icon: <IconWarningSize24 />,
      cancelText: I18n.t('Cancel'),
      okText: I18n.t('Confirm'),
      okButtonProps: { theme: 'solid', type: 'warning' },
      onOk: () => {
        generateCaption();
      },
    });
  };

  return (
    <Tooltip content={I18n.t('knowledge_photo_020')}>
      <UIIconButton
        icon={
          <Icon
            svg={
              <SvgTranslate
                color={disable ? 'rgba(28, 31, 35, 0.35)' : '#4D53E8'}
              />
            }
          />
        }
        className="absolute !bottom-[8px] !left-[12px]"
        onClick={handleGenerate}
        disabled={disable}
      />
    </Tooltip>
  );
};
