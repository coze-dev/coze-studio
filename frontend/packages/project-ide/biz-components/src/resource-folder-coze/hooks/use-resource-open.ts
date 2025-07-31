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

import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';

import { useShallow } from 'zustand/react/shallow';
import {
  getResourceByPathname,
  type ResourceType,
  ResourceTypeEnum,
  useIDENavigate,
} from '@coze-project-ide/framework';

import { usePrimarySidebarStore } from '@/stores';
import { BizResourceTypeEnum } from '@/resource-folder-coze/type';

export const useResourceOpen = () => {
  const { selectedResource, setSelectedResource } = usePrimarySidebarStore(
    useShallow(store => ({
      selectedResource: store.selectedResource,
      setSelectedResource: store.setSelectedResource,
    })),
  );
  const location = useLocation();
  const navigate = useIDENavigate();
  const handleOpenResource = (
    resourceId: string | number,
    resource: ResourceType,
  ) => {
    if (resource.type === ResourceTypeEnum.Folder) {
      return;
    }
    if (resource.type === BizResourceTypeEnum.Variable) {
      navigate(`/${resource.type}`);
      return;
    }
    navigate(`/${resource.type}/${resourceId}`);
  };

  useEffect(() => {
    if (location) {
      const { resourceType, resourceId } = getResourceByPathname(
        location.pathname,
      );
      if (resourceType === BizResourceTypeEnum.Variable) {
        setSelectedResource(resourceType);
      } else {
        setSelectedResource(resourceId);
      }
    }
  }, [location]);

  return { selectedResource, handleOpenResource };
};
