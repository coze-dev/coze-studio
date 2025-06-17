import React from 'react';

import { I18n } from '@coze-arch/i18n';
import { IconCozEmpty } from '@coze-arch/coze-design/icons';

import s from '../index.module.less';

export default function EmptyContent() {
  return (
    <div className={s['empty-block']}>
      <IconCozEmpty
        style={{ fontSize: '32px', color: 'rgba(52, 60, 87, 0.72)' }}
      />
      <span className={s.text}>
        {I18n.t(
          'variable_binding_there_are_no_variables_in_this_project',
          {},
          '该智能体下暂时没有定义变量',
        )}
      </span>
    </div>
  );
}
