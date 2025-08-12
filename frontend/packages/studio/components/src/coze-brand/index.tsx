/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
