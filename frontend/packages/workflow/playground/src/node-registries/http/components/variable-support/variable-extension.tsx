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
 
import { useState, useRef, useCallback, useEffect } from 'react';

import type { WorkflowVariableFacade } from '@coze-workflow/variable/src/core/workflow-variable-facade';
import {
  WORKFLOW_VARIABLE_SOURCE,
  TRANS_WORKFLOW_VARIABLE_SOURCE,
  allGlobalVariableKeys,
} from '@coze-workflow/variable';
import { type ExpressionEditorTreeNode } from '@coze-workflow/components';
import {
  getCurrentMentionReplaceRange,
  Mention,
  PositionMirror,
  useEditor,
} from '@coze-editor/editor/react';
import { type EditorAPI } from '@coze-editor/editor/preset-universal';
import { Completion } from '@coze-common/editor-plugins/expression';
import { I18n } from '@coze-arch/i18n';
import type { TreeNodeData } from '@coze-arch/bot-semi/Tree';
import { Dropdown, Toast, type Tree } from '@coze-arch/coze-design';
import type { EditorState } from '@codemirror/state';

import { SelectType } from '@/form-extensions/components/tree-variable-selector/types';
import CompositeSelectTreePanel from '@/form-extensions/components/tree-variable-selector/composite-select-tree-panel';

import { useLatest } from './utils';
import type { ApplyNodeType, VariableWithNodeInfo } from './types';
import { useInterpolationContent } from './hooks/use-interpolation-content';
import { useSelection, useKeyboardActions, useVariableInjector } from './hooks';
import { DropdownType } from './constants';

const DEFAULT_MIN_WIDTH = 206;

interface VariableExtensionProps {
  availableVariables: VariableWithNodeInfo[];
  getVariableByKeyPath: (
    keyPath: string[],
  ) => WorkflowVariableFacade | undefined;
  variableDataSource?: TreeNodeData[];
  readonly?: boolean;
  variableTree?: ExpressionEditorTreeNode[];
  isDarkTheme?: boolean;
  languageId?: string;
}

const DROPDOWN_CLASS = 'tree-variable-selector-dropdown';

/**
 * wrokflow 变量扩展插件
 * - 支持流程变量 + 全局变量
 */
