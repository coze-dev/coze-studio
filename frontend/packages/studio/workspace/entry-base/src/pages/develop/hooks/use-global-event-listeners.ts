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

import { useEffect } from 'react';

import {
  cozeMitt,
  type RefreshFavListParams,
  type CreateProjectByCopyTemplateFromSidebarParam,
} from '@coze-common/coze-mitt';

export const useGlobalEventListeners = ({
  reload,
  spaceId,
}: {
  reload: () => void;
  spaceId: string;
}) => {
  useEffect(() => {
    const handlerRefreshFavList = (
      refreshFavListParams: RefreshFavListParams,
    ) => {
      // Refresh the list only when the workspace collection is cancelled and the collection is changed.
      if (refreshFavListParams.emitPosition === 'favorites-list-item') {
        reload();
      }
    };
    const handleReloadConditionally = (
      eventParam: CreateProjectByCopyTemplateFromSidebarParam,
    ) => {
      if (eventParam.toSpaceId !== spaceId) {
        return;
      }
      reload();
    };
    cozeMitt.on('refreshFavList', handlerRefreshFavList);
    cozeMitt.on(
      'createProjectByCopyTemplateFromSidebar',
      handleReloadConditionally,
    );
    return () => {
      cozeMitt.off('refreshFavList', handlerRefreshFavList);
      cozeMitt.off(
        'createProjectByCopyTemplateFromSidebar',
        handleReloadConditionally,
      );
    };
  }, []);
};
