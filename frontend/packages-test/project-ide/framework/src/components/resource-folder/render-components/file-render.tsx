import React from 'react';

import { type CommonComponentProps } from '../type';
import { ItemRender } from './components/item-render';

const FileRender: React.FC<CommonComponentProps> = ({
  resource,
  path,
  ...props
}) => {
  const { isDragging, draggingError, isSelected, isTempSelected, iconRender } =
    props;

  const cursor = (() => {
    if (draggingError) {
      return 'not-allowed';
    } else if (isDragging) {
      return 'grabbing';
    }
    return 'pointer';
  })();

  return (
    <div
      key={`file-${resource.id}`}
      style={{
        cursor,
      }}
    >
      <ItemRender
        resource={resource}
        path={path}
        icon={
          resource?.type
            ? iconRender?.({
                resource,
                isSelected,
                isTempSelected,
              })
            : undefined
        }
        {...props}
      />
    </div>
  );
};

export { FileRender };
