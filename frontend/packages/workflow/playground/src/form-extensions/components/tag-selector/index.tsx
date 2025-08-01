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

import React, { useRef, useState } from 'react';

import { escape } from 'lodash-es';
import cls from 'classnames';
import { I18n } from '@coze-arch/i18n';
import {
  IconCozTrashCan,
  IconCozCheckMarkFill,
} from '@coze-arch/coze-design/icons';
import {
  Select,
  Checkbox,
  Tooltip,
  type SelectProps,
} from '@coze-arch/coze-design';
import { type RenderSelectedItemFn } from '@coze-arch/bot-semi/Select';
import { type Select as SemiSelect } from '@coze-arch/bot-semi';

import { useSlotNode } from './use-slot-node';

import styles from './style.module.less';

type Props = {
  /** list of options */
  options: SelectProps['optionList'];

  /** Whether to select multiple, the default is false */
  multiple?: boolean;

  /** Whether to allow custom addition, the default is false */
  enableCustom?: boolean;

  /** Is it read-only? */
  readonly?: boolean;

  /** Custom placeholder */
  inputPlaceholder?: string;

  /** When allowing custom addition (enableCustom is true), add option events */
  onAdd?: (value: string) => Promise<boolean>;

  /** When allowing custom addition (enableCustom is true), remove the option event */
  onDelete?: (value: string) => Promise<boolean>;
} & SelectProps;

interface OptionNode {
  label: string;
  value: string;
  isDefault: boolean;
}

const TagContent = (props: OptionNode) => {
  // \ N,\ t will be displayed as spaces by default, here concretized as\ n and\ t
  const mapChars = {
    '\n': '\\n',
    '\t': '\\t',
  };
  return (
    <>
      <span>{props.label}</span>
      {props.isDefault ? (
        <span className={styles['delimiter-description']}>
          ({escape(mapChars[props.value] || props.value)})
        </span>
      ) : null}
    </>
  );
};

const TagSelector: React.FC<Props> = props => {
  const {
    options,
    multiple,
    readonly,
    value,
    inputPlaceholder,
    onChange,
    enableCustom,
    onAdd,
    onDelete,
    ...restProps
  } = props;

  const selectRef = useRef<SemiSelect>(null);

  /** Processing deletion. Considering the scenarios that may be deleted asynchronously in the future, this is still called asynchronously. */
  const handleDelete = async (input: string) => {
    await onDelete?.(input);
  };

  const [dropdownVisible, setDropdownVisible] = useState(false);

  const { node: outSlotNode } = useSlotNode({
    onAdd: async (inputValue: string) => {
      const isSuccess = await onAdd?.(inputValue);

      if (!multiple && isSuccess) {
        selectRef.current?.close();
      }

      return Boolean(isSuccess);
    },
    dropdownVisible,
    placeholder: inputPlaceholder,
  });

  const renderOptionItem = renderProps => {
    const {
      disabled,
      selected,
      label,
      value: _value,
      focused,
      style,
      onMouseEnter,
      onClick,
      ...rest
    } = renderProps;

    const { isDefault } = rest;

    // Notice：
    // 1. the style passed by props needs to be consumed on the wrapper dom, otherwise it will not work normally in the virtualization scene
    // 2. The styles of selected, focused, disabled, etc. need to be added by yourself. You can get the relative boolean value from props.
    // 3.onMouseEnter needs to be bound on the wrapper dom, otherwise there will be problems when operating on the upper and lower keyboards.
    const optionCls = cls({
      ['custom-option-render']: true,
      ['custom-option-render-focused']: focused,
      ['custom-option-render-disabled']: disabled || readonly,
      ['custom-option-render-selected']: selected,
    });

    const wrapClassName = [
      'option-right',
      'flex',
      'flex-1',
      isDefault ? '' : 'justify-between',
    ];

    return (
      <div
        style={style}
        className={optionCls}
        onClick={() => onClick()}
        onMouseEnter={e => onMouseEnter()}
      >
        <div className="w-[12px] flex items-center">
          {multiple ? (
            <Checkbox checked={selected} disabled={readonly} />
          ) : null}
          {!multiple && selected ? (
            <IconCozCheckMarkFill style={{ color: 'rgba(78, 64, 229, 1)' }} />
          ) : null}
        </div>
        <div className={cls(wrapClassName)}>
          <TagContent label={label} value={_value} isDefault={isDefault} />
          {!isDefault && (
            <Tooltip content={I18n.t('Delete')}>
              <IconCozTrashCan
                onClick={e => {
                  e.stopPropagation();
                  handleDelete(_value);
                }}
                className="text-xs"
              />
            </Tooltip>
          )}
        </div>
      </div>
    );
  };

  const renderSelectedItem = optionNode => {
    if (multiple) {
      // multiple choice
      return {
        isRenderInTag: true,
        content: <TagContent {...optionNode} />,
      };
    } else {
      // radio
      return <TagContent {...optionNode} />;
    }
  };

  return (
    <div className={styles['selector-wrapper']}>
      <Select
        {...restProps}
        ref={selectRef}
        multiple={multiple}
        value={value}
        size="small"
        dropdownMatchSelectWidth
        dropdownClassName={styles['selector-wrapper-dropdown']}
        showRestTagsPopover
        onChange={values => onChange?.(values)}
        outerBottomSlot={enableCustom ? outSlotNode : null}
        optionList={options}
        renderOptionItem={renderOptionItem}
        renderSelectedItem={renderSelectedItem as RenderSelectedItemFn}
        onDropdownVisibleChange={setDropdownVisible}
        style={{
          pointerEvents: readonly ? 'none' : 'auto',
          maxWidth: '460px',
          height: '24px',
        }}
      />
    </div>
  );
};

export default TagSelector;
