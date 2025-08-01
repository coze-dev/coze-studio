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

import React, { useState } from 'react';
import type { CSSProperties } from 'react';

import cx from 'classnames';
import { I18n } from '@coze-arch/i18n';

import useErrorMessage from '@/parameters/hooks/use-error-message';
import useConfig from '@/parameters/hooks/use-config';

import WorkflowSLInput from '../workflow-sl-input';
import { type TreeNodeCustomData } from '../../type';

import styles from './index.module.less';

interface ParamNameProps {
  data: TreeNodeCustomData;
  disabled?: boolean;
  style?: CSSProperties;
  onChange: (name: string) => void;
}

export default function ParamName({
  disabled,
  data,
  style,
  onChange,
}: ParamNameProps) {
  const errorMessage = useErrorMessage('name');
  const [slient, setSlient] = useState(true);
  const showError = slient === false && errorMessage;
  const { withDescription } = useConfig();

  return (
    <div
      className={cx(styles.container, {
        [styles.withDescription]: withDescription,
      })}
      style={style}
    >
      <WorkflowSLInput
        className={styles.name}
        value={data.name || ''}
        disabled={disabled}
        handleBlur={() => setSlient(false)}
        handleChange={(name: string) => {
          setSlient(true);
          onChange(name);
        }}
        inputProps={{
          size: 'small',
          placeholder: I18n.t('workflow_detail_end_output_entername'),
          disabled,
        }}
        errorMsg={showError ? errorMessage : ''}
        validateStatus={showError ? 'error' : 'default'}
      />
    </div>
  );
}
