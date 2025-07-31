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

import React, { useState } from 'react';

import cls from 'classnames';
import {
  IconCozArrowDownFill,
  IconCozInfoCircle,
} from '@coze-arch/coze-design/icons';
import { Collapsible, Tooltip, Typography } from '@coze-arch/coze-design';

import css from './index.module.less';

export interface FormSectionProps {
  title?: React.ReactNode;
  tooltip?: React.ReactNode;
  action?: React.ReactNode;
  collapsible?: boolean;
}

export const FormSection: React.FC<
  React.PropsWithChildren<FormSectionProps>
> = ({ title, tooltip, action, collapsible, children }) => {
  const [isOpen, setIsOpen] = useState(true);

  const handleExpand = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={css['form-section']}>
      <div className={css['section-header']}>
        <div
          className={css['section-title']}
          onClick={collapsible ? handleExpand : undefined}
        >
          {collapsible ? (
            <IconCozArrowDownFill
              className={cls(css['title-collapsible'], {
                [css['is-close']]: !isOpen,
              })}
            />
          ) : null}

          <Typography.Text strong>{title}</Typography.Text>

          {tooltip ? (
            <Tooltip content={tooltip}>
              <IconCozInfoCircle className={css['title-tooltip']} />
            </Tooltip>
          ) : null}
        </div>
        {action ? (
          <div
            className={css['section-action']}
            onClick={e => {
              e.stopPropagation();
            }}
          >
            {action}
          </div>
        ) : null}
      </div>
      <Collapsible keepDOM fade isOpen={isOpen}>
        <div className={css['section-context']}>{children}</div>
      </Collapsible>
    </div>
  );
};
