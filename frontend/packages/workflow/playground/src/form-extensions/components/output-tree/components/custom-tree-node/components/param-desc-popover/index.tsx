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

import { type FC } from 'react';

import { IconCozPencilPaper } from '@coze-arch/coze-design/icons';
import { Popover, IconButton, TextArea } from '@coze-arch/coze-design';

import { type ParamNameProps } from '../param-description';

export const ParamDescPopover: FC<ParamNameProps> = props => {
  const { data, disabled, onChange } = props;

  const handleChange = (desc: string) => {
    onChange?.(desc);
  };

  if (disabled) {
    return (
      <div className="ml-1 px-0.5">
        <IconButton
          className="!block"
          disabled={disabled}
          color={data.description ? 'highlight' : 'secondary'}
          size="mini"
          icon={<IconCozPencilPaper />}
        />
      </div>
    );
  }

  return (
    <Popover
      trigger="click"
      autoAdjustOverflow
      content={
        <div className="p-4">
          <TextArea
            className="w-72"
            defaultValue={data.description}
            maxCount={1000}
            onChange={handleChange}
          />
        </div>
      }
    >
      <div className="ml-1 px-0.5 flex h-6 self-start items-center">
        <IconButton
          className="!block"
          disabled={disabled}
          color={data.description ? 'highlight' : 'secondary'}
          size="mini"
          icon={<IconCozPencilPaper />}
        />
      </div>
    </Popover>
  );
};
