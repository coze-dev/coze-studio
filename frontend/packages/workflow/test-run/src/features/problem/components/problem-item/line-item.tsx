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

import { I18n } from '@coze-arch/i18n';
import { IconCozAddNode } from '@coze-arch/coze-design/icons';
import { Typography } from '@coze-arch/coze-design';

import { type ProblemItem } from '../../types';
import i18n from './line-case-i18n.png';
import cn from './line-case-cn.png';
import { BaseItem } from './base-item';

import styles from './line-item.module.less';

interface LineItemProps {
  problem: ProblemItem;
  idx: number;
  onClick: (p: ProblemItem) => void;
}

const LinePopover = () => {
  const lang = I18n.getLanguages();
  const currentLang = lang[0];

  return (
    <div className={styles['line-popover']}>
      <Typography.Text fontSize="16px">
        {I18n.t('workflow_running_results_line_error')}
      </Typography.Text>
      <img src={['zh-CN', 'zh'].includes(currentLang) ? cn : i18n} />
    </div>
  );
};

export const LineItem: React.FC<LineItemProps> = ({
  problem,
  idx,
  onClick,
}) => (
  <BaseItem
    problem={problem}
    title={`${I18n.t('workflow_connection_name')}${idx + 1}`}
    icon={<IconCozAddNode className={styles['line-icon']} />}
    popover={<LinePopover />}
    onClick={onClick}
  />
);
