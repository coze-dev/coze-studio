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

import { useState } from 'react';

import { PositionMirror } from '@coze-editor/editor/react';
import { I18n } from '@coze-arch/i18n';
import { Popover, Input, type PopoverProps } from '@coze-arch/coze-design';

interface InputConfigPopoverProps {
  visible: boolean;
  onVisibleChange?: (visible: boolean) => void;
  positon: number;
  direction?: PopoverProps['position'];
  placeholder: string;
  value: string;
  onPlaceholderChange?: (placeholder: string) => void;
  onValueChange?: (value: string) => void;
}
export const InputConfigPopover = (props: InputConfigPopoverProps) => {
  const [reposKey, setReposKey] = useState('');
  const { direction, placeholder, value } = props;

  return (
    <>
      <Popover
        rePosKey={reposKey}
        visible={props.visible}
        trigger="custom"
        position={direction}
        autoAdjustOverflow
        content={
          <div className="flex flex-col gap-2 pt-3 pb-4 px-4 w-[320px]">
            <div>
              <div>{I18n.t('edit_block_guidance_text_when_empty')}</div>
              <Input
                value={placeholder}
                placeholder={I18n.t('edit_block_guidance_text_placeholder')}
                onChange={v => props.onPlaceholderChange?.(v)}
                onBlur={() => {
                  if (!placeholder) {
                    props.onPlaceholderChange?.(
                      I18n.t('edit_block_guidance_text_placeholder'),
                    );
                  }
                }}
              />
            </div>
            <div>
              <div>{I18n.t('edit_block_prefilled_text')}</div>
              <Input
                value={value}
                placeholder={I18n.t('edit_block_default_guidance_text')}
                onChange={v => props.onValueChange?.(v)}
              />
            </div>
          </div>
        }
      >
        <PositionMirror
          position={props.positon}
          onChange={() => setReposKey(String(Math.random()))}
        />
      </Popover>
    </>
  );
};
