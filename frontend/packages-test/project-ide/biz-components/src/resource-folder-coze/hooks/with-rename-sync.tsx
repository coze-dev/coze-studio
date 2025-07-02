import { type FC } from 'react';
import React from 'react';

import {
  getURIByResource,
  type ResourceFolderProps,
  ResourceTypeEnum,
  useProjectIDEServices,
} from '@coze-project-ide/framework';

import { type ResourceFolderCozeProps } from '../type';
export const withRenameSync =
  (Comp: FC<ResourceFolderCozeProps>): FC<ResourceFolderCozeProps> =>
  ({ onChangeName, ...props }) => {
    const { view } = useProjectIDEServices();
    const wrappedChangeName: ResourceFolderProps['onChangeName'] =
      async event => {
        await onChangeName?.(event);
        if (
          event.resource?.type &&
          event.resource?.id &&
          event.resource.type !== ResourceTypeEnum.Folder
        ) {
          const uri = getURIByResource(event.resource.type, event.resource.id);
          const widgetContext = view.getWidgetContextFromURI(uri);
          widgetContext?.widget?.setTitle(event.name);
        }
      };
    return <Comp {...props} onChangeName={wrappedChangeName} />;
  };
