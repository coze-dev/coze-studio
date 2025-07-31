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

/* eslint-disable @coze-arch/max-line-per-function */
import {
  type ForwardedRef,
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
  useEffect,
} from 'react';

import classNames from 'classnames';
import { useDebounceFn } from 'ahooks';
import {
  type MockDataInfo,
  FORMAT_SPACE_SETTING,
  parseToolSchema,
} from '@coze-studio/mockset-shared';
import { Skeleton } from '@coze-arch/bot-semi';
import type {
  editor as monacoEditorNameSpace,
  Monaco,
} from '@coze-arch/bot-monaco-editor/types';
import {
  Editor as MonacoEditor,
  DiffEditor,
} from '@coze-arch/bot-monaco-editor';

import lightTheme from './light-theme-editor.module.less';
import s from './editor.module.less';

export interface MockDataEditorMarkerInfo {
  message: string;
}

export interface MockDataEditorProps {
  mockInfo: MockDataInfo;
  readOnly?: boolean;
  className?: string;
  onValidate?: (markers: MockDataEditorMarkerInfo[]) => void;
  onEditorPaste?: () => undefined | boolean;
  onEditorReady?: () => void;
}

export interface EditorActions {
  getValue: () => string | undefined;
}

export const MockDataEditor = forwardRef(
  (
    {
      mockInfo,
      readOnly,
      className,
      onValidate,
      onEditorPaste,
      onEditorReady,
    }: MockDataEditorProps,
    ref: ForwardedRef<EditorActions>,
  ) => {
    const { mock, mergedResultExample, schema, incompatible } = mockInfo;
    const [ready, setReady] = useState(false);

    const editorRef =
      useRef<monacoEditorNameSpace.IStandaloneCodeEditor | null>(null);
    const monacoRef = useRef<Monaco | null>(null);

    const validateHandler = useCallback(
      (markers: monacoEditorNameSpace.IMarker[]) => {
        const m = markers.map(marker => ({
          message: marker.message,
        }));
        if (editorRef.current?.getValue().trim().length === 0) {
          m.push({ message: 'no data' });
        }
        onValidate?.(m);
      },
      [onValidate],
    );

    const { run: modelDecorationsChangeHandler } = useDebounceFn(
      () => {
        const model = editorRef.current?.getModel();
        if (model?.id) {
          const markers =
            (
              monacoRef.current?.editor.getModelMarkers as (
                id: string,
              ) => monacoEditorNameSpace.IMarker[]
            )(model.id).filter(
              (item: monacoEditorNameSpace.IMarker) =>
                item.resource.path === model.id.replace('$model', '/'),
            ) || [];
          validateHandler(markers || []);
        }
      },
      {
        wait: 200,
      },
    );

    const editorFormatJSON = useCallback(() => {
      editorRef.current?.trigger('editor', 'editor.action.formatDocument', {});
    }, []);

    const editorDidMountHandler = (
      editor: monacoEditorNameSpace.IStandaloneCodeEditor,
      monaco: Monaco,
    ) => {
      editorRef.current = editor;
      monacoRef.current = monaco;

      const parsedSchema = schema ? parseToolSchema(schema) : undefined;
      const model = editor.getModel();
      const filePath = model?.uri.toString();
      if (parsedSchema && filePath) {
        monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
          validate: true,
          schemaValidation: 'error',
          schemas: [
            {
              // cp-disable-next-line
              uri: `https://plugin-mock-set/tool_schema_${model?.id}`,
              fileMatch: [filePath],
              schema: parsedSchema,
            },
          ],
        });
      }

      editor.onDidBlurEditorText(editorFormatJSON);
      editor.onDidPaste(() => {
        const continueProcessing = onEditorPaste?.();
        if (continueProcessing !== false) {
          editorFormatJSON();
        }
      });
      editor.onDidChangeModelDecorations(modelDecorationsChangeHandler);
      editor.getModel()?.updateOptions({ tabSize: FORMAT_SPACE_SETTING });

      onEditorReady?.();
      setTimeout(() => {
        setReady(true);
      });
    };

    const diffEditorDidMountHandler = (
      editor: monacoEditorNameSpace.IStandaloneDiffEditor,
      monaco: Monaco,
    ) => {
      const modifiedEditor = editor.getModifiedEditor();
      editorDidMountHandler(modifiedEditor, monaco);
    };

    useImperativeHandle(ref, () => ({
      getValue: () => editorRef.current?.getValue(),
    }));

    useEffect(() => {
      editorFormatJSON();
    }, [mock?.responseExpect?.responseExpectRule, mergedResultExample]);

    return (
      <div
        className={classNames(
          s['editor-container'],
          readOnly ? s['editor-container_disabled'] : '',
          lightTheme.light,
          className,
        )}
      >
        {!ready ? (
          <Skeleton className={s.skeleton} placeholder={<Skeleton.Image />} />
        ) : null}
        {incompatible && !readOnly ? (
          <DiffEditor
            className={classNames(s.editor, !ready ? s.editor_hidden : '')}
            theme={'vs-dark'}
            original={mock?.responseExpect?.responseExpectRule}
            modified={mergedResultExample}
            language="json"
            options={{
              unicodeHighlight: {
                ambiguousCharacters: false,
              },
              wordWrap: 'on',
              readOnly,
              formatOnPaste: true,
              formatOnType: true,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              contextmenu: false,
            }}
            onMount={diffEditorDidMountHandler}
            loading={null}
          />
        ) : (
          <MonacoEditor
            className={classNames(s.editor, !ready ? s.editor_hidden : '')}
            theme={'vs-dark'}
            language="json"
            options={{
              unicodeHighlight: {
                ambiguousCharacters: false,
              },
              wordWrap: 'on',
              readOnly,
              formatOnPaste: true,
              formatOnType: true,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              scrollbar: {
                alwaysConsumeMouseWheel: !readOnly,
              },
              contextmenu: false,
            }}
            value={
              mock?.responseExpect?.responseExpectRule || mergedResultExample
            }
            onMount={editorDidMountHandler}
            loading={null}
          />
        )}
      </div>
    );
  },
);
