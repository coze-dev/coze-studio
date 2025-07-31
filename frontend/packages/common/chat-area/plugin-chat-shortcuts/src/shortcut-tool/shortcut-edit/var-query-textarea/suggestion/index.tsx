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
  type FC,
  type RefObject,
  type ReactNode,
  useState,
  useRef,
} from 'react';

import classNames from 'classnames';
import {
  useListeners,
  useSelectNode,
  useKeyboardSelect,
  useRenderEffect,
  useSuggestionReducer,
  type SelectorBoxConfigEntity,
  type PlaygroundConfigEntity,
  type ExpressionEditorModel,
  type ExpressionEditorTreeNode,
} from '@coze-workflow/sdk';
import { type TreeProps } from '@coze-arch/bot-semi/Tree';
import { type PopoverProps } from '@coze-arch/bot-semi/Popover';
import { Popover, Tree } from '@coze-arch/bot-semi';

import { VarListItem, InputTypeTag } from '../var-list';
import { componentTypeOptionMap } from '../util';
import { type VarTreeNode } from '../type';

import styles from './index.module.less';

interface ExpressionEditorSuggestionProps {
  className?: string;
  model: ExpressionEditorModel;
  containerRef: RefObject<HTMLDivElement>;
  getPopupContainer?: PopoverProps['getPopupContainer'];
  playgroundConfig?: PlaygroundConfigEntity;
  selectorBoxConfig?: SelectorBoxConfigEntity;
  treeProps?: Partial<TreeProps>;
}

/**
 * autoprompt
 */
export const VarExpressionEditorSuggestion: FC<
  ExpressionEditorSuggestionProps
> = props => {
  const {
    model,
    containerRef,
    className,
    playgroundConfig,
    selectorBoxConfig,
    getPopupContainer = () => containerRef.current ?? document.body,
    treeProps = {},
  } = props;
  const suggestionRef = useRef<HTMLDivElement>(null);
  const [searchValue, setSearchValue] = useState('');
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

  const renderLabel = (label?: ReactNode, data?: VarTreeNode) => {
    if (typeof label !== 'string') {
      return null;
    }

    const idx = label.indexOf(searchValue);

    if (idx === -1) {
      return label;
    }

    let tag: string | null = null;

    if (typeof data?.varInputType === 'number') {
      const text = componentTypeOptionMap[data.varInputType]?.label;
      if (text) {
        tag = text;
      }
    }

    return (
      <VarListItem>
        <div>
          {label.substring(0, idx)}
          <span className={styles.highlightLabel}>{searchValue}</span>
          {label.substring(idx + searchValue.length)}
        </div>
        {tag ? <InputTypeTag>{tag}</InputTypeTag> : null}
      </VarListItem>
    );
  };

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
              {...treeProps}
              key={state.key}
              className={classNames(
                styles['expression-editor-suggestion-tree'],
                treeProps.className,
              )}
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
              renderLabel={renderLabel}
              onSearch={inputValue => {
                setSearchValue(inputValue);
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
