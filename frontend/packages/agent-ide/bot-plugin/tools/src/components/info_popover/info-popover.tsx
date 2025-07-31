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

import { Fragment } from 'react';

import { IconCozInfoCircle } from '@coze-arch/coze-design/icons';
import { Tooltip, Typography } from '@coze-arch/coze-design';
import { type ExtInfoText } from '@coze-studio/plugin-shared';

interface InfoPopoverProps {
  data: ExtInfoText[];
}

export const InfoPopover: React.FC<InfoPopoverProps> = props => {
  const { data } = props;

  return (
    <Tooltip
      showArrow
      theme="dark"
      position="right"
      arrowPointAtCenter
      className="!max-w-[320px]"
      content={data?.map((item, index) => (
        <Fragment key={`${item.type}${index}`}>
          {/* bold title */}
          {item.type === 'title' ? (
            <Typography.Text fontSize="14px" className="dark coz-fg-primary">
              {item.text}
            </Typography.Text>
          ) : null}
          {/* Text */}
          {item.type === 'text' ? (
            <Typography.Paragraph
              fontSize="12px"
              className="dark coz-fg-secondary"
            >
              {item.text}
            </Typography.Paragraph>
          ) : null}
          {/* line feed */}
          {item.type === 'br' ? <div className="h-[8px]" /> : null}
          {/* Example, display inside the border */}
          {item.type === 'demo' ? (
            <div className="dark mt-[4px] p-[10px] border border-solid coz-stroke-primary">
              <Typography.Paragraph
                fontSize="12px"
                className="dark coz-fg-secondary"
              >
                {item.text}
              </Typography.Paragraph>
            </div>
          ) : null}
        </Fragment>
      ))}
    >
      <IconCozInfoCircle className="coz-fg-secondary" />
    </Tooltip>
  );
};
