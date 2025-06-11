import { useRef, type FC, useState, useEffect } from 'react';

import classnames from 'classnames';
import { IconChevronRight, IconTick } from '@douyinfe/semi-icons';
import { concatTestId } from '@coze-workflow/base';
import { Popover, Space, Dropdown } from '@coze/coze-design';

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
