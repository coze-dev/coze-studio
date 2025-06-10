import React from 'react';

import classNames from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { Tooltip } from '@coze-arch/bot-semi';
import { IconNo } from '@coze-arch/bot-icons';

import { OperatorLargeSize, OperatorSmallSize } from '@/parameters/constants';

import { type TreeNodeCustomData } from '../../type';
import { ObjectLikeTypes } from '../../constants';
import AddOperation from './add-operation';

import styles from './index.module.less';

interface ParamOperatorProps {
  data: TreeNodeCustomData;
  level: number;
  onAppend: () => void;
  onDelete: () => void;
  disableDelete: boolean;
  hasObjectLike?: boolean;
}

export default function ParamOperator({
  data,
  level,
  onDelete,
  onAppend,
  disableDelete,
  hasObjectLike,
}: ParamOperatorProps) {
  // eslint-disable-next-line @typescript-eslint/no-magic-numbers
  const isLimited = level >= 3;
  // 是否展示新增子项的按钮
  const needRenderAppendChild =
    ObjectLikeTypes.includes(data.type) && !isLimited;
  const computedOperatorStyle = (): React.CSSProperties => {
    if (!hasObjectLike) {
      return { width: OperatorSmallSize };
    }
    return { width: OperatorLargeSize };
  };
  return (
    <div className={styles.container} style={computedOperatorStyle()}>
      <div
        className={styles['icon-no']}
        onClick={() => {
          if (disableDelete) {
            return;
          }
          onDelete();
        }}
      >
        <IconNo
          className={classNames({
            [styles.icon]: true,
            [styles.disabled]: disableDelete,
          })}
        />
      </div>
      {needRenderAppendChild && (
        <div className={styles.add}>
          <Tooltip content={I18n.t('workflow_detail_node_output_add_subitem')}>
            <div>
              <AddOperation onClick={onAppend} />
            </div>
          </Tooltip>
        </div>
      )}
    </div>
  );
}
