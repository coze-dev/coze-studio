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

import React, { useMemo } from 'react';

import classNames from 'classnames';
import { useNodeTestId } from '@coze-workflow/base';
import { Tooltip, RadioGroup, Radio as RadioUI } from '@coze-arch/coze-design';
import type {
  OptionItem,
  RadioChangeEvent,
  RadioType,
} from '@coze-arch/bot-semi/Radio';
import { IconInfo } from '@coze-arch/bot-icons';
import type {
  SetterComponentProps,
  SetterOrDecoratorContext,
} from '@flowgram-adapter/free-layout-editor';

import styles from './index.module.less';

type RadioItem = OptionItem & {
  disabled?: boolean | ((context: SetterOrDecoratorContext) => boolean);
  tooltip?: React.ReactNode;
};

export type RadioProps = SetterComponentProps<
  string | number | undefined,
  {
    mode: RadioType;
    options: RadioItem[];
    direction?: 'vertical' | 'horizontal';
    customClassName?: string;
    radioCardClassName?: string;
    // Ignore readonly state, force interactivity
    ignoreReadonly?: boolean;
    disabled?: boolean;
  }
>;

export const Radio = props => {
  const { value, onChange, options, readonly: _readonly, context } = props;

  const {
    options: selectOptions = [],
    mode = 'button',
    ignoreReadonly,
    disabled,
  } = options;

  const readonly = ignoreReadonly ? false : _readonly;

  const { getNodeSetterId, concatTestId } = useNodeTestId();

  const uiOptions = useMemo(
    () =>
      selectOptions.map(item => {
        const isItemDisabled = (optionItem: RadioItem) => {
          const disabledItem:
            | boolean
            | ((context: SetterOrDecoratorContext) => boolean) =
            optionItem.disabled ?? false;
          if (typeof disabledItem === 'boolean') {
            return disabledItem;
          } else if (typeof disabledItem === 'function') {
            return disabledItem(context);
          }
          return false;
        };
        return (
          <RadioUI
            className={classNames({
              'border-[#1C1F23]/[8%]': mode === 'card' && item.value !== value,
              'bg-[--semi-color-bg-0]': mode === 'card' && item.value !== value,
              [options?.radioCardClassName as string]:
                options?.radioCardClassName,
            })}
            key={item.value}
            value={item.value}
            disabled={isItemDisabled(item)}
            data-testid={concatTestId(
              getNodeSetterId(context.meta.name),
              `${item.value}`,
            )}
          >
            {item.label}
            {item?.tooltip ? (
              <Tooltip content={item?.tooltip}>
                <IconInfo className="text-[#06070980] ml-[5px]" />
              </Tooltip>
            ) : null}
          </RadioUI>
        );
      }),
    [selectOptions],
  );

  return (
    <RadioGroup
      disabled={readonly || disabled}
      className={classNames({
        [styles.workflowNodeSetterRadio]: true,
        [options?.customClassName as string]: options?.customClassName,
      })}
      type={mode}
      value={value}
      onChange={onChange as unknown as (event: RadioChangeEvent) => void}
      direction={options?.direction ?? 'horizontal'}
    >
      {uiOptions}
    </RadioGroup>
  );
};
