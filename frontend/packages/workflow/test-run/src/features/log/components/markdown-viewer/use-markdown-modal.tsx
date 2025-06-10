import { useMemo, useState } from 'react';

import { MarkdownModal } from './markdown-modal';

export const useMarkdownModal = () => {
  const [visible, setVisible] = useState(false);
  const [value, setValue] = useState('');

  const open = (nextValue: string) => {
    setValue(nextValue);
    setVisible(true);
  };
  const close = () => {
    setVisible(false);
    setValue('');
  };

  const modal = useMemo(
    () =>
      value ? (
        <MarkdownModal visible={visible} value={value} onClose={close} />
      ) : null,
    [visible, value],
  );

  return {
    open,
    modal,
  };
};
