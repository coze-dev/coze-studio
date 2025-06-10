import React from 'react';

import cls from 'classnames';
import { IconButton } from '@coze/coze-design';
import { IconCollectFilled, IconCollectStroked } from '@coze-arch/bot-icons';

import styles from './index.module.less';

export const FavoriteIcon = (props: {
  isFavorite?: boolean;
  isShowAni: boolean;
  unCollectedIconCls?: string;
  isMobile?: boolean;
  useButton?: boolean;
  className?: string;
}) => {
  const { isFavorite, isShowAni, className, unCollectedIconCls, useButton } =
    props;

  const iconProps = {
    className: cls(
      isFavorite ? styles['icon-filled'] : styles['icon-stroked'],
      isFavorite ? className : unCollectedIconCls,
      {
        [styles['show-ani']]: isFavorite && isShowAni,
        [styles['show-btn']]: useButton,
      },
    ),
  };

  const icon = isFavorite ? (
    <IconCollectFilled {...iconProps} />
  ) : (
    <IconCollectStroked {...iconProps} />
  );

  if (useButton) {
    return <IconButton size="default" color="primary" icon={icon} />;
  }

  return icon;
};
