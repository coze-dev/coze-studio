import { type PropsWithChildren } from 'react';

import { concatTestId } from '@coze-workflow/base';
import { Typography } from '@coze/coze-design';

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
