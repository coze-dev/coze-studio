import { useEffect, useLayoutEffect, useRef } from 'react';

import { useInjector, useEditor } from '@flow-lang-sdk/editor/react';
import { type EditorAPI } from '@flow-lang-sdk/editor/preset-prompt';
import { astDecorator } from '@flow-lang-sdk/editor';

import { getLibraryStatus } from '../utils/get-library-status';
import {
  getLibraryBlockInfoFromTemplate,
  getLibraryInfoByBlockInfo,
} from '../utils/get-library-info';
import type { ILibraryItem, ILibraryList } from '../types';
import { TemplateParser } from '../../shared/utils/template-parser';
import { LibraryBlockWidgetType } from './library-block-widget-type';
import './index.css';

const templateParser = new TemplateParser({ mark: 'LibraryBlock' });
function useLatest<T>(value: T) {
  const ref = useRef<T>(value);
  ref.current = value;
  return ref;
}
interface LibraryBlockWidgetProps {
  librarys: ILibraryList;
  readonly?: boolean;
  spaceId?: string;
  className?: string;
  onAddLibrary?: (
    library: ILibraryItem,
    pos?: { from: number; to: number },
  ) => void;
  projectId?: string;
  avatarBotId?: string;
  onRename?: (pos: { from: number; to: number }) => void;
  disabledTooltips?: boolean;
}

export const LibraryBlockWidget = (props: LibraryBlockWidgetProps) => {
  const ref = useLatest(props);

  const editor = useEditor<EditorAPI>();
  const editorRef = useLatest(editor);
  const injector = useInjector();
  useLayoutEffect(
    () =>
      injector.inject([
        astDecorator.whole.of((cursor, state) => {
          const {
            librarys,
            readonly = false,
            spaceId,
            className,
            projectId,
            avatarBotId,
            onRename,
            disabledTooltips,
          } = ref.current;
          if (templateParser.isOpenNode(cursor.node, state)) {
            const open = cursor.node;
            const close = templateParser.findCloseNode(open, state);

            if (close) {
              const openTemplate = state.sliceDoc(open.from, open.to);
              const contentFrom = open.to;
              const contentTo = close.from;
              const content = state.sliceDoc(contentFrom, contentTo);
              const dataInfo = getLibraryBlockInfoFromTemplate({
                template: openTemplate,
                templateParser,
              });
              const { libraryStatus } = getLibraryStatus({
                librarys,
                libraryBlockInfo: dataInfo,
                content,
              });
              const libraryInfo = dataInfo
                ? getLibraryInfoByBlockInfo(librarys, dataInfo)
                : null;
              return [
                {
                  type: 'replace',
                  widget: new LibraryBlockWidgetType({
                    editorRef,
                    blockDataInfo: dataInfo,
                    libraryItem: libraryInfo,
                    readonly,
                    content,
                    spaceId,
                    className,
                    hightlight: libraryStatus === 'existing',
                    libraryStatus,
                    onAddLibrary(library) {
                      if (typeof ref.current.onAddLibrary === 'function') {
                        ref.current.onAddLibrary(library, {
                          from: open.from,
                          to: close.to,
                        });
                      }
                    },
                    range: {
                      left: open.to,
                      right: close.from,
                    },
                    projectId,
                    avatarBotId,
                    onRename,
                    disabledTooltips,
                  }),
                  atomicRange: true,
                  from: open.from,
                  to: close.to,
                },
              ];
            }
          }
        }),
        templateParser.markInfoField,
      ]),
    [injector],
  );

  useEffect(() => {
    if (!editor) {
      return;
    }
    editor?.updateWholeDecorations();
  }, [editor, props.librarys]);

  return null;
};
