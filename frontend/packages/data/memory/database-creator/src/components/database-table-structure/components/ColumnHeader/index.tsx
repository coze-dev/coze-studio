import { type FC, type ReactNode } from 'react';

import { Icon, Popover } from '@coze-arch/bot-semi';

import { ReactComponent as InfoSVG } from '../../../../assets/icon_info_outlined.svg';

import s from './index.module.less';

export const ColumnHeader: FC<{
  label: string;
  required: boolean;
  tips: ReactNode;
}> = p => {
  const { label, required, tips } = p;
  return (
    <div className={s['column-title']}>
      <span>{label}</span>
      {required ? <span style={{ color: 'red' }}>*</span> : null}
      <Popover showArrow position="top" content={<div>{tips}</div>}>
        <Icon
          svg={<InfoSVG />}
          className={s['table-header-label-tooltip-icon']}
        />
      </Popover>
    </div>
  );
};