export function VariableExtension({
  readonly,
  availableVariables,
  variableDataSource,
  getVariableByKeyPath,
  variableTree,
  isDarkTheme,
  languageId,
}: VariableExtensionProps) {
  const editor = useEditor<EditorAPI>();
  const [pos, setPos] = useState(-1); // 当前光标位置
  const [posKey, setPosKey] = useState('');

  const inputDropdownRef = useRef(null);
  const inputTreeRef = useRef(null);

  const updateDropdownRef = useRef<HTMLDivElement>(null);
  const updateTreeRef = useRef<{
    treeRef: Tree;
    treeContainerRef: HTMLDivElement;
  }>(null);

  const editorRef = useLatest(editor);
  const selection = useSelection(editor);
  const interpolationContent = useInterpolationContent(
    editor,
    selection?.anchor,
  );

  // 控制输入提示框的显隐
  const [inputDropdownOpen, setInputOpen] = useState(false);
  // 控制编辑变量提示框的显隐
  const [updateDropdownOpen, setUpdateOpen] = useState(false);
  // 当前提示面板的打开方式
  const [dropdownType, setDropdownType] = useState(DropdownType.Input);
  const isInputDropdownOpen = dropdownType === DropdownType.Input;
  const updateRange = useRef({
    from: 0,
    to: 0,
  });

  const dropDownVisible = updateDropdownOpen || inputDropdownOpen;

  // 变量插入逻辑
  useVariableInjector({
    availableVariables,
    openUpdateDropdown: () => {
      if (variableDataSource?.length && !readonly) {
        // 变量为空时不打开
        setUpdateOpen(true);
      }
      setDropdownType(DropdownType.Update);
    },
    updateRange,
    setPos,
    readonly,
    isDarkTheme,
    languageId,
  });

  const [activeOption, setActiveOption] = useState<string | undefined>('');
  const [treeVisible, setTreeVisible] = useState(false);

  useEffect(() => {
    if (!dropDownVisible) {
      setActiveOption('');
    }
  }, [dropDownVisible]);

  // 替换选中变量
  const handleSelect: ApplyNodeType = (
    data,
    { type, customRange },
    curEditorRef,
  ) => {
    const curEditor = editor ?? curEditorRef?.current;
    if (!curEditor) {
      return;
    }
    const variable = getVariableByKeyPath(data?.path ?? []);
    if (!variable?.expressionPath) {
      Toast.error(I18n.t('node_http_var_infer_delete', {}, '变量失效'));
      return;
    }
    curEditor.focus();
    const { expressionPath: curExpressionPath } = variable;
    const globalVariableKey =
      curExpressionPath.source !== WORKFLOW_VARIABLE_SOURCE;
    let textContent = '';
    if (globalVariableKey) {
      // keyPath 已经包含了 source
      textContent =
        curExpressionPath.keyPath?.reduce((pre, cur) => {
          if (pre) {
            return `${pre}["${cur}"]`;
          }
          return cur;
        }, '') ?? '';
    } else {
      textContent =
        TRANS_WORKFLOW_VARIABLE_SOURCE +
        (curExpressionPath.keyPath?.join('.') ?? '');
    }

    // 下次打开菜单，变量面板不应该自动展开
    setTreeVisible(false);
    if (type === 'input') {
      const range =
        customRange ?? getCurrentMentionReplaceRange(curEditor.$view.state);
      if (!range) {
        return;
      }
      curEditor.replaceText({
        ...range,
        text: `{{${textContent}}}`,
      });
    } else {
      curEditor.replaceText({
        ...updateRange.current,
        text: `{{${textContent}}}`,
      });
      setUpdateOpen(false);
    }
  };

  useKeyboardActions({
    dropDownVisible,
    editorRef,
    interpolationContent,
    dropdownRef: isInputDropdownOpen ? inputDropdownRef : updateDropdownRef,
    variableMenuRef: isInputDropdownOpen ? inputTreeRef : updateTreeRef,
    openMenu: isInputDropdownOpen ? setInputOpen : setUpdateOpen,
    setActiveOptionHover: (index: number) => {
      setActiveOption(variableDataSource?.[index]?.value as string);
    },
    setTreeVisible,
    isInputDropdownOpen,
    applyNode: handleSelect,
  });

  const handleOptionHover = useCallback(
    (option: TreeNodeData) => {
      setActiveOption(option?.value as string);
    },
    [setActiveOption],
  );

  const customInterpolationRule = (content?: string, textBefore?: string) => {
    let isInVariableString = false;
    allGlobalVariableKeys?.forEach(key => {
      if (content?.startsWith(key) && textBefore !== key) {
        isInVariableString = true;
      }
    });
    if (!isInVariableString) {
      const regex = new RegExp(
        `${TRANS_WORKFLOW_VARIABLE_SOURCE}(\\d+)\\.(?!\\S)`,
      );
      const isFieldPartEmpty = textBefore?.match(regex);

      isInVariableString = Boolean(
        content?.startsWith(TRANS_WORKFLOW_VARIABLE_SOURCE) &&
          !isFieldPartEmpty,
      );
    }
    return isInVariableString;
  };

  const handleOnClickOutSide = e => {
    if (!updateDropdownRef.current) {
      return;
    }
    if (
      updateTreeRef.current?.treeContainerRef?.contains?.(
        e?.target as HTMLElement,
      )
    ) {
      return;
    }
    setUpdateOpen(false);
    // 意外关闭后，下次变量面板不应该自动展开
    setTreeVisible(false);
  };

  return (
    <div>
      <Dropdown
        trigger="custom"
        visible={inputDropdownOpen}
        rePosKey={posKey}
        motion={false}
        position="bottom"
        className={`overflow-visible ${DROPDOWN_CLASS}`}
        style={{
          minWidth: DEFAULT_MIN_WIDTH,
        }}
        render={
          <div onMouseDown={e => e.preventDefault()} ref={inputDropdownRef}>
            <CompositeSelectTreePanel
              ref={inputTreeRef}
              treeData={variableDataSource}
              activeOption={activeOption}
              onSelect={(data, selectType) => {
                if (selectType === SelectType.Option) {
                  return;
                }
                handleSelect(data as TreeNodeData, { type: 'input' });
              }}
              onOptionHover={handleOptionHover}
              controlledActive={treeVisible}
              getOptionPopupContainer={() =>
                (document.querySelector(`.${DROPDOWN_CLASS}`) as HTMLElement) ||
                document.body
              }
            />
          </div>
        }
        getPopupContainer={() => document.body}
      >
        <PositionMirror
          position={pos - 1}
          onChange={() => setPosKey(String(Math.random()))}
        />
      </Dropdown>
      <Dropdown
        trigger="custom"
        visible={updateDropdownOpen}
        motion={false}
        rePosKey={posKey}
        position="bottom"
        className={`overflow-visible ${DROPDOWN_CLASS}`}
        onClickOutSide={handleOnClickOutSide}
        style={{
          minWidth: DEFAULT_MIN_WIDTH,
        }}
        render={
          <div onMouseDown={e => e.preventDefault()} ref={updateDropdownRef}>
            <CompositeSelectTreePanel
              ref={updateTreeRef}
              treeData={variableDataSource}
              activeOption={activeOption}
              onSelect={(data, selectType) => {
                if (selectType === SelectType.Option) {
                  return;
                }
                handleSelect(data as TreeNodeData, { type: 'update' });
              }}
              onOptionHover={handleOptionHover}
              controlledActive={treeVisible}
              getOptionPopupContainer={() =>
                (document.querySelector(`.${DROPDOWN_CLASS}`) as HTMLElement) ||
                document.body
              }
            />
          </div>
        }
        getPopupContainer={() => document.body}
      >
        <PositionMirror
          position={pos - 1}
          onChange={() => setPosKey(String(Math.random()))}
        />
      </Dropdown>
      <Completion
        disabled={dropDownVisible}
        disableUpdateTrigger
        variableTree={variableTree ?? []}
        customApplyNode={(node, context) => {
          handleSelect(
            { path: (node?.value as string)?.split('.') },
            {
              type: 'input',
              customRange: {
                // 补充双花括号位置
                from: context.from - 2,
                to: context.to + 2,
              },
            },
          );
        }}
        customInterpolationRule={customInterpolationRule}
      />

      <Mention
        triggerCharacters={['{', '{}']}
        onOpenChange={({
          value,
          state,
        }: {
          value: boolean;
          state: EditorState;
        }) => {
          const curPos = state.selection.main.head;
          if (variableDataSource?.length && !readonly) {
            // 变量为空时不打开
            setInputOpen(value);
          }
          setPos(curPos);
          if (value) {
            setDropdownType(DropdownType.Input);
          }
        }}
      />
    </div>
  );
}
