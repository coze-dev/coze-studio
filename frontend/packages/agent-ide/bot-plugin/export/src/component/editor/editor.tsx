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

import { useEffect, useState } from 'react';

import { Editor as MonacoEditor } from '@coze-arch/bot-monaco-editor';

interface EditorPros {
  mode: 'yaml' | 'json' | 'javascript';
  value?: string;
  onChange?: (v: string | undefined) => void;
  height?: number | string;
  useValidate?: boolean;
  theme?: string;
  disabled?: boolean;
  dataTestID?: string;
}

export const Editor: React.FC<EditorPros> = ({
  mode,
  value,
  onChange,
  height = 500,
  theme = 'monokai',
  disabled = false,
  dataTestID,
}) => {
  const [heightVal, setHeightVal] = useState(height);
  useEffect(() => {
    setHeightVal(height);
  }, [height]);
  return (
    <div style={{ position: 'relative' }} data-testid={dataTestID}>
      <MonacoEditor
        options={{ readOnly: disabled }}
        language={mode}
        theme={theme}
        width="100%"
        onChange={onChange}
        height={heightVal}
        value={value}
      />
    </div>
  );
};
