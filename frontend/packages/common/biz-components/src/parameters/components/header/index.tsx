import React from 'react';

import cx from 'classnames';
import { I18n } from '@coze-arch/i18n';

import useConfig from '../../hooks/use-config';
import {
  OperatorLargeSize,
  OperatorSmallSize,
  SpacingSize,
  OperatorTypeBaseWidth,
} from '../../constants';

import styles from './index.module.less';

export default function Header() {
  const { readonly, withDescription, hasObjectLike } = useConfig();

  if (readonly) {
    return null;
  }

  return (
    <div
      className={cx(styles.header, {
        [styles.withDescription]: withDescription,
      })}
    >
      {/* name */}
      <div className={styles.name}>
        <span className={styles.text}>
          {I18n.t('workflow_detail_end_output_name')}
        </span>
      </div>

      {/* type */}
      <div
        className={styles.type}
        style={
          withDescription
            ? {
                width: OperatorTypeBaseWidth,
              }
            : !hasObjectLike
            ? { width: OperatorSmallSize + SpacingSize + OperatorTypeBaseWidth }
            : { width: OperatorLargeSize + SpacingSize + OperatorTypeBaseWidth }
        }
      >
        <span className={styles.text}>
          {I18n.t('workflow_detail_start_variable_type')}
        </span>
      </div>

      {/* description 目前只在 LLM 的 output 中存在 */}
      {withDescription ? (
        <div className={styles.description}>
          <span className={styles.text}>
            {I18n.t('workflow_detail_llm_output_decription_title')}
          </span>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
}
