import React from 'react';

import {
  type Resource,
  useIDEService,
  ResourceService,
} from '@coze-project-ide/core';

import { useCurrentWidget } from './use-current-widget';

export const CurrentResourceContext = React.createContext<Resource | undefined>(
  undefined,
);

export function useCurrentResource<T extends Resource>(): T {
  const currentResource = React.useContext(CurrentResourceContext);
  if (currentResource) {
    return currentResource as T;
  }
  const resourceService = useIDEService<ResourceService>(ResourceService);
  const widget = useCurrentWidget();
  const uri = widget.getResourceURI();
  if (!uri) {
    throw new Error('Cannot get uri from widget');
  }
  return resourceService.get(uri);
}
