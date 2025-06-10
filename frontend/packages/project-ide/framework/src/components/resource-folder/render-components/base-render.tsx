import React from 'react';

import { type CommonComponentProps, ResourceTypeEnum } from '../type';
import { FolderRender } from './folder-render';
import { FileRender } from './file-render';

const BaseRender: React.FC<CommonComponentProps> = ({ ...props }) => {
  const { resource, path } = props;

  const Component =
    resource.type === ResourceTypeEnum.Folder ? FolderRender : FileRender;
  if (!Component) {
    return <></>;
  }

  return (
    <Component
      key={`base-render-${resource.id}`}
      {...props}
      path={[...path, resource.id]}
    />
  );
};

export { BaseRender };
