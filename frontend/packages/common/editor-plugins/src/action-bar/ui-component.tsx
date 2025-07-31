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

import {
  type PropsWithChildren,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import cls from 'classnames';
import {
  PositionMirror,
  useEditor,
  useInjector,
} from '@coze-editor/editor/react';
import { type EditorAPI } from '@coze-editor/editor/preset-prompt';
import { Popover } from '@coze-arch/coze-design';
import { drawSelection, EditorView } from '@codemirror/view';

import { type SelectionInfo } from '../types';
import { ThemeExtension } from '../theme';
import { useReadonly } from '../shared/hooks/use-editor-readonly';
import { type ActionController } from './types';
import { ActionBarContext } from './context';
interface ActionBarProps {
  className?: string;
  size?: 'default' | 'small' | 'large';
  visible?: boolean;
  onVisibleChange?: (visible: boolean) => void;
  trigger?: 'custom' | 'selection';
}
export const ActionBar: React.FC<PropsWithChildren<ActionBarProps>> = props => {
  const {
    className,
    size = 'small',
    children,
    visible,
    onVisibleChange,
    trigger = 'selection',
  } = props;
  const [internalVisible, setInternalVisible] = useState(false);
  const [reposKey, setReposKey] = useState('');
  const [popoverPosition, setPopoverPosition] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const isReadOnly = useReadonly();
  const [selection, setSelection] = useState<SelectionInfo>({
    from: 0,
    to: 0,
    anchor: 0,
    head: 0,
  });
  const editor = useEditor<EditorAPI>();
  const injector = useInjector();
  const [position, setPosition] = useState<
    'topLeft' | 'bottomRight' | undefined
  >();

  useEffect(() => {
    setPosition(
      selection?.head > selection?.anchor ? 'bottomRight' : 'topLeft',
    );
  }, [selection]);

  const controller: ActionController = {
    hideActionBar: () => {
      onVisibleChange?.(false);
      setInternalVisible(false);
    },
    rePosition: (newPosition?: 'topLeft' | 'bottomRight') => {
      setReposKey(String(Math.random()));
      newPosition && setPosition(newPosition);
    },
  };

  useLayoutEffect(() => injector.inject([drawSelection()]), [injector]);

  useEffect(() => {
    if (!editor) {
      return;
    }

    function handleMousedown() {
      onVisibleChange?.(false);
      setInternalVisible(false);
      setPopoverPosition(-1);
    }

    function handleMouseup(e: MouseEvent) {
      if (containerRef.current?.contains(e.target as Node)) {
        return;
      }
      const selectionRange = editor.getSelection();
      setSelection(selectionRange);

      if (!selectionRange) {
        onVisibleChange?.(false);
        setPopoverPosition(-1);
        setInternalVisible(false);
        return;
      }
      const isSelection = selectionRange.from !== selectionRange.to;
      setSelection(selectionRange);
      onVisibleChange?.(isSelection);
      setInternalVisible(isSelection);
      setPopoverPosition(selectionRange.head);
    }

    function handleSelectionChange() {
      onVisibleChange?.(false);
      setPopoverPosition(-1);
      setInternalVisible(false);
    }

    // function handleBlur() {
    //   onVisibleChange?.(false);
    //   setInternalVisible(false);
    //   editor.$view.dispatch({
    //     selection: { anchor: editor.$view.state.selection.main.head },
    //   });
    // }

    editor.$on('mousedown', handleMousedown);
    // Do not use editor. $on to listen for mouseup events because the mouse may not be in the editor
    document.addEventListener('mouseup', handleMouseup);
    editor.$on('selectionChange', handleSelectionChange);
    // editor.$on('blur', handleBlur);
    return () => {
      editor.$off('mousedown', handleMousedown);
      document.removeEventListener('mouseup', handleMouseup);
      editor.$off('selectionChange', handleSelectionChange);
      // editor.$off('blur', handleBlur);
    };
  }, [editor]);

  if (isReadOnly) {
    return null;
  }
  return (
    <>
      <Popover
        rePosKey={reposKey}
        visible={trigger === 'custom' ? visible : internalVisible}
        trigger="custom"
        position={position}
        autoAdjustOverflow
        className="rounded"
        content={
          <ActionBarContext.Provider value={{ controller, size }}>
            <div className={cls('flex gap-1', className)} ref={containerRef}>
              {children}
            </div>
          </ActionBarContext.Provider>
        }
      >
        <PositionMirror
          position={popoverPosition}
          onChange={() => setReposKey(String(Math.random()))}
        />
      </Popover>
      <ThemeExtension
        themes={[
          EditorView.theme({
            '.cm-selectionBackground': {
              backgroundColor: 'rgba(148, 152, 247, 0.44)',
            },
          }),
        ]}
      />
    </>
  );
};
