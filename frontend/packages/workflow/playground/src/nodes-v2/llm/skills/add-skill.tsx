import { type FC, useState } from 'react';

import { AddIcon } from '@/nodes-v2/components/add-icon';

import { SkillModal, type SkillModalProps } from './skill-modal';

export const AddSkill: FC<
  Omit<SkillModalProps, 'visible' | 'onCancel'> & {
    disabledTooltip?: string;
  }
> = props => {
  const [modalVisible, setModalVisible] = useState(false);

  const handleOpenModal = e => {
    e.stopPropagation();
    setModalVisible(true);
  };
  const handleCloseModal = () => setModalVisible(false);

  return (
    <div
      onClick={e => {
        e.stopPropagation();
      }}
    >
      <AddIcon
        disabledTooltip={props.disabledTooltip}
        onClick={handleOpenModal}
      />

      <SkillModal
        visible={modalVisible}
        onCancel={handleCloseModal}
        {...props}
      />
    </div>
  );
};
