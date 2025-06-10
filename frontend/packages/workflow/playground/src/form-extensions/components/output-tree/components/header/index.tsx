/* eslint-disable @typescript-eslint/no-magic-numbers */
import React from 'react';

import { I18n } from '@coze-arch/i18n';

import { useColumnsStyle } from '../../hooks/use-columns-style';
import { TreeCollapseWidth } from '../../constants';

import styles from './index.module.less';

interface HeaderProps {
  readonly?: boolean;
  config: {
    hasObjectLike?: boolean;
    hasCollapse?: boolean;
    hasDescription?: boolean;
    hasRequired?: boolean;
  };
  columnsRatio?: string;
}

export default function Header({
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
          {I18n.t('workflow_detail_end_output_name')}
        </span>
      </div>

      {/* type */}
      <div className={styles.type} style={columnsStyle.type}>
        <span className={styles.text}>
          {I18n.t('workflow_detail_start_variable_type')}
        </span>
      </div>

      <div className="relative flex gap-1">
        {/* required label */}
        {config.hasRequired ? (
          <div className={styles.required}>
            <span className={styles.text}>{I18n.t('wf_20241206_001')}</span>
          </div>
        ) : null}

        {/* description */}
        {config.hasDescription ? (
          <div
            className={styles.description}
            style={{
              width: 24,
            }}
          >
            <div className={styles.descriptionTitle}>
              <span className={styles.text}>
                {/* {I18n.t('workflow_detail_llm_output_decription_title')} */}
              </span>
            </div>
          </div>
        ) : null}

        {/* 对象操作占位符 */}
        {config.hasObjectLike ? <div className="w-6"></div> : null}

        {/* 必填占位符 */}
        {config.hasRequired ? <div className="w-6"></div> : null}

        {/* 删除按钮占位符 */}
        <div className="w-6"></div>
      </div>
    </div>
  );
}
