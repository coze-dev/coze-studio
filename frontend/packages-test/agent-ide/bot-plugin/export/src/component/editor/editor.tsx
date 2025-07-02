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
