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
