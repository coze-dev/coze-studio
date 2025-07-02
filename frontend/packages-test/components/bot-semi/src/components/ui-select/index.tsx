/* eslint-disable @typescript-eslint/naming-convention */

import React, {
  ForwardRefExoticComponent,
  RefAttributes,
  forwardRef,
} from 'react';

import { isString } from 'lodash-es';
import classNames from 'classnames';
import { IconListCheck } from '@coze-arch/bot-icons';
import {
  SelectProps,
  optionRenderProps,
} from '@douyinfe/semi-ui/lib/es/select';
import { Select, Typography } from '@douyinfe/semi-ui';
import { IconSmallTriangleDown } from '@douyinfe/semi-icons';

import s from './index.module.less';

export interface FilterProps {
  label?: string;
  theme?: 'borderless' | 'light';
  selectedClassname?: string;
}

export interface SemiSelectActions {
  close: () => void;
  open: () => void;
  focus: () => void;
  clearInput: () => void;
  deselectAll: () => void;
  selectAll: () => void;
  search: (value: string, event: React.ChangeEvent<HTMLInputElement>) => void;
}

const UISelectOption: React.FC<optionRenderProps> = ({
  disabled,
  label,
  onClick,
  selected,
  value,
  key,
  optionClassName,
}) => (
  <div
    key={key || value}
    className={classNames(
      s['ui-select-option'],
      disabled && s['ui-select-option-disabled'],
      selected && s['ui-select-option-selected'],
      optionClassName,
    )}
    onClick={e => {
      if (disabled) {
        return;
      }
      onClick?.(e);
    }}
    data-testid="ui.select.option"
  >
    <div className={s['ui-select-option-icon']}>
      <IconListCheck className={s.icon} />
    </div>
    {!isString(label) ? (
      label
    ) : (
      <div className={s['ui-select-option-text']}>{label}</div>
    )}
  </div>
);

const BaseSelect = forwardRef<SemiSelectActions, FilterProps & SelectProps>(
  (
    { theme, className, label, size = 'default', clickToHide = true, ...props },
    ref,
  ) => {
    const { selectedClassname } = props;

    if (theme === 'borderless') {
      return (
        <Select
          {...props}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ref={ref as any}
          clickToHide={clickToHide}
          className={classNames(
            className,
            s['borderless-ui-select'],
            s['ui-select'],
            s[`ui-select-${size}`],
          )}
          triggerRender={item => (
            <div
              className={s['filter-content']}
              data-testid="ui.select.trigger"
            >
              {label && <div className={s['filter-label']}>{`${label}:`}</div>}

              <div
                className={classNames(
                  s['borderless-filter-render'],
                  s[`size-${size}`],
                )}
              >
                <Typography.Text
                  ellipsis
                  className={classNames(
                    s['borderless-filter-text'],
                    selectedClassname,
                  )}
                >
                  {item?.value?.map(itemT => itemT.label)}
                </Typography.Text>
                <IconSmallTriangleDown className={s['filter-icon']} />
              </div>
            </div>
          )}
        />
      );
    }
    return (
      <Select
        {...props}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ref={ref as any}
        clickToHide={clickToHide}
        className={classNames(
          className,
          s['ui-select'],
          s['light-ui-select'],
          s[`ui-select-${size}`],
        )}
      />
    );
  },
);

export const UISelect: ForwardRefExoticComponent<
  Omit<FilterProps & Omit<SelectProps, 'clickToHide'>, 'ref'> &
    RefAttributes<SemiSelectActions>
> & {
  // follow Semi 组件命名

  OptGroup: typeof Select.OptGroup;

  Option: typeof Select.Option;
} = forwardRef<
  SemiSelectActions,
  FilterProps & Omit<SelectProps, 'clickToHide'>
>(
  (
    { theme = 'borderless', dropdownClassName, maxHeight = 216, ...props },
    ref,
  ) => (
    <BaseSelect
      clickToHide
      ref={ref}
      renderOptionItem={localeProps => <UISelectOption {...localeProps} />}
      theme={theme}
      dropdownClassName={classNames(dropdownClassName, s['ui-select-dropdown'])}
      maxHeight={maxHeight}
      {...props}
    />
  ),
) as ForwardRefExoticComponent<
  Omit<FilterProps & Omit<SelectProps, 'clickToHide'>, 'ref'> &
    RefAttributes<SemiSelectActions>
> & {
  OptGroup: typeof Select.OptGroup;
  Option: typeof Select.Option;
};

UISelect.OptGroup = Select.OptGroup;
UISelect.Option = Select.Option;
