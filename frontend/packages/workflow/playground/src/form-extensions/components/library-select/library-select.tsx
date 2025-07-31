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

import { IconCozPlus } from '@coze-arch/coze-design/icons';
import { IconButton } from '@coze-arch/coze-design';

import { FieldEmpty } from '@/form';

import { type Library } from './types';
import { LibraryCard } from './library-card';

type DefaultLibraryRender = () => React.ReactNode;
interface RenderLibraryProps {
  defaultLibraryRender: DefaultLibraryRender;
  library: Library;
}
type RenderLibrary = (props: RenderLibraryProps) => React.ReactNode;

interface LibrarySelectProps {
  libraries?: Library[];
  readonly?: boolean;
  onDeleteLibrary?: (id: string) => void;
  onAddLibrary?: () => void;
  onClickLibrary?: (id: string) => void;
  renderLibrary?: RenderLibrary;
  emptyText?: string;
  hideAddButton?: boolean;
  addButtonTestID?: string;
  libraryCardTestID?: string;
}

export const LibrarySelect = ({
  libraries = [],
  readonly,
  onDeleteLibrary,
  onAddLibrary,
  onClickLibrary,
  renderLibrary,
  emptyText = '',
  hideAddButton = false,
  addButtonTestID = '',
  libraryCardTestID = '',
}: LibrarySelectProps) => (
  <div className="relative">
    {readonly || hideAddButton ? (
      <></>
    ) : (
      <div className="absolute right-[0] top-[-32px]">
        <IconButton
          color="highlight"
          onClick={onAddLibrary}
          theme="borderless"
          icon={<IconCozPlus />}
          size="small"
          data-testid={addButtonTestID}
        />
      </div>
    )}
    <div className="flex flex-col gap-[4px]">
      {libraries.length > 0 ? (
        libraries.map(library => {
          const isInvalid = library?.isInvalid;
          const defaultLibraryRender = () => (
            <LibraryCard
              isInvalid={isInvalid}
              readonly={readonly}
              key={library.id}
              library={library}
              onDelete={onDeleteLibrary}
              onClick={id => {
                if (isInvalid) {
                  return;
                }
                onClickLibrary?.(id);
              }}
              testID={libraryCardTestID}
            />
          );

          if (renderLibrary) {
            return renderLibrary({ library, defaultLibraryRender });
          }

          return defaultLibraryRender();
        })
      ) : (
        <FieldEmpty text={emptyText} isEmpty={true} />
      )}
    </div>
  </div>
);
