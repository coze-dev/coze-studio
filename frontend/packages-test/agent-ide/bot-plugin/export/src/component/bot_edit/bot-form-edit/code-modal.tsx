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
