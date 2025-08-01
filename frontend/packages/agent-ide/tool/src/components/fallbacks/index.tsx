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

import { type FC, useState } from 'react';

import { getSlardarInstance } from '@coze-arch/logger';
import { I18n } from '@coze-arch/i18n';
import { IconInfoCircle } from '@coze-arch/bot-icons';

import styles from './index.module.less';

interface IProps {
  toolTitle?: string;
}
export const ToolContainerFallback: FC<IProps> = ({ toolTitle }) => {
  const [sessionId] = useState(() => getSlardarInstance()?.config()?.sessionId);

  return (
    <div className={styles['tool-container-fallback']}>
      <IconInfoCircle />
      <span className={styles.text}>
        {toolTitle}
        {I18n.t('tool_load_error')}
      </span>
      {!!sessionId && (
        <div className="leading-[12px] ml-[6px] text-[12px] text-gray-400">
          {sessionId}
        </div>
      )}
    </div>
  );
};
