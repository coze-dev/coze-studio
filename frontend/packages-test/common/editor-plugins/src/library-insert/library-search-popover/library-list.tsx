import classnames from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { Typography } from '@coze-arch/coze-design';

import {
  type ILibraryList,
  type ILibraryItem,
  type LibraryType,
} from '../types';
import { LibraryItem } from './library-item';
import { AddLibraryAction } from './actions/add-library-action';
interface LibraryListProps {
  librarys: ILibraryList;
  onInsert?: (library: ILibraryItem) => void;
  libraryItemClassName?: string;
  searchWords?: string[];
}
const LibraryTypeTextMap: Record<LibraryType, string> = {
  plugin: I18n.t('edit_block_api_plugin'),
  workflow: I18n.t('edit_block_api_workflow'),
  imageflow: I18n.t('edit_block_api_imageflow'),
  text: I18n.t('edit_block_api_knowledge_text'),
  image: I18n.t('edit_block_api_knowledge_image'),
  table: I18n.t('edit_block_api_knowledge_table'),
};
export const LibraryList = ({
  librarys,
  onInsert,
  libraryItemClassName,
  searchWords,
}: LibraryListProps) => (
  <div className="flex flex-col gap-2">
    {Object.values(librarys).map(library => {
      const { items, type } = library;
      if (items.length === 0) {
        return null;
      }
      return (
        <div key={type} className="flex flex-col">
          <Typography.Text className="coz-fg-tertiary text-xs mb-1 px-2 pt-2 pb-1">
            {LibraryTypeTextMap[type]}
          </Typography.Text>
          {items.map(item => {
            const { name, desc, icon_url } = item;
            return (
              <LibraryItem
                searchWords={searchWords}
                key={name}
                title={name || ''}
                description={desc || ''}
                avatar={icon_url || ''}
                className={classnames('p-[8px]', libraryItemClassName)}
                actions={
                  <AddLibraryAction
                    library={{ ...item, type }}
                    onClick={libraryItem => {
                      onInsert?.(libraryItem);
                    }}
                  />
                }
              />
            );
          })}
        </div>
      );
    })}
  </div>
);
