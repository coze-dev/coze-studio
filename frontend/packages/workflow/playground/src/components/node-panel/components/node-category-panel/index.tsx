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

import { type PropsWithChildren } from 'react';

import { concatTestId } from '@coze-workflow/base';
import { Typography } from '@coze-arch/coze-design';

import styles from './index.module.less';
export interface NodeCategoryPanelProps {
  categoryName?: string;
}
export const NodeCategoryPanel = function ({
  categoryName,
  children,
}: PropsWithChildren<NodeCategoryPanelProps>) {
  return (
    <div className="node-category-panel">
      {categoryName ? (
        <Typography.Text
          className="block coz-fg-secondary leading-5 mb-1 pl-1 font-['PICO_Sans_VFE_SC']"
          weight={500}
          size="normal"
          data-testid={concatTestId(
            'workflow.detail.node-panel.list.category.name',
            categoryName,
          )}
        >
          {categoryName}
        </Typography.Text>
      ) : null}
      <div
        className={styles['node-category-list']}
        data-testid="workflow.detail.node-panel.list.category.list"
      >
        {children}
      </div>
    </div>
  );
};
