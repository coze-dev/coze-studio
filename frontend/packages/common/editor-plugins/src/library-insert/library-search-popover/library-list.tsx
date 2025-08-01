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
