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

import { I18n } from '@coze-arch/i18n';

import { ExpressionEditor } from '@/nodes-v2/components/expression-editor';
import { AutoGenerate } from '@/form-extensions/setters/sql/sql/auto-generate';
import { useField, withField } from '@/form';

import styles from './index.module.less';

const Sql = () => {
  const { value, onChange, readonly, errors } = useField<string>();

  const [key, setKey] = useState<number>(0);

  function handleSubmit(newValue) {
    onChange(newValue);
    setKey(key + 1);
  }

  return (
    <div className={styles.container}>
      {/* will support soon */}
      {!readonly && !IS_OPEN_SOURCE ? (
        <AutoGenerate
          className={styles['auto-generate']}
          onSubmit={handleSubmit}
        />
      ) : null}

      <ExpressionEditor
        key={key.toString()}
        value={value}
        onChange={e => onChange(e)}
        readonly={readonly}
        isError={Boolean(errors?.length)}
        placeholder={I18n.t('workflow_240218_12')}
        name={'/sql'}
      />
    </div>
  );
};

export const SqlField = withField(Sql);
