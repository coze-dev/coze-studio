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

import React, { forwardRef, useMemo, useRef } from 'react';

import { nanoid } from 'nanoid';
import type { EditorAPI } from '@coze-editor/editor/preset-prompt';
import { I18n } from '@coze-arch/i18n';

import styles from '../style.module.less';
import { TemplateParser } from '../../../shared/utils/template-parser';
import { LibraryList as DefaultLibraryList } from '../../../library-insert/library-search-popover/library-list';
import type { ILibraryItem, ILibraryList } from '../../../library-insert';
import { useKeyboard } from '../../../expression/popover/hooks';
import useOptionsOperations from './use-options-operations';

interface LibraryListProps {
  libraries: ILibraryList;
  onInsert?: (library: ILibraryItem) => void;
  searchWords?: string[];
}

const LibraryList = forwardRef<HTMLDivElement, LibraryListProps>(
  ({ libraries, onInsert, searchWords }, ref) => {
    const emptyLibrary = libraries.map(item => item.items).flat().length === 0;

    return !emptyLibrary ? (
      <div
        ref={ref}
        className="flex flex-col p-1  w-[352px] max-h-[330px] overflow-y-auto"
      >
        <DefaultLibraryList
          librarys={libraries}
          onInsert={onInsert}
          libraryItemClassName={styles['library-item']}
          searchWords={searchWords}
        />
      </div>
    ) : (
      <div ref={ref} className="coz-fg-primary text-sm font-medium px-3 py-2">
        {I18n.t('edit_block_api_empty')}
      </div>
    );
  },
);

interface Props {
  editor: EditorAPI;
  insertPosition: {
    from: number;
    to: number;
  };
  onInsert?: (insertPosition: { from: number; to: number }) => void;
  enableKeyboard: boolean;
  filterText?: string;
  libraries: ILibraryList;
}

const templateParser = new TemplateParser({ mark: 'LibraryBlock' });

export default function useLibraryList({
  libraries,
  editor,
  insertPosition,
  onInsert,
  enableKeyboard,
  filterText,
}: Props) {
  const libraryListRef = useRef<HTMLDivElement>(null);

  const filterLibraries = useMemo(() => {
    if (!filterText) {
      return libraries;
    }

    return libraries
      .map(item => ({
        ...item,
        items: item.items.filter(i =>
          i.name.toLowerCase().includes(filterText.toLowerCase()),
        ),
      }))
      .filter(item => item.items?.length);
  }, [libraries, filterText]);

  const handleLibraryInsert = (library: ILibraryItem) => {
    const { name = '', id = '', type } = library;
    const uuid = nanoid();
    const template = templateParser.generateTemplate({
      content: name,
      data: {
        id,
        uuid,
        type,
        ...(type === 'plugin' && {
          apiId: library.api_id,
        }),
      },
    });

    templateParser.insertTemplateByRange(editor, template, insertPosition);

    onInsert?.({
      from: insertPosition.from,
      to: insertPosition.from + template.length,
    });
  };

  const { prev, next, apply } = useOptionsOperations({
    rootRef: libraryListRef,
    libraries: filterLibraries,
    applyCallBack: handleLibraryInsert,
  });

  useKeyboard(enableKeyboard, {
    ArrowUp: prev,
    ArrowDown: next,
    Enter: apply,
  });

  const libraryListPanel = (
    <LibraryList
      ref={libraryListRef}
      libraries={filterLibraries}
      onInsert={handleLibraryInsert}
      searchWords={filterText ? [filterText] : undefined}
    />
  );

  return {
    libraryListPanel,
  };
}
