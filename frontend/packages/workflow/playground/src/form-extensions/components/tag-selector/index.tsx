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
  /** 选项列表 */
  options: SelectProps['optionList'];

  /** 是否多选，默认为 false */
  multiple?: boolean;

  /** 是否允许自定义添加，默认为 false */
  enableCustom?: boolean;

  /** 是否为只读态 */
  readonly?: boolean;

  /** 自定义 placeholder */
  inputPlaceholder?: string;

  /** 允许自定义添加时（enableCustom 为 true），添加选项事件 */
  onAdd?: (value: string) => Promise<boolean>;

  /** 允许自定义添加时（enableCustom 为 true），删除选项事件 */
  onDelete?: (value: string) => Promise<boolean>;
} & SelectProps;

interface OptionNode {
  label: string;
  value: string;
  isDefault: boolean;
}

const TagContent = (props: OptionNode) => {
  // \n，\t 默认会展示成空格，这里具象化为 \n 和 \t
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

  /** 处理删除，考虑到将来可能异步删除的场景，这里还是通过异步方式调用 */
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
    // 1.props传入的style需在wrapper dom上进行消费，否则在虚拟化场景下会无法正常使用
    // 2.选中(selected)、聚焦(focused)、禁用(disabled)等状态的样式需自行加上，你可以从props中获取到相对的boolean值
    // 3.onMouseEnter需在wrapper dom上绑定，否则上下键盘操作时显示会有问题
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
      // 多选
      return {
        isRenderInTag: true,
        content: <TagContent {...optionNode} />,
      };
    } else {
      // 单选
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
