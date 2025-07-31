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

import {
  type LiteralExpression,
  type ValueExpression,
  ValueExpressionType,
  ViewVariableType,
} from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';
import { IconCozTrashCan } from '@coze-arch/coze-design/icons';
import { IconButton, Select } from '@coze-arch/coze-design';
import type { TreeNodeData } from '@coze-arch/bot-semi/Tree';
import type { SelectProps } from '@coze-arch/bot-semi/Select';
import { useSelectVoiceModal } from '@coze-workflow/resources-adapter';

import { useGlobalState } from '@/hooks';
import { type InputType } from '@/form-extensions/components/literal-value-input';

import { VoiceOption, VoiceTag } from './voice-option';

interface Props {
  inputType?: InputType;
  onChange?: (value?: ValueExpression) => void;
  disabled?: boolean;
  value?: ValueExpression;
  validateStatus?: SelectProps['validateStatus'];
  onBlur?: () => void;
}

export default function useVoice({
  inputType = ViewVariableType.String,
  onChange,
  disabled,
  value,
  validateStatus,
  onBlur,
}: Props) {
  const { spaceId } = useGlobalState(false);

  const { open: openSelectVoiceModal, modal: selectVoiceModal } =
    useSelectVoiceModal({
      spaceId,
      onSelectVoice: voice => {
        onChange?.({
          type: ValueExpressionType.LITERAL,
          content: voice?.voice_id || '',
          rawMeta: {
            fileName: voice?.voice_name,
            type: ViewVariableType.Voice,
          },
        });
      },
    });

  const renderVariableSelectorExtraOption = (
    _data?: TreeNodeData[],
    action?: {
      hiddenPopover: () => void;
    },
  ) => {
    // Currently only voice types have additional options.
    if (ViewVariableType.isVoiceType(inputType)) {
      const handleClickVoiceOption = () => {
        openSelectVoiceModal();
        action?.hiddenPopover();
      };

      return <VoiceOption onClick={handleClickVoiceOption} />;
    }

    return null;
  };

  const voiceSelector = (
    <Select
      borderless
      emptyContent={null}
      triggerRender={() => (
        <div
          className="cursor-pointer w-full overflow-hidden flex items-center justify-between pl-[4px]"
          style={{
            fontSize: 12,
            color: 'var(--semi-color-text-2)',
          }}
          onClick={() => {
            !disabled && openSelectVoiceModal();
          }}
        >
          {value?.content ? (
            <>
              <VoiceTag
                name={(value as LiteralExpression)?.rawMeta?.fileName}
              />
              <IconButton
                onClick={e => {
                  e.stopPropagation();
                  onChange?.(undefined);
                }}
                color="secondary"
                size="small"
                icon={<IconCozTrashCan />}
              ></IconButton>
            </>
          ) : (
            I18n.t('workflow_variable_select_voice')
          )}
        </div>
      )}
      disabled={disabled}
      onBlur={onBlur}
      value={(value as LiteralExpression)?.rawMeta?.fileName as string}
      placeholder={I18n.t('workflow_variable_select_voice')}
      validateStatus={validateStatus}
      size="small"
      style={{
        width: '100%',
      }}
    />
  );

  return {
    renderVariableSelectorExtraOption,
    selectVoiceModal,
    voiceSelector,
  };
}
