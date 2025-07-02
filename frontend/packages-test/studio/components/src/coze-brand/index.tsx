import React from 'react';

import classNames from 'classnames';
import {
  IconBrandCnWhiteRow,
  IconBrandCnBlackRow,
  IconBrandEnBlackRow,
} from '@coze-arch/bot-icons';
import { useNavigate } from 'react-router-dom';

import styles from './index.module.less';

export interface CozeBrandProps {
  isOversea: boolean;
  isWhite?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function CozeBrand({
  isOversea,
  isWhite,
  className,
  style,
}: CozeBrandProps) {
  const navigate = useNavigate();
  const navBack = () => {
    navigate('/');
  };
  if (isOversea) {
    return (
      <IconBrandEnBlackRow
        onClick={navBack}
        className={classNames(styles['coze-brand'], className)}
        style={style}
      />
    );
  }
  if (isWhite) {
    return (
      <IconBrandCnWhiteRow
        onClick={navBack}
        className={classNames(styles['coze-brand'], className)}
        style={style}
      />
    );
  }
  return (
    <IconBrandCnBlackRow
      onClick={navBack}
      className={classNames(styles['coze-brand'], className)}
      style={style}
    />
  );
}
