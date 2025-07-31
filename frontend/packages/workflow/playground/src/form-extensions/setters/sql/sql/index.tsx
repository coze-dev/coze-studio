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

import { useState, type FC } from 'react';

import { I18n } from '@coze-arch/i18n';
import { type SetterComponentProps } from '@flowgram-adapter/free-layout-editor';

import { ExpressionEditor } from '../../expression-editor';
import { AutoGenerate } from './auto-generate';

import styles from './index.module.less';

export const Sql: FC<SetterComponentProps<string>> = props => {
  const { onChange, readonly } = props;
  const [key, setKey] = useState<number>(0);

  function handleSubmit(newValue) {
    onChange(newValue);
    setKey(key + 1);
  }

  return (
    <div className={styles.container}>
      {!readonly && (
        <AutoGenerate
          className={styles['auto-generate']}
          onSubmit={handleSubmit}
        />
      )}

      <ExpressionEditor
        key={key}
        {...props}
        options={{
          key: '',
          placeholder: I18n.t('workflow_240218_12'),
        }}
      />
    </div>
  );
};
