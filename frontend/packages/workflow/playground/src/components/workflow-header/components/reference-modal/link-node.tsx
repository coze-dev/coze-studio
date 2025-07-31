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

import { I18n } from '@coze-arch/i18n';
import { IconCozLongArrowTopRight } from '@coze-arch/coze-design/icons';
import { Tooltip, IconButton } from '@coze-arch/coze-design';
import { NodeType, DependencyOrigin } from '@coze-common/resource-tree';

import { usePluginDetail } from '@coze-workflow/playground';
import { navigateResource } from './utils';

export const LinkNode = ({
  extraInfo,
  spaceId,
  projectId,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  extraInfo: any;
  spaceId: string;
  projectId?: string;
}) => {
  // New tab opens
  // Business side navigating jumping logic
  const isStorePlugin =
    extraInfo.type === NodeType.PLUGIN &&
    extraInfo.from === DependencyOrigin.SHOP;
  const { isLoading, storePluginId } = usePluginDetail({
    pluginId: extraInfo.id,
    needQuery: isStorePlugin,
  });

  const handleJump = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigateResource({
      info: {
        ...extraInfo,
        id: storePluginId,
      },
      spaceId,
      projectId,
    });
  };
  return (
    <Tooltip
      content={I18n.t('reference_graph_node_open_in_new_tab')}
      theme="dark"
    >
      <IconButton
        loading={isLoading}
        size="small"
        icon={<IconCozLongArrowTopRight />}
        onClick={handleJump}
      />
    </Tooltip>
  );
};
