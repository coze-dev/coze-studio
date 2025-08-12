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

import React, {
  type FC,
  useCallback,
  type CSSProperties,
  useEffect,
} from 'react';

import { Editable, Slate } from 'slate-react';
import type { Descendant } from 'slate';
import { I18n } from '@coze-arch/i18n';
import { usePlayground } from '@flowgram-adapter/free-layout-editor';

import type { CommentEditorModel } from '../../model';
import { CommentEditorEvent } from '../../constant';
import { Placeholder } from './placeholder';
import { Leaf } from './leaf';
import { Block } from './block';

interface ICommentEditor {
  model: CommentEditorModel;
  style?: CSSProperties;
  value?: string;
  onChange?: (value: string) => void;
}

export const CommentEditor: FC<ICommentEditor> = props => {
  const { model, style, onChange } = props;
  const playground = usePlayground();
  const renderBlock = useCallback(blockProps => <Block {...blockProps} />, []);
  const renderLeaf = useCallback(leafProps => <Leaf {...leafProps} />, []);

  // Synchronize editor internal value changes
  useEffect(() => {
    const dispose = model.on<CommentEditorEvent.Change>(
      CommentEditorEvent.Change,
      () => {
        onChange?.(model.value);
      },
    );
    return () => dispose();
  }, [model, onChange]);

  return (
    <Slate
      editor={model.editor}
      initialValue={model.blocks as unknown as Descendant[]}
      onChange={() => model.fireChange()}
    >
      <Editable
        className="workflow-comment-editor w-full cursor-text"
        spellCheck
        readOnly={playground.config.readonly}
        renderElement={renderBlock}
        renderLeaf={renderLeaf}
        onKeyDown={e => model.keydown(e)}
        onPaste={e => model.paste(e)}
        style={style}
        placeholder={I18n.t('workflow_note_placeholder')}
        renderPlaceholder={p => <Placeholder {...p} />}
      />
    </Slate>
  );
};
