/* eslint-disable @typescript-eslint/no-magic-numbers */
import React from 'react';

import { I18n } from '@coze-arch/i18n';

import { useColumnsStyle } from '../../hooks/use-columns-style';
import { TreeCollapseWidth } from '../../constants';

import styles from './index.module.less';

interface HeaderProps {
  readonly?: boolean;
  config: {
    hasObject?: boolean;
    hasCollapse?: boolean;
  };
  columnsRatio?: string;
}

export default function InputHeader({
  readonly,
  config,
  columnsRatio,
}: HeaderProps) {
  const columnsStyle = useColumnsStyle(columnsRatio);

  if (readonly) {
    return null;
  }
  return (
    <div
      className={styles.header}
      style={{
        marginLeft: config.hasCollapse ? TreeCollapseWidth + 8 : 0,
      }}
    >
      {/* name */}
      <div className={styles.name} style={columnsStyle.name}>
        <span className={styles.text}>
          {I18n.t('workflow_detail_node_parameter_name')}
        </span>
      </div>

      {/* value */}
      <div className={styles.value} style={columnsStyle.value}>
        <span className={styles.text}>
          {I18n.t('workflow_detail_node_parameter_value')}
        </span>
      </div>

      {readonly ? null : (
        <div className="relative flex gap-1">
          {/* 对象操作占位符 */}
          {config.hasObject ? <div className="w-6"></div> : null}

          {/* 删除按钮占位符 */}
          <div className="w-6"></div>
        </div>
      )}
    </div>
  );
}
