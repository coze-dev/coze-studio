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

import { useEffect, useState } from 'react';

import { nanoid } from 'nanoid';
import {
  PositionMirror,
  useChangeListener,
  useEditor,
} from '@coze-editor/editor/react';
import { type EditorAPI } from '@coze-editor/editor/preset-prompt';
import { I18n } from '@coze-arch/i18n';
import { Popover } from '@coze-arch/coze-design';
import { type ViewUpdate } from '@codemirror/view';
import { syntaxTree } from '@codemirror/language';

import type { ILibraryList } from '../types';
import { TemplateParser } from '../../shared/utils/template-parser';
import { LibraryList } from './library-list';
interface LibrarySearchPopoverProps {
  librarys: ILibraryList;
  direction?: React.ComponentProps<typeof Popover>['position'];
}
const templateParser = new TemplateParser({ mark: 'LibraryBlock' });
export const LibrarySearchPopover = ({
  librarys,
  direction = 'bottomLeft',
}: LibrarySearchPopoverProps) => {
  const [reposKey, setReposKey] = useState('');
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState(-1);
  const [toPosition, setToPosition] = useState(-1);
  const emptyLibrary = librarys.map(item => item.items).flat().length === 0;
  const editor = useEditor<EditorAPI>();

  useChangeListener(e => {
    const [_fromA, _toA, fromB, toB, inserted] = e.change;
    if (['{}', '{'].includes(inserted.toString())) {
      const node = syntaxTree(e.view.state).resolve(
        inserted.toString() === '{}' ? toB - 1 : toB,
      );

      if (node.name === 'JinjaText') {
        setPosition(fromB);
        setToPosition(toB);
        setVisible(true);
      } else {
        // Some scene input {should not pop up the prompt panel
        // For example, the cursor is within {{ }} , or within {% %} , or within {# #}
        setVisible(false);
      }
    } else {
      setVisible(false);
    }
  });

  useEffect(() => {
    if (!editor) {
      return;
    }

    function handleViewUpdate(update: ViewUpdate) {
      if (update.transactions.some(tr => tr.isUserEvent('select'))) {
        setVisible(false);
      }
    }

    editor.$on('viewUpdate', handleViewUpdate);

    return () => {
      editor.$off('viewUpdate', handleViewUpdate);
    };
  }, [editor]);

  return (
    <>
      <Popover
        rePosKey={reposKey}
        visible={visible}
        trigger="custom"
        position={emptyLibrary ? 'bottomLeft' : direction}
        onClickOutSide={() => setVisible(false)}
        autoAdjustOverflow
        content={
          !emptyLibrary ? (
            <div className="flex flex-col p-1  w-[352px] max-h-[330px] overflow-y-auto">
              <LibraryList
                librarys={librarys}
                onInsert={insertLibrary => {
                  const { name = '', id = '', type } = insertLibrary;
                  const uuid = nanoid();
                  const template = templateParser.generateTemplate({
                    content: name,
                    data: {
                      id,
                      uuid,
                      type,
                      ...(type === 'plugin' && {
                        apiId: insertLibrary.api_id,
                      }),
                    },
                  });
                  // Remove the inserted shortcut, because the original was automatically added
                  templateParser.insertTemplateByRange(editor, template, {
                    from: position,
                    to: toPosition,
                  });
                  setVisible(false);
                }}
              />
            </div>
          ) : (
            <div className="coz-fg-primary text-sm font-medium px-3 py-2">
              {I18n.t('edit_block_api_empty')}
            </div>
          )
        }
      >
        <PositionMirror
          position={position}
          onChange={() => setReposKey(String(Math.random()))}
        />
      </Popover>
    </>
  );
};
