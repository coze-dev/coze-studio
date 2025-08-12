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
