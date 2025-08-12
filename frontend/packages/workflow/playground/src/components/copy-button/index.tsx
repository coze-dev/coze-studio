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

import React, { useState } from 'react';

import { I18n } from '@coze-arch/i18n';
import { IconCozCopy, IconCozCheckMark } from '@coze-arch/coze-design/icons';
import { Tooltip } from '@coze-arch/coze-design';
import { UIIconButton } from '@coze-arch/bot-semi';

const DELAY = 4000;

/**
 * Copy button, click and switch to success state
 * Default delay of 4 seconds
 */
export const CopyButton = ({
  value = '',
  delayTime,
}: {
  value: string;
  delayTime?: number;
}) => {
  const [isSuccess, setSuccess] = useState(false);
  const handleOnClick = e => {
    e.stopPropagation();
    navigator.clipboard.writeText(value as string);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
    }, delayTime ?? DELAY);
  };

  return isSuccess ? (
    <Tooltip content={I18n.t('Duplicate_success')}>
      <UIIconButton
        icon={<IconCozCheckMark color={'rgba(107, 109, 117, 1)'} />}
      />
    </Tooltip>
  ) : (
    <Tooltip content={I18n.t('Copy')}>
      <UIIconButton
        onClick={handleOnClick}
        icon={<IconCozCopy color={'rgba(107, 109, 117, 1)'} />}
      />
    </Tooltip>
  );
};
