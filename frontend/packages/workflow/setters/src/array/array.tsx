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

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';

import { IconCozPlus, IconCozMinus } from '@coze-arch/coze-design/icons';
import { IconButton } from '@coze-arch/coze-design';

import type { Setter } from '../types';
import type { Field } from './types';
import { ColumnTitles } from './column-titles';
import { ArraySetterItemContextProvider } from './array-context';

import styles from './array.module.less';

export interface ArrayOptions {
  disableAdd?: boolean;
  getDefaultAppendValue?: () => any;
  fields?: Field[];

  /** The maximum number of imported parameters, if not provided, defaults to the maximum integer value */
  maxItems?: number;

  /** The minimum number of imported parameters, if not provided, the default is 0 */
  minItems?: number;

  /** Can a single item be deleted? */
  disableDeleteItem?: ((value: unknown, index: number) => boolean) | boolean;
}

// eslint-disable-next-line complexity
export const Array: Setter<Array<any>, ArrayOptions> = ({
  value = [],
  readonly = false,
  children,
  onChange,
  context,
  disableAdd = false,
  getDefaultAppendValue,
  fields = [],
  maxItems = Number.MAX_SAFE_INTEGER,
  minItems = 0,
  disableDeleteItem = () => false,
}) => {
  const [currentAddIndex, setCurrentAddIndex] = useState<number | undefined>();
  const { node, meta } = context || {};

  // The value returned by the backend may be null, and it will not be assigned to [] at this time. Here is the bottom line again.
  const originValue = value || [];

  const add = () => {
    const defaultValue = getDefaultAppendValue?.() || {};
    setCurrentAddIndex(originValue.length);
    onChange?.([...originValue, defaultValue]);
  };

  const remove = (index: number) => {
    const newValue = [...originValue];
    newValue.splice(index, 1);
    onChange?.(newValue);
  };

  const showAddButton =
    !disableAdd && !readonly && originValue?.length < maxItems;

  const calcShowDeleteButton = (item: unknown, index: number) => {
    const globalEnableDelete = !readonly && originValue?.length > minItems;

    if (typeof disableDeleteItem === 'undefined') {
      return globalEnableDelete;
    }

    if (typeof disableDeleteItem === 'boolean') {
      return globalEnableDelete && !disableDeleteItem;
    }
    return globalEnableDelete && !disableDeleteItem(item, index);
  };

  const columns = [...fields, ...(readonly ? [] : [{ label: '', width: 24 }])];

  return (
    <div className={styles.array}>
      <div className={styles.content}>
        {fields.length > 0 && <ColumnTitles columns={columns} />}
        {React.Children.toArray(children).map((child, index) => {
          const showDeleteButton = calcShowDeleteButton(
            originValue[index],
            index,
          );
          return (
            <ArraySetterItemContextProvider
              value={{
                currentAddIndex,
                currentIndex: index,
              }}
            >
              <div className={styles['array-item']}>
                <div className={styles.child}>{child}</div>
                {showDeleteButton ? (
                  <IconButton
                    className="!block ml-1"
                    icon={<IconCozMinus className="text-sm" />}
                    size="small"
                    color="secondary"
                    onClick={() => remove(index)}
                  />
                ) : null}
              </div>
            </ArraySetterItemContextProvider>
          );
        })}
      </div>

      {showAddButton ? (
        <IconButton
          color="highlight"
          size="small"
          className="absolute -top-8 right-0"
          icon={<IconCozPlus />}
          onClick={() => add()}
          data-testid={`playground.node.${node?.id}.${meta?.name}.addbutton`}
        />
      ) : null}
    </div>
  );
};
