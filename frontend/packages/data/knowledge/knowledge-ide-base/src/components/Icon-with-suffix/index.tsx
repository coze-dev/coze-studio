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
