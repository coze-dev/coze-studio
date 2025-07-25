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
 
import { useSearchParams } from 'react-router-dom';
import React from 'react';

import { type ApiNodeIdentifier } from '@coze-workflow/nodes';
import { I18n } from '@coze-arch/i18n';
import { PluginProductStatus } from '@coze-arch/bot-api/developer_api';
import { IconCozLoading, IconCozExit } from '@coze-arch/coze-design/icons';

import { useGlobalState } from '@/hooks';

import { usePluginDetail } from '../hooks/use-plugin-detail';
import { usePluginNodeServiceStore } from '../hooks';

function getJumpDetailText() {
  return I18n.t('mkpl_plugin_detail', {}, 'Plugin Detail');
}

export const PluginLink = ({
  identifier,
}: {
  identifier: ApiNodeIdentifier;
}) => {
  const { getApiNodeDetail } = usePluginNodeServiceStore(state => ({
    getApiNodeDetail: state.getData,
  }));
  const { getProjectApi } = useGlobalState();
  const [searchParams] = useSearchParams();
  const spaceIdFromUrl = searchParams.get('space_id');
  const apiNodeDetail = getApiNodeDetail(identifier);

  const {
    spaceID: spaceId,
    pluginID: pluginId,
    projectID: projectId,
    pluginProductStatus,
  } = apiNodeDetail || {};

  // 同空间，且状态为待提交的插件，直接跳转 /space/xxx/plugin/yyy
  const noNeedQuery =
    spaceIdFromUrl === spaceId &&
    pluginProductStatus === PluginProductStatus.Default;

  const { isLoading, storePluginId } = usePluginDetail({
    pluginId: pluginId || '',
    needQuery: !noNeedQuery,
  });

  // 运维平台不需要展示插件跳转链接
  if (IS_BOT_OP) {
    return null;
  }

  if (isLoading) {
    return <IconCozLoading className="animate-spin text-xs coz-fg-dim" />;
  }

  const handleClick = (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
    const ideNavigate = getProjectApi()?.navigate;
    if (projectId && projectId !== '0' && ideNavigate) {
      ideNavigate(`/plugin/${pluginId}`);
    } else {
      const url =
        storePluginId && !noNeedQuery
          ? `/store/plugin/${storePluginId}` // 其他状态（已上架，已下架，审核中）
          : `/space/${spaceId}/plugin/${pluginId}`; // 未上架
      window.open(url, '_blank');
    }
    e.stopPropagation();
  };

  return (
    <span
      className="cursor-pointer flex items-center w-full justify-between"
      onClick={handleClick}
    >
      {getJumpDetailText()}
      <IconCozExit className="text-xs" />
    </span>
  );
};

export const createPluginLink = (identifier: ApiNodeIdentifier) => (
  <PluginLink identifier={identifier} />
);
