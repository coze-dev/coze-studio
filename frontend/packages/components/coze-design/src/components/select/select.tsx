/* eslint-disable @coze-arch/max-line-per-function */
import { forwardRef, useMemo, useState } from 'react';

import { type SelectProps as SemiSelectProps } from '@douyinfe/semi-ui/lib/es/select';
import { Highlight, Select as SemiSelect } from '@douyinfe/semi-ui';

import { cn } from '@/utils';
import {
  IconCozArrowDown,
  IconCozCheckMarkFill,
  IconCozCross,
} from '@/components/icon';

import { selectVariants, type SelectVariantProps } from './select-variant';
import { type SelectProps } from './select-types';

import './select.css';
import { Chip } from '@/components/chip';

const defaultProps: Partial<SelectVariantProps> = {
  size: 'default',
  hasError: false,
  disabled: false,
};

// @ts-expect-error -- linter-disable-autofix
const iconSize: Record<SelectProps['size'], string> = {
  default: 'text-lg',
  small: 'text-base',
};

const SelectComponent = forwardRef<SemiSelect, SelectProps>(
  (
    {
      hasError = defaultProps.hasError,
      disabled = defaultProps.disabled,
      size = defaultProps.size,
      dataTheme,
      className,
      style,
      onSearch,
      restTagsPopoverProps = {},
      renderOptionItem,
      dropdownClassName,
      multiple,
      showTick = true,
      chipRender,
      renderSelectedItem,
      triggerRender,
      ...rest
    },
    ref,
  ): JSX.Element => {
    const classes = cn(
      selectVariants({ hasError, disabled, size }),
      className,
      chipRender === 'selectedItem' && 'coz-select-chip-mode',
    );

    const elementProps = {
      className: `${classes} ${hasError ? '!coz-stroke-hglt-red' : ''}`,
      'data-theme': dataTheme,
      style,
      ref,
    };

    const [inputValue, setInputValue] = useState('');
    const _renderOptionItem = useMemo(() => {
      if (renderOptionItem) {
        return renderOptionItem;
      }
      return renderProps => {
        const {
          disabled: _disabled,
          selected,
          label,
          className: _className = '',
          style: _style,
          onMouseEnter,
          onClick,
          ..._rest
        } = renderProps;
        const searchWords = [inputValue];

        // Notice：
        // 1.props传入的style需在wrapper dom上进行消费，否则在虚拟化场景下会无法正常使用
        // 2.选中(selected)、聚焦(focused)、禁用(disabled)等状态的样式需自行加上，你可以从props中获取到相对的boolean值
        // 3.onMouseEnter需在wrapper dom上绑定，否则上下键盘操作时显示会有问题
        let defaultPrefixIcon = <></>;
        if (multiple && selected) {
          defaultPrefixIcon = (
            <IconCozCheckMarkFill
              className={
                'coz-select-option-item-icon-multiple-selected text-xxl'
              }
            />
          );
        } else if (multiple && !selected) {
          defaultPrefixIcon = (
            <div
              className={'coz-select-option-item-icon-multiple-unselected'}
            />
          );
        } else if (!multiple && selected) {
          defaultPrefixIcon = (
            <IconCozCheckMarkFill
              className={'coz-select-option-item-icon-selected text-xxl'}
            />
          );
        }

        let _wrapperClassName = `coz-select-option-item ${_className}`;
        if (_disabled) {
          _wrapperClassName = `${_wrapperClassName} disabled`;
        }
        if (selected) {
          _wrapperClassName = `${_wrapperClassName} selected`;
        }
        return (
          <div
            style={_style}
            className={_wrapperClassName}
            onClick={onClick}
            onMouseEnter={onMouseEnter}
            {..._rest}
          >
            {showTick ? (
              <div className="option-prefix-icon">{defaultPrefixIcon}</div>
            ) : (
              <></>
            )}
            <div className="option-text-wrapper">
              {typeof label === 'string' ? (
                <div className="option-text">
                  <Highlight sourceString={label} searchWords={searchWords} />
                </div>
              ) : (
                label
              )}
            </div>
          </div>
        );
      };
    }, [renderOptionItem, inputValue, multiple]);

    const _renderSelectedItem = (node, props) => {
      const { disabled: innerDisabled, onClose } = props || {};

      const label = node.chipLabel || node.label;
      const content = (
        <Chip
          color={node.chipColor}
          className="mr-4px"
          disabled={innerDisabled}
          chipStyle="remove"
          onClickRemove={e => {
            onClose?.(content, e);
            e.stopPropagation();
            e.preventDefault();
          }}
        >
          {label}
        </Chip>
      );

      if (multiple) {
        return {
          isRenderInTag: false,
          content,
        };
      }
      return <Chip color={node.chipColor}>{label}</Chip>;
    };

    const _triggerRender = props => {
      const { value } = props;
      return (
        <div className="flex gap-4px">
          {value.map(it => (
            <Chip key={it.value} color={it.chipColor} chipStyle="select">
              {it.label}
            </Chip>
          ))}
        </div>
      );
    };

    return (
      <SemiSelect
        {...(elementProps as SemiSelectProps)}
        {...(rest as SemiSelectProps)}
        // @ts-expect-error -- linter-disable-autofix
        disabled={disabled}
        multiple={multiple}
        // @ts-expect-error -- linter-disable-autofix
        arrowIcon={<IconCozArrowDown className={iconSize[size]} />}
        clearIcon={
          <IconCozCross
            className={cn(
              'coze-select-clear-icon',
              iconSize[size || 'default'],
            )}
          />
        }
        restTagsPopoverProps={{
          ...restTagsPopoverProps,
          className: `${
            restTagsPopoverProps.className || ''
          } coz-select-tag-popover`,
        }}
        // @ts-expect-error -- linter-disable-autofix
        size={size}
        renderOptionItem={_renderOptionItem}
        triggerRender={
          chipRender === 'trigger' ? _triggerRender : triggerRender
        }
        //@ts-expect-error -- ignore
        renderSelectedItem={
          chipRender === 'selectedItem'
            ? _renderSelectedItem
            : renderSelectedItem
        }
        dropdownClassName={`${dropdownClassName || ''} coz-select-dropdown  ${
          showTick ? 'showTick' : ''
        }`}
        onSearch={(v, e) => {
          setInputValue(v);
          if (onSearch) {
            onSearch(v, e);
          }
        }}
      />
    );
  },
);

SelectComponent.displayName = 'Select';

const { Option, OptGroup } = SemiSelect;
export const Select = Object.assign(SelectComponent, { Option, OptGroup });
