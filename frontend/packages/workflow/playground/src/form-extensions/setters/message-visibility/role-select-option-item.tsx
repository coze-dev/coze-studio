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

import { useRef, type FC, useState, useEffect } from 'react';

import classnames from 'classnames';
import { IconChevronRight, IconTick } from '@douyinfe/semi-icons';
import { concatTestId } from '@coze-workflow/base';
import { Popover, Space, Dropdown } from '@coze-arch/coze-design';

import { type RenderSelectOptionParams } from './types';
import { RoleSelectPanel } from './role-select-panel';
import { useMessageVisibilityContext } from './context';

export const RoleSelectOptionItem: FC<RenderSelectOptionParams> = props => {
  const { label, value: optionValue, focused, selected } = props;
  const ref = useRef<HTMLDivElement>(null);

  const { handleValueChange, testId } = useMessageVisibilityContext();
  const [popupVisible, setPopupVisible] = useState(focused || selected);

  useEffect(() => {
    if (focused || selected) {
      setPopupVisible(true);
    } else {
      setPopupVisible(false);
    }
  }, [focused, selected]);

  const handleSelect = selectedRoles => {
    handleValueChange?.({
      visibility: optionValue,
      user_settings: selectedRoles,
    });
  };

  return (
    <div
      ref={ref}
      className="relative"
      onMouseOver={() => setPopupVisible(true)}
    >
      <Popover
        visible={popupVisible}
        onVisibleChange={visible => {
          setPopupVisible(visible);
        }}
        trigger="custom"
        getPopupContainer={() => ref.current || document.body}
        content={<RoleSelectPanel onSelect={handleSelect} />}
        position="rightTop"
      >
        <Dropdown.Item
          className="w-full flex justify-between"
          data-testid={concatTestId(testId, optionValue)}
        >
          <Space>
            <IconTick
              className={classnames({
                ['text-[var(--semi-color-text-2)]']: selected,
                ['text-transparent	']: !selected,
              })}
            />
            <div>{label}</div>
          </Space>

          <IconChevronRight />
        </Dropdown.Item>
      </Popover>
    </div>
  );
};
