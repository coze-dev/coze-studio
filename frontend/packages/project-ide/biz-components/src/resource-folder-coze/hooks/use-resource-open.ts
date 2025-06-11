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
