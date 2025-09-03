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

import React from 'react';

import { t } from '../utils/i18n';
import type { WorkflowFile } from '../types';

interface FilePreviewProps {
  preview: WorkflowFile['preview'];
}

const FilePreview: React.FC<FilePreviewProps> = ({ preview }) => {
  if (!preview) {
    return null;
  }

  return (
    <div
      style={{
        background: '#f7fafc',
        padding: '12px',
        borderRadius: '6px',
        fontSize: '12px',
        color: '#4a5568',
      }}
    >
      <div>
        {t('file_preview_name')}: {preview.name} | {t('file_preview_nodes')}: {preview.nodeCount} | {t('file_preview_connections')}:{' '}
        {preview.edgeCount} | {t('file_preview_version')}: {preview.version}
      </div>
      {preview.description ? <div>{t('file_preview_description')}: {preview.description}</div> : null}
    </div>
  );
};

export default FilePreview;
