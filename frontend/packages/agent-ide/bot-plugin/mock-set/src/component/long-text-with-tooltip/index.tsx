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

import classNames from 'classnames';
import { type Ellipsis, type TextProps } from '@coze-arch/bot-semi/Typography';
import { Typography } from '@coze-arch/bot-semi';

import s from './index.module.less';

interface LongTextWithTooltip extends TextProps {
  tooltipText?: string;
}

export function LongTextWithTooltip(props: LongTextWithTooltip) {
  const { children, ellipsis, tooltipText, ...rest } = props;

  const ellipsisConfig: boolean | Ellipsis | undefined =
    ellipsis === false
      ? ellipsis
      : {
          showTooltip: {
            opts: {
              content: (
                <Typography.Text
                  className={classNames(s['long-text-tooltip'], s['long-text'])}
                  onClick={e => e.stopPropagation()}
                  ellipsis={{ showTooltip: false, rows: 16 }}
                >
                  {tooltipText || props.children}
                </Typography.Text>
              ),
            },
          },
          ...(typeof ellipsis !== 'object' ? {} : ellipsis),
        };

  return (
    <Typography.Text ellipsis={ellipsisConfig} {...rest}>
      {props.children}
    </Typography.Text>
  );
}
