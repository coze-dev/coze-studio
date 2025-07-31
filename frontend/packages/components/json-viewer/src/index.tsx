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

import { isNil, isString } from 'lodash-es';
import cls from 'classnames';

import { generateFields } from './utils/generate-field';
import type { JsonValueType } from './types';
import { JsonViewerProvider } from './context';
import { TextField } from './components/text-field';
import { JsonField } from './components';

import styles from './index.module.less';

export type { JsonValueType };

export interface JsonViewerProps {
  /** Supports object or plain text rendering */
  data: JsonValueType;
  className?: React.HTMLAttributes<HTMLDivElement>['className'];
  /** Expand all fields by default */
  defaultExpandAllFields?: boolean;
}

export const JsonViewer: React.FC<JsonViewerProps> = ({
  data,
  className,
  defaultExpandAllFields,
}) => {
  const render = () => {
    // Bottom display null
    if (isNil(data)) {
      return (
        <JsonField
          field={{
            path: [],
            lines: [],
            value: 'Null',
            isObj: false,
            children: [],
          }}
          key={'Null'}
        />
      );
    }

    // Text class result display
    const isStr = isString(data);
    if (isStr) {
      return <TextField text={data} />;
    }

    // Other JSON data display
    const fields = generateFields(data);
    return (
      <JsonViewerProvider
        fields={fields}
        defaultExpandAllFields={defaultExpandAllFields}
      >
        {fields.map(i => (
          <JsonField field={i} key={i.path.join('.')} />
        ))}
      </JsonViewerProvider>
    );
  };

  return (
    <div
      data-testid="json-viewer-wrapper"
      className={cls(styles['json-viewer-wrapper'], className)}
      draggable
      onDragStart={e => {
        e.stopPropagation();
        e.preventDefault();
      }}
    >
      {render()}
    </div>
  );
};

export { LogObjSpecialKey, LogValueStyleType } from './constants';
