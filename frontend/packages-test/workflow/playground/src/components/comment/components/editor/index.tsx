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

  // 同步编辑器内部值变化
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
