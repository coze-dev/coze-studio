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

import { I18n } from '@coze-arch/i18n';
import {
  IconCozFixedSize,
  IconCozAutoWidth,
} from '@coze-arch/coze-design/icons';
import { Tooltip } from '@coze-arch/coze-design';

import { MyIconButton } from '../icon-button';
import { Mode } from '../../typings';

interface IProps {
  value: Mode;
  onChange: (value: Mode) => void;
}
export const TextType: FC<IProps> = props => {
  const { value, onChange } = props;
  return (
    <div className="flex gap-[12px]">
      <Tooltip
        mouseEnterDelay={300}
        mouseLeaveDelay={300}
        content={I18n.t('imageflow_canvas_text1')}
      >
        <MyIconButton
          inForm
          color={value === Mode.INLINE_TEXT ? 'highlight' : 'secondary'}
          onClick={() => {
            onChange(Mode.INLINE_TEXT);
          }}
          icon={<IconCozAutoWidth className="text-[16px]" />}
        />
      </Tooltip>

      <Tooltip
        mouseEnterDelay={300}
        mouseLeaveDelay={300}
        content={I18n.t('imageflow_canvas_text2')}
      >
        <MyIconButton
          inForm
          color={value === Mode.BLOCK_TEXT ? 'highlight' : 'secondary'}
          onClick={() => {
            onChange(Mode.BLOCK_TEXT);
          }}
          icon={<IconCozFixedSize className="text-[16px]" />}
        />
      </Tooltip>
    </div>
  );
};
