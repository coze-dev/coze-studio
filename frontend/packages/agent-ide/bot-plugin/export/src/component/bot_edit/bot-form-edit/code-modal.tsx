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

import { type FC, useState } from 'react';

import { Button } from '@coze-arch/coze-design';
import { IconCodeOutlined } from '@coze-arch/bot-icons';

import { CreateCodePluginModal } from '../bot-code-edit';

export const CodeModal: FC<{
  onCancel?: () => void;
  onSuccess?: (pluginId?: string) => void;
  projectId?: string;
}> = ({ onCancel, onSuccess, projectId }) => {
  const [showCodePluginModel, setShowCodePluginModel] = useState(false);
  return (
    <>
      <CreateCodePluginModal
        isCreate={true}
        visible={showCodePluginModel}
        onSuccess={pluginId => {
          onSuccess?.(pluginId);
        }}
        onCancel={() => {
          setShowCodePluginModel(false);
        }}
        projectId={projectId}
      />
      <Button
        data-testid="create-plugin-code-modal-button"
        color="primary"
        icon={<IconCodeOutlined />}
        onClick={() => {
          setShowCodePluginModel(true);
          onCancel?.();
        }}
      />
    </>
  );
};
