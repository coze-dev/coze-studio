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

/* eslint-disable @coze-arch/no-deep-relative-import */
import React from 'react';

import { useNodeTestId } from '@coze-workflow/base';
import { Checkbox as UICheckbox } from '@coze-arch/coze-design';

import { type TreeNodeCustomData } from '../../type';
import { useOutputTreeContext } from '../../../../context';

import styles from './index.module.less';

interface ParamRequiredProps {
  data: TreeNodeCustomData;
  disabled?: boolean;
  onChange: (required: boolean) => void;
}

export default function ParamRequired({
  data,
  disabled,
  onChange,
}: ParamRequiredProps) {
  const { concatTestId } = useNodeTestId();
  const { testId } = useOutputTreeContext();
  return (
    <div className={styles.container}>
      <div className={styles.switch}>
        <UICheckbox
          data-testid={concatTestId(testId ?? '', data.field, 'required')}
          disabled={disabled}
          checked={data.required}
          onChange={e => onChange(e.target.checked || false)}
        ></UICheckbox>
      </div>
    </div>
  );
}
