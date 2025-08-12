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

const FolderRender: React.FC<CommonComponentProps> = ({
  resource,
  path,
  style,
  ...props
}) => {
  const { id } = resource;

  const {
    iconRender,
    isSelected,
    isTempSelected,
    isExpand,
    draggingError,
    isDragging,
  } = props;

  const cursor = (() => {
    if (draggingError) {
      return 'not-allowed';
    } else if (isDragging) {
      return 'grabbing';
    }
    return 'default';
  })();

  const isRoot = path.length === 1;

  // const { parentId: createResourceParentId, type: createResourceType } =
  //   createResourceInfo || {};

  // const { renderCreateNode, appendIndex, itemElm } = (() => {
  //   if (String(createResourceParentId) === String(id)) {
  //     return {
  //       renderCreateNode: true,
  //       appendIndex:
  //         createResourceType === ResourceTypeEnum.Folder
  //           ? 0
  //           : children?.findIndex(
  //               child => child.type !== ResourceTypeEnum.Folder,
  //             ),
  //       itemElm: (
  //         <BaseRender
  //           resource={{
  //             id: CREATE_RESOURCE_ID,
  //             name: '',
  //             type: createResourceType,
  //           }}
  //           path={path}
  //         />
  //       ),
  //     };
  //   }

  //   return {
  //     renderCreateNode: false,
  //     appendIndex: -1,
  //     itemElm: null,
  //   };
  // })();

  return (
    <>
      <div
        key={`folder-${id}`}
        style={{
          ...(style || {}),
          cursor,
        }}
      >
        {!isRoot && (
          <ItemRender
            resource={resource}
            path={path}
            icon={
              iconRender
                ? iconRender({
                    resource,
                    isSelected,
                    isTempSelected,
                    isExpand,
                  })
                : undefined
            }
            {...props}
          />
        )}
      </div>
    </>
  );
};

export { FolderRender };
