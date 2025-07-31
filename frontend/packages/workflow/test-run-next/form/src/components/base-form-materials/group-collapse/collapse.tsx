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

import React, { useState, useRef } from 'react';

import { clsx } from 'clsx';
import { useInViewport } from 'ahooks';
import {
  IconCozArrowDownFill,
  IconCozInfoCircle,
} from '@coze-arch/coze-design/icons';
import { Collapsible, Tooltip } from '@coze-arch/coze-design';

import css from './collapse.module.less';

interface CollapseProps {
  label: React.ReactNode;
  tooltip?: React.ReactNode;
  extra?: React.ReactNode;
  fade?: boolean;
  duration?: number;
}

export const GroupCollapse: React.FC<
  React.PropsWithChildren<CollapseProps>
> = ({ label, tooltip, extra, children }) => {
  const [isOpen, setIsOpen] = useState(true);
  const ref = useRef(null);
  /**
   * Detect if the title is sticky
   */
  const [inViewport] = useInViewport(ref);
  return (
    <div>
      {/* probe element */}
      <div ref={ref} />
      {/* header */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          css['collapse-title'],
          (!inViewport || !isOpen) && css['is-sticky'],
        )}
      >
        <IconCozArrowDownFill
          className={clsx(css['collapse-icon'], !isOpen && css['is-close'])}
        />
        <span className={css['collapse-label']}>{label}</span>
        {tooltip ? (
          <Tooltip content={tooltip}>
            <IconCozInfoCircle className={css['collapse-label-tooltip']} />
          </Tooltip>
        ) : null}
        {extra ? (
          <div
            className={css['collapse-extra']}
            onClick={e => e.stopPropagation()}
          >
            {extra}
          </div>
        ) : null}
      </div>
      {/* children */}
      <Collapsible isOpen={isOpen} keepDOM fade duration={300}>
        <div className={css['collapse-content']}>{children}</div>
      </Collapsible>
    </div>
  );
};
