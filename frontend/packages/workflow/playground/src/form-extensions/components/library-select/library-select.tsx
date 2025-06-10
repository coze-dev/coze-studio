import { IconCozPlus } from '@coze/coze-design/icons';
import { IconButton } from '@coze/coze-design';

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
