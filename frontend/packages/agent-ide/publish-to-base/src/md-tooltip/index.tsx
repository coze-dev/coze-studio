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

import ReactMarkdown from 'react-markdown';
import { type FC, type ReactNode } from 'react';

import { IconCozInfoCircle } from '@coze-arch/coze-design/icons';
import { Tooltip } from '@coze-arch/coze-design';

import {
  MARKDOWN_TOOLTIP_CONTENT_MAX_WIDTH,
  MARKDOWN_TOOLTIP_WIDTH,
} from '../constants';

import styles from './index.module.less';

export const MdTooltip: FC<{
  content?: string;
  children?: ReactNode;
  tooltipPosition?: Parameters<typeof Tooltip>[0]['position'];
}> = ({ content, children, tooltipPosition }) => {
  if (!content) {
    return null;
  }

  return (
    <Tooltip
      content={
        <ReactMarkdown className={styles.md_wrap}>{content}</ReactMarkdown>
      }
      position={tooltipPosition}
      style={{
        maxWidth: MARKDOWN_TOOLTIP_WIDTH,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment -- css var
        // @ts-expect-error
        '--tooltip-content-max-width': `${MARKDOWN_TOOLTIP_CONTENT_MAX_WIDTH}px`,
      }}
    >
      {children || (
        <span className="cursor-pointer ml-[2px] h-[16px] w-[16px] inline-flex items-center">
          <IconCozInfoCircle className="text-[12px] coz-fg-secondary" />
        </span>
      )}
    </Tooltip>
  );
};
