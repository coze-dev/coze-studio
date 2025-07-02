import React from 'react';

import cls from 'classnames';
import { I18n, type I18nKeysNoOptionsType } from '@coze-arch/i18n';
import { Tooltip } from '@coze-arch/bot-semi';

import styles from './page-selector.module.less';

/** 不能选择的类型有两种 */
export enum DisabledType {
  /** 意外情况导致未执行到，结果为空 */
  Empty,
  /** 超出了运行时 variable 本身的长度，预期内的停止 */
  Stop,
}

export const NavigateItemDisabled: React.FC<
  React.PropsWithChildren<{
    type: DisabledType;
    options?: Record<string, unknown>;
  }>
> = ({ type, options, children }) => (
  <Tooltip
    content={
      type === DisabledType.Stop
        ? I18n.t(
            'workflow_detail_testrun_panel_batch_naviagte_stop' as I18nKeysNoOptionsType,
            options,
          )
        : I18n.t('workflow_detail_testrun_panel_batch_naviagte_empty')
    }
  >
    <div
      className={cls(
        styles['paginate-item-disabled'],
        styles['flow-test-run-log-pagination-item'],
      )}
    >
      {children}
    </div>
  </Tooltip>
);
