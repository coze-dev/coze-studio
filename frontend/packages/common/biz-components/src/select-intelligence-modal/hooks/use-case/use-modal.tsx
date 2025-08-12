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
