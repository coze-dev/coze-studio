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

import { type CSSProperties, type FC, type ReactNode } from 'react';

import classNames from 'classnames';
import { IconCozInfoCircle } from '@coze-arch/coze-design/icons';
import { Tooltip } from '@coze-arch/coze-design';

import { MdTooltip } from '../md-tooltip';

export const FormTitle: FC<{
  title: string;
  tooltip?: string;
  style?: CSSProperties;
  required?: boolean;
}> = ({ title, style, tooltip, required }) => (
  <p
    style={style}
    className={classNames(
      'text-[16px]',
      'coz-fg-plus',
      'font-medium',
      'leading-[22px]',
      'flex',
      'items-center',
    )}
  >
    <span>{title}</span>
    {required ? (
      <i className="coz-fg-hglt-red text-[12px] font-medium">*</i>
    ) : null}
    {tooltip ? (
      <Tooltip content={tooltip}>
        <span className="cursor-pointer ml-[4px] h-[22px] flex items-center">
          <IconCozInfoCircle className="text-[14px] coz-fg-secondary" />
        </span>
      </Tooltip>
    ) : null}
  </p>
);

export const FormSubtitle: FC<{
  title: string;
  required: boolean;
  tooltip?: string;
  style?: CSSProperties;
  suffix?: ReactNode;
}> = ({ title, required, tooltip, style, suffix }) => (
  <p
    className={classNames('flex', 'justify-start', 'items-center')}
    style={style}
  >
    <span className="text-[12px] coz-fg-secondary leading-[16px] font-medium">
      {title}
    </span>
    {required ? (
      <i className="coz-fg-hglt-red text-[12px] font-medium">*</i>
    ) : null}
    <MdTooltip content={tooltip}>
      <span className="cursor-pointer ml-[4px] h-[16px] flex items-center">
        <IconCozInfoCircle className="text-[12px] coz-fg-secondary" />
      </span>
    </MdTooltip>
    {suffix}
  </p>
);
