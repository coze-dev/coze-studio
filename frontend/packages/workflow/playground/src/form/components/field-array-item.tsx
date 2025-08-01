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

import { type PropsWithChildren } from 'react';

import classNames from 'classnames';

import { IconRemove } from './icon-remove';

import styles from './field-array-item.module.less';

interface FieldArrayItemProps {
  /** @deprecated */
  disableDelete?: boolean;
  disableRemove?: boolean;
  /** @deprecated */
  hiddenDelete?: boolean;
  hiddenRemove?: boolean;
  className?: string;
  containerClassName?: string;
  removeIconClassName?: string;
  /** @deprecated */
  onDelete?: () => void;
  onRemove?: () => void;
  removeTestId?: string;
}

export function FieldArrayItem({
  className = '',
  containerClassName,
  removeIconClassName,
  disableDelete = false,
  hiddenDelete = false,
  onDelete,
  disableRemove = false,
  hiddenRemove = false,
  onRemove,
  children,
  removeTestId,
}: PropsWithChildren<FieldArrayItemProps>) {
  return (
    <div
      className={classNames(containerClassName, 'flex items-start gap-[8px]')}
    >
      <div
        className={classNames(
          `flex gap-[4px] items-start flex-1 ${styles.content} min-w-0 min-w-0`,
          className,
        )}
      >
        {children}
      </div>
      {!hiddenRemove && !hiddenDelete && (
        <IconRemove
          className={removeIconClassName}
          disabled={disableRemove || disableDelete}
          onClick={onRemove || onDelete}
          testId={removeTestId}
        />
      )}
    </div>
  );
}
