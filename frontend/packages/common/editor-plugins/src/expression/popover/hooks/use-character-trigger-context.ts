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

/* eslint @coze-arch/max-line-per-function: "warn" */
import { useLayoutEffect, useState } from 'react';

import { useInjector, useLatest } from '@coze-editor/editor/react';
import { ViewPlugin, type ViewUpdate } from '@codemirror/view';
import { EditorSelection, type EditorState } from '@codemirror/state';
import { syntaxTree } from '@codemirror/language';

import {
  type ComposeTransaction,
  isSkipSelectionChangeUserEvent,
} from '../shared';
import { type CompletionContext } from './types';

interface TriggerContext extends CompletionContext {
  validate: (state: EditorState) => boolean;
  composeTransaction?: ComposeTransaction;
}

function useCharacterTriggerContext(disableUpdateTrigger?: boolean) {
  const [triggerContext, setTriggerContext] = useState<
    TriggerContext | undefined
  >();
  const setTriggerContextRef = useLatest(setTriggerContext);
  const injector = useInjector();

  useLayoutEffect(() => {
    function getNodeAtCursor(state: EditorState) {
      const pos = state.selection.main.from;
      const tree = syntaxTree(state);
      const node = tree.resolve(pos);
      return node;
    }

    return injector.inject([
      ViewPlugin.fromClass(
        class {
          triggerContext: TriggerContext | undefined = undefined;

          update(update: ViewUpdate) {
            let triggerCharacter:
              | { content: string; from: number; to: number }
              | undefined;

            if (!disableUpdateTrigger && update.docChanged) {
              // eslint-disable-next-line max-params
              update.changes.iterChanges((fromA, toA, fromB, toB, inserted) => {
                const insertString = inserted.toString();
                if (
                  fromA === toA &&
                  (insertString === '{' || insertString === '{}')
                ) {
                  triggerCharacter = {
                    from: fromB,
                    to: toB,
                    content: insertString,
                  };
                }
              });
            }

            // when user input { or {}, show all available variables
            if (triggerCharacter) {
              const node = getNodeAtCursor(update.state);

              // for case like {{<cursor>content, shall show variables
              if (
                node &&
                node.name === 'JinjaExpression' &&
                node.lastChild?.name === 'JinjaExpressionEnd' &&
                node.lastChild.to - node.lastChild.from === 2
              ) {
                // {<cursor>} -> {{<cursor>}}
                // skip here, handover to use-interpolation-content
                this.triggerContext = undefined;
              } else {
                // <cursor>content -> {<cursor>content
                // <cursor> -> {<cursor>}
                const from = triggerCharacter.from + 1;
                const { to } = update.state.selection.main;
                this.triggerContext = {
                  from,
                  to,
                  offset: 0,
                  text: '',
                  textBefore: '',
                  validate(state) {
                    if (!triggerCharacter) {
                      return true;
                    }

                    // check { still exists
                    if (
                      state.sliceDoc(
                        triggerCharacter.from,
                        triggerCharacter.from + 1,
                      ) !== '{'
                    ) {
                      return false;
                    }

                    // check character after cursor is still }
                    // edge case：user may press Delete, cause the } disappears
                    if (
                      triggerCharacter.content === '{}' &&
                      state.sliceDoc(
                        state.selection.main.to,
                        state.selection.main.to + 1,
                      ) !== '}'
                    ) {
                      return false;
                    }

                    return true;
                  },
                  composeTransaction: (tr, state) => {
                    if (!triggerCharacter) {
                      return [];
                    }

                    // already exists { before {, we shall reuse it
                    const characterBefore = state.sliceDoc(
                      Math.max(0, triggerCharacter.from - 1),
                      triggerCharacter.from,
                    );
                    const hasExtraLeftBrace = characterBefore === '{';

                    if (triggerCharacter.content.length === 1) {
                      return [
                        {
                          changes: [
                            {
                              from: tr.changes.from,
                              to: tr.changes.to,
                              insert: `${hasExtraLeftBrace ? '' : '{'}${
                                tr.changes.insert
                              }}}`,
                            },
                          ],
                          selection: EditorSelection.cursor(
                            tr.cursorPosition + (hasExtraLeftBrace ? 0 : 1),
                          ),
                          userEvent: tr.userEvent,
                          scrollIntoView: true,
                        },
                      ];
                    }

                    return [
                      {
                        changes: [
                          {
                            from: tr.changes.from,
                            to: tr.changes.to,
                            insert: `{${tr.changes.insert}}`,
                          },
                        ],
                        selection: EditorSelection.cursor(
                          tr.cursorPosition + 1,
                        ),
                        userEvent: tr.userEvent,
                        scrollIntoView: true,
                      },
                    ];
                  },
                };
              }
            } else if (
              update.transactions.some(tr => tr.isUserEvent('select'))
            ) {
              this.triggerContext = undefined;
            } else if (
              update.transactions.some(tr => isSkipSelectionChangeUserEvent(tr))
            ) {
              this.triggerContext = undefined;
            } else if (this.triggerContext && update.docChanged) {
              if (!this.triggerContext.validate(update.state)) {
                this.triggerContext = undefined;
              } else {
                const { from } = this.triggerContext;
                const { to } = update.state.selection.main;
                const text = update.state.sliceDoc(from, to);
                this.triggerContext = {
                  ...this.triggerContext,
                  from,
                  to,
                  offset: from - to,
                  text,
                  textBefore: text,
                };
              }
            }

            setTriggerContextRef.current(this.triggerContext);
          }
        },
      ),
    ]);
  }, [injector]);

  return triggerContext;
}

export { useCharacterTriggerContext };
