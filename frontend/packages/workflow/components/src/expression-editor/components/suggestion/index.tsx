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

import { type FC, useRef, type RefObject } from 'react';

import classNames from 'classnames';
import { type PopoverProps } from '@coze-arch/bot-semi/Popover';
import { Popover, Tree } from '@coze-arch/bot-semi';
import type { SelectorBoxConfigEntity } from '@flowgram-adapter/free-layout-editor';
import type { PlaygroundConfigEntity } from '@flowgram-adapter/free-layout-editor';

import { type ExpressionEditorTreeNode } from '../../type';
import { type ExpressionEditorModel } from '../../model';
import { useSuggestionReducer } from './state';
import {
  useListeners,
  useSelectNode,
  useKeyboardSelect,
  useRenderEffect,
} from './hooks';

import styles from './index.module.less';

interface ExpressionEditorSuggestionProps {
  className?: string;
  model: ExpressionEditorModel;
  containerRef: RefObject<HTMLDivElement>;
  getPopupContainer?: PopoverProps['getPopupContainer'];
  playgroundConfig?: PlaygroundConfigEntity;
  selectorBoxConfig?: SelectorBoxConfigEntity;
  disabled?: boolean;
}

/**
 * autoprompt
 */
export const ExpressionEditorSuggestion: FC<
  ExpressionEditorSuggestionProps
> = props => {
  const {
    model,
    containerRef,
    className,
    playgroundConfig,
    selectorBoxConfig,
    disabled = false,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    getPopupContainer = () => containerRef.current!,
  } = props;
  const suggestionRef = useRef<HTMLDivElement>(null);
  const treeRef = useRef<Tree>(null);

  const suggestionReducer = useSuggestionReducer({
    model,
    entities: {
      playgroundConfig,
      selectorBoxConfig,
    },
    ref: {
      container: containerRef,
      suggestion: suggestionRef,
      tree: treeRef,
    },
  });
  const [state] = suggestionReducer;
  const selectNode = useSelectNode(suggestionReducer);
  useRenderEffect(suggestionReducer);
  useListeners(suggestionReducer);
  useKeyboardSelect(suggestionReducer, selectNode);

  if (disabled) {
    return <></>;
  }

  return (
    <Popover
      trigger="custom"
      visible={state.visible}
      keepDOM={true}
      getPopupContainer={getPopupContainer}
      content={
        <>
          <div
            className={styles['expression-editor-suggestion-empty']}
            style={{
              display:
                !state.visible || !state.emptyContent ? 'none' : 'inherit',
            }}
          >
            <p>{state.emptyContent}</p>
          </div>
          <div
            className={classNames(
              className,
              styles['expression-editor-suggestion'],
            )}
            ref={suggestionRef}
            style={{
              display:
                !state.visible || state.emptyContent || state.hiddenDOM
                  ? 'none'
                  : 'inherit',
            }}
            onClick={e => {
              e.stopPropagation();
              e.preventDefault();
            }}
          >
            <Tree
              key={state.key}
              className={styles['expression-editor-suggestion-tree']}
              showFilteredOnly
              filterTreeNode
              onChangeWithObject
              ref={treeRef}
              treeData={state.variableTree}
              searchRender={false}
              value={state.selected}
              emptyContent={<></>}
              onSelect={(key, selected, node) => {
                selectNode(node as ExpressionEditorTreeNode);
              }}
            />
          </div>
        </>
      }
    >
      <div
        className={styles['expression-editor-suggestion-pin']}
        style={{
          top: state.rect?.top,
          left: state.rect?.left,
        }}
      />
    </Popover>
  );
};
