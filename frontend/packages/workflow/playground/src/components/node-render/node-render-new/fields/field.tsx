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

import { FieldEmpty } from './field-empty';

import styles from './field.module.less';

interface FieldProps {
  label: string | React.ReactNode;
  isEmpty?: boolean;
  labelClassName?: string;
  contentClassName?: string;
  customEmptyLabel?: string;
}

export function Field({
  label,
  isEmpty = false,
  children,
  labelClassName,
  contentClassName,
  customEmptyLabel,
}: PropsWithChildren<FieldProps>) {
  return (
    <>
      <div className={classNames(styles.label, labelClassName)}>{label}</div>
      <div className={`${styles.content} ${contentClassName}`}>
        {isEmpty ? (
          <FieldEmpty fieldName={customEmptyLabel ?? label} />
        ) : (
          children
        )}
      </div>
    </>
  );
}
