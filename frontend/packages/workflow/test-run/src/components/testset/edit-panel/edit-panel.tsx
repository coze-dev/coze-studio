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

import { useTestsetManageStore } from '../use-testset-manage-store';
import { TestsetEditForm } from './edit-form';
import { ChatFlowTestsetEditForm } from './chat-flow-edit-form';

interface TestsetEditPanelProps {
  isChatFlow?: boolean;
  onParentClose?: () => void;
}

export const TestsetEditPanel: React.FC<TestsetEditPanelProps> = ({
  isChatFlow,
  onParentClose,
}) => {
  const { editPanelVisible, editData } = useTestsetManageStore(store => ({
    editPanelVisible: store.editPanelVisible,
    editData: store.editData,
  }));

  if (!editPanelVisible) {
    return null;
  }

  return isChatFlow ? (
    <ChatFlowTestsetEditForm data={editData} onParentClose={onParentClose} />
  ) : (
    <TestsetEditForm data={editData} />
  );
};
