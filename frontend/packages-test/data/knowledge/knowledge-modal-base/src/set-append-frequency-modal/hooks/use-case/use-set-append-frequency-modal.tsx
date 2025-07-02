import { useState } from 'react';

import { SetAppendFrequencyModal } from '../../components/main';

export const useSetAppendFrequencyModal = (modalProps: {
  datasetId: string;
  onFinish: () => void;
}) => {
  const [visible, setVisible] = useState(false);

  const open = () => {
    setVisible(true);
  };

  const close = () => {
    setVisible(false);
  };

  const node = visible ? (
    <SetAppendFrequencyModal
      datasetId={modalProps.datasetId}
      onFinish={modalProps.onFinish}
      onClose={close}
    />
  ) : null;

  return {
    node,
    open,
    close,
  };
};
