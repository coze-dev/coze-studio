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

import React from 'react';

import classNames from 'classnames';
import { Tag } from '@coze-arch/coze-design';

import styles from './index.module.less';

export interface OutputInfoType {
  label: string;
  type: string;
  required?: boolean;
  style?: React.CSSProperties;
}

export const OutputsParamDisplay = ({
  options,
}: {
  options: {
    outputInfo: OutputInfoType[];
    customClassNames?: string;
  };
}) => {
  const { outputInfo, customClassNames } = options ?? {};

  return (
    <div className={classNames('flex flex-col gap-[8px]', customClassNames)}>
      {outputInfo?.map?.(({ label, type, required, style }) => (
        <div className="flex items-center" style={style}>
          <div className={styles.label}>{label}</div>
          {required ? <span className={styles.required}>*</span> : null}
          {type ? (
            <Tag
              className={classNames(styles.tag, '!px-[3px] !py-[1px]')}
              color="primary"
            >
              {type}
            </Tag>
          ) : null}
        </div>
      ))}
    </div>
  );
};
