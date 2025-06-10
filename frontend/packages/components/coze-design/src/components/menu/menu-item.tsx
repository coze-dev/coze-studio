import React, {
  type FC,
  useMemo,
  useContext,
  isValidElement,
  forwardRef,
} from 'react';

import { DropdownItem as SemiDropdownItem } from '@douyinfe/semi-ui';

import { cn, mergeProps } from '@/utils';

import { menuVariant } from './menu-variant';
import { type MenuItemProps } from './menu-types';
import { MenuContext } from './context/menu-context';

import './index.css';

const defaultProps: Partial<MenuItemProps> = {
  onClick: () => {},
  disabled: false,
};

export const filterSelectedValue = (
  prevData: string[],
  value: string,
  isMultiple: boolean,
) => {
  if (!isMultiple) {
    return [value];
  }
  const selectedArr = [...prevData];
  const index = selectedArr.indexOf(value);
  if (index > -1) {
    selectedArr.splice(index, 1); // 如果存在，移除元素
  } else {
    selectedArr.push(value); // 如果不存在，添加元素
  }
  return selectedArr;
};

export const MenuItem: FC<MenuItemProps> = forwardRef<
  SemiDropdownItem,
  MenuItemProps
>((props, ref) => {
  const {
    suffix,
    type,
    children,
    className,
    icon,
    itemKey,
    onClick,
    disabled,
    ...restProps
  } = mergeProps(props, defaultProps);

  const { mode, selectedKeys, multiple, onSelectionChange } =
    useContext(MenuContext);

  const isSelected = useMemo(
    // @ts-expect-error -- linter-disable-autofix
    () => [...selectedKeys].includes(itemKey),
    [selectedKeys, itemKey],
  );
  const cls = cn(
    menuVariant.item({}),
    {
      'pl-32px': isValidElement(icon) && mode === 'selection',
      'pl-6px': isValidElement(icon) && mode === 'menu',
    },
    className,
  );
  const textCls = cn({
    'coz-item-text': true,
    'coz-item-danger': type === 'danger',
    'coz-item-warning': type === 'warning',
    'coz-item-primary': type === 'primary',
    'coz-item-secondary': type === 'secondary',
    'coz-item-selected': isSelected,
    'coz-item-text-disabled': disabled,
    'coz-item-text-selection': mode === 'selection',
  });
  // @ts-expect-error -- linter-disable-autofix
  const selectData = filterSelectedValue(selectedKeys, itemKey, multiple);
  return (
    <SemiDropdownItem
      ref={ref}
      className={cls}
      icon={mode === 'selection' ? isSelected && icon : icon}
      onClick={event => {
        event.preventDefault();
        // disabled状态下点击不做响应
        if (disabled) {
          return;
        }
        // @ts-expect-error -- linter-disable-autofix
        onSelectionChange?.(itemKey, selectData);
        // @ts-expect-error -- linter-disable-autofix
        onClick?.(itemKey, event);
      }}
      disabled={disabled}
      {...restProps}
    >
      <div className={textCls}>{children}</div>
      {suffix ? <div>{suffix}</div> : null}
    </SemiDropdownItem>
  );
});
