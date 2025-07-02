import React, { useCallback } from 'react';

import { VoiceSelect } from '@coze-workflow/components';

import { type FileProps } from './types';

const VoiceAdapter: React.FC<FileProps> = props => {
  const { value, onChange, disabled, onBlur } = props;

  const handleChange = useCallback(
    (v?: string) => {
      onChange?.(v);
      onBlur?.();
    },
    [onBlur, onChange],
  );

  return (
    <VoiceSelect value={value} onChange={handleChange} disabled={disabled} />
  );
};

export { VoiceAdapter };
