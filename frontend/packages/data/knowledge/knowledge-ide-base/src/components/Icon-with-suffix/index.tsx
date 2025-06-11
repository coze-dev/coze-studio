import React from 'react';

import classNames from 'classnames';
import { FormatType } from '@coze-arch/bot-api/memory';
import {
  IconSvgFile,
  IconSvgSheet,
  IconSvgUnbound,
} from '@coze-arch/bot-icons';

import style from './index.module.less';

interface Props {
  hasSuffix: boolean;
  formatType?: FormatType;
  className?: string;
}

export const IconMap = {
  [FormatType.Table]: {
    icon: <IconSvgSheet />,
    bgColor: '#35C566',
    suffixIcon: <IconSvgUnbound />,
    suffixBgColor: 'rgba(255,150,0,1)',
  },
  [FormatType.Text]: {
    icon: <IconSvgFile />,
    bgColor: 'rgba(34, 136, 255, 1)',
    suffixIcon: <IconSvgUnbound />,
    suffixBgColor: 'rgba(255,150,0,1)',
  },
};

export const IconWithSuffix = (props: Props) => {
  const { formatType = FormatType.Text, hasSuffix, className } = props;

  return (
    <div className={classNames(style['icon-with-suffix'], className)}>
      <div
        className={classNames('icon-with-suffix-common', 'icon')}
        style={{
          backgroundColor: `${IconMap?.[formatType]?.bgColor}`,
        }}
      >
        {IconMap?.[formatType]?.icon}
      </div>
      {hasSuffix ? (
        <div
          className={classNames('icon-with-suffix-common', 'suffix')}
          style={{
            backgroundColor: `${IconMap?.[formatType]?.suffixBgColor}`,
          }}
        >
          {IconMap?.[formatType]?.suffixIcon}
        </div>
      ) : null}
    </div>
  );
};
