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

import { isString } from 'lodash-es';
import {
  JsonViewer,
  type JsonViewerProps,
  type Path,
} from '@textea/json-viewer';

const objectToCopyableString = (value: any): string => {
  if (isString(value)) {
    return value;
  }
  try {
    return JSON.stringify(value, null, 4);
  } catch (_err) {
    return String(value);
  }
};

export const CustomJsonViewer = <T,>(props: JsonViewerProps<T>) => {
  const { onCopy } = props;
  return (
    <JsonViewer
      style={{
        whiteSpace: 'pre-wrap',
        fontSize: '12px',
      }}
      rootName={false}
      {...props}
      onCopy={(
        _path: Path,
        value: unknown,
        copy: (value: string) => Promise<void>,
      ) => {
        copy(objectToCopyableString(value));
        onCopy?.(_path, objectToCopyableString(value), copy);
      }}
    />
  );
};
export type { JsonViewerProps };
