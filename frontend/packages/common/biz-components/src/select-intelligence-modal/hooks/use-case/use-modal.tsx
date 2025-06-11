import { useState } from 'react';

import { type IntelligenceData } from '@coze-arch/idl/intelligence_api';

import { SelectIntelligenceModal } from '../../components';

interface ModalProps {
  spaceId: string;
  onSelect?: (intelligence: IntelligenceData) => void;
  onCancel?: () => void;
}

export const useModal = (props: ModalProps) => {
  const [visible, setVisible] = useState(false);

  const close = () => {
    setVisible(false);
  };

  const open = () => {
    setVisible(true);
  };

  return {
    node: visible ? (
      <SelectIntelligenceModal
        visible={visible}
        spaceId={props.spaceId}
        onSelect={props.onSelect}
        onCancel={close}
      />
    ) : null,
    close,
    open,
  };
};
