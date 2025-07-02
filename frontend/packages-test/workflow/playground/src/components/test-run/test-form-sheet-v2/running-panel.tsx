import React from 'react';

import cls from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { IconCozLoading } from '@coze-arch/coze-design/icons';

import styles from './styles.module.less';

export default function RunningPanel() {
  return (
    <div
      className={cls(
        'w-full h-full absolute flex flex-col items-center justify-center bg-white',
        styles['content-bg-color'],
      )}
    >
      <IconCozLoading className="animate-spin coz-fg-dim mb-[4px] text-[32px]" />
      <span className={'text-[14px]'}>
        {I18n.t('workflow_testset_testruning')}
      </span>
    </div>
  );
}
