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

import { useRef, useEffect, type ComponentType } from 'react';

import { type FallbackProps } from '@coze-arch/logger';
import { I18n } from '@coze-arch/i18n';

import { useUiKitMessageBoxContext } from '../../../context/message-box';
export const FallbackComponent: ComponentType<FallbackProps> = ({ error }) => {
  const { onError } = useUiKitMessageBoxContext();

  const reported = useRef(false);

  useEffect(() => {
    if (!onError || !error) {
      return;
    }

    if (reported.current) {
      return;
    }

    onError(error);
    reported.current = true;
  }, [onError, error]);

  return (
    <div className="p-[12px]">
      <span className="text-[14px] font-medium text-[#222222]">
        {I18n.t('message_content_error')}
      </span>
    </div>
  );
};
