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
