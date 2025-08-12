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

import React, { type PropsWithChildren } from 'react';

import styles from './item.module.less';

interface ItemProps {
  label: string;
  defaultText?: string;
  hideLabel?: boolean;
}

export const Item: React.FC<PropsWithChildren<ItemProps>> = ({
  children,
  label,
  defaultText,
  hideLabel = false,
}) => {
  const haveChildren = !!children;
  const showDefaultText = !haveChildren && !!defaultText;
  const showLabel = !hideLabel && !showDefaultText;

  return (
    <div className={styles.container}>
      {showLabel ? <div className={styles.label}>{label}</div> : null}
      {showDefaultText ? (
        <div className={styles['default-text']}>{defaultText}</div>
      ) : null}
      {children}
    </div>
  );
};
