import { type Dispatch, type SetStateAction, useState } from 'react';

import { type PopoverProps } from '@coze-arch/bot-semi/Popover';

export const usePopoverLock = ({
  defaultLocked,
  defaultVisible,
}: {
  defaultVisible?: boolean;
  defaultLocked?: boolean;
} = {}): {
  props: Pick<PopoverProps, 'trigger' | 'visible' | 'onClickOutSide'>;
  locked: boolean;
  visible: boolean;
  setVisible: Dispatch<SetStateAction<boolean>>;
  setLocked: Dispatch<SetStateAction<boolean>>;
} => {
  const [locked, setLocked] = useState(defaultLocked ?? false);
  const [visible, setVisible] = useState(defaultVisible ?? false);

  return {
    props: {
      trigger: 'custom',
      visible,
      onClickOutSide: () => {
        if (!locked) {
          setVisible(false);
        }
      },
    },
    visible,
    locked,
    setVisible,
    setLocked,
  };
};
