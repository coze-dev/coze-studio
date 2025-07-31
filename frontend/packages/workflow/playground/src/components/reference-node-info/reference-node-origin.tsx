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

/**
 * Node source
 */

import { I18n } from '@coze-arch/i18n';
import { IconCozStore, IconCozTray } from '@coze-arch/coze-design/icons';
import { IconButton, Tooltip } from '@coze-arch/coze-design';
import { type FlowNodeEntity } from '@flowgram-adapter/free-layout-editor';

import { useNodeOrigin } from './use-node-origin';

interface ReferenceNodeOriginProps {
  node: FlowNodeEntity;
}

export const ReferenceNodeOrigin: React.FC<ReferenceNodeOriginProps> = ({
  node,
}) => {
  const { isFromStore, isFromLibrary } = useNodeOrigin(node);

  if (isFromStore) {
    return (
      <Tooltip content={I18n.t('workflow_node_from_store')}>
        <IconButton icon={<IconCozStore />} size="mini" color="secondary" />
      </Tooltip>
    );
  }

  if (isFromLibrary) {
    return (
      <Tooltip content={I18n.t('workflow_version_origin_tooltips')}>
        <IconButton icon={<IconCozTray />} size="mini" color="secondary" />
      </Tooltip>
    );
  }

  return null;
};
