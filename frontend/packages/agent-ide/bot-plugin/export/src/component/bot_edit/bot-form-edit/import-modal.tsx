import { type FC, useState } from 'react';

import { I18n } from '@coze-arch/i18n';
import { Button } from '@coze-arch/coze-design';

import { ImportPluginModal } from '../../file-import';

export const ImportModal: FC<{
  onCancel?: () => void;
  onSuccess?: (pluginID?: string) => void;
  projectId?: string;
}> = ({ onCancel, onSuccess, projectId }) => {
  const [showFileImportPluginModel, setShowFileImportPluginModel] =
    useState(false);

  return (
    <>
      <ImportPluginModal
        projectId={projectId}
        visible={showFileImportPluginModel}
        onSuccess={d => {
          const pluginId = d?.plugin_id;
          if (pluginId) {
            onSuccess?.(pluginId);
          } else {
            onSuccess?.();
          }
        }}
        onCancel={() => setShowFileImportPluginModel(false)}
      />
      <Button
        color="primary"
        onClick={() => {
          setShowFileImportPluginModel(true);
          onCancel?.();
        }}
      >
        {I18n.t('import')}
      </Button>
    </>
  );
};
