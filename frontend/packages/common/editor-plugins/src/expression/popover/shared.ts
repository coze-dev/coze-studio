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

import { type EditorAPI as ExpressionEditorAPI } from '@coze-editor/editor/preset-expression';
import { getFlags } from '@coze-arch/bot-flags';
import {
  EditorSelection,
  type EditorState,
  type TransactionSpec,
  type Transaction,
} from '@codemirror/state';

import { ExpressionEditorParserBuiltin } from '../core/parser';
import {
  ExpressionEditorTreeHelper,
  type ExpressionEditorTreeNode,
} from '../core';

import styles from './popover.module.less';

const SKIP_SELECTION_CHANGE_USER_EVENT = 'api.skip-selection-change';
const SELECTED_OPTION_CLASSNAME =
  styles['expression-editor-suggestion-keyboard-selected'];
const SELECTED_OPTION_CLASSNAME_NEW =
  styles['expression-editor-suggestion-keyboard-selected-new'];

const getSelectedClassName = () => {
  const FLAGS = getFlags();
  const isHitLLMPromptSkills = FLAGS?.['bot.automation.llm_prompt_skills'];
  if (isHitLLMPromptSkills) {
    return SELECTED_OPTION_CLASSNAME_NEW;
  }

  return SELECTED_OPTION_CLASSNAME;
};

// modified from:
// file: packages/workflow/components/src/expression-editor/components/suggestion/hooks.ts
// method: computeUIOptions
interface OptionsInfo {
  elements: Element[];
  selectedIndex: number;
  selectedElement?: Element;
}
const getOptionInfoFromDOM = (
  root: Element | null,
): OptionsInfo | undefined => {
  if (!root) {
    return;
  }

  // Get all option elements
  const foundNodes = root.querySelectorAll(
    '.semi-tree-option-list .semi-tree-option',
  );

  if (foundNodes.length === 0) {
    return;
  }

  const optionElements = [...foundNodes];

  // Find the currently highlighted option
  const selectedIndex = optionElements.findIndex(element =>
    element.classList.contains(getSelectedClassName()),
  );

  return {
    elements: optionElements,
    selectedIndex,
    selectedElement: optionElements[selectedIndex],
  };
};

function selectNodeByIndex(elements: Element[], index: number) {
  const newSelectedElement = elements[index];

  if (!newSelectedElement) {
    return;
  }

  // remove old selected class
  elements.forEach(element => {
    if (element.classList.contains(getSelectedClassName())) {
      element.classList.remove(getSelectedClassName());
    }
  });

  newSelectedElement.classList.add(getSelectedClassName());

  newSelectedElement.scrollIntoView({
    behavior: 'smooth',
    block: 'nearest',
  });
}

export type ComposeTransaction = (
  tr: {
    changes: { from: number; to: number; insert: string };
    cursorPosition: number;
    userEvent: string;
  },
  state: EditorState,
) => TransactionSpec[];

interface ApplyNodeOptions {
  from: number;
  to: number;
  textBefore: string;
  composeTransaction?: ComposeTransaction;
}

function isLeafNode(node: ExpressionEditorTreeNode) {
  return !node.children || node.children.length === 0;
}

function applyNode(
  editor: ExpressionEditorAPI | undefined,
  node: ExpressionEditorTreeNode,
  options: ApplyNodeOptions,
) {
  if (!editor) {
    return;
  }

  const { from, to, textBefore, composeTransaction } = options;

  const text = getInsertTextFromNode(node, textBefore);

  if (!text) {
    return;
  }

  const cursorOffset = isLeafNode(node) ? '}}'.length : 0;
  const cursorPosition = from + text.length + cursorOffset;
  const transaction = {
    changes: {
      from,
      to,
      insert: text,
    },
    selection: EditorSelection.cursor(cursorPosition),
    userEvent: SKIP_SELECTION_CHANGE_USER_EVENT,
  };

  let transactions: TransactionSpec[] = [transaction];
  if (typeof composeTransaction === 'function') {
    transactions = composeTransaction(
      {
        changes: transaction.changes,
        userEvent: transaction.userEvent,
        cursorPosition,
      },
      editor.$view.state,
    );
  }

  editor.$view.dispatch(...transactions);
}

function isSkipSelectionChangeUserEvent(tr: Transaction) {
  return tr.isUserEvent(SKIP_SELECTION_CHANGE_USER_EVENT);
}

function getInsertTextFromNode(
  node: ExpressionEditorTreeNode,
  textBefore: string,
) {
  const segments = ExpressionEditorParserBuiltin.toSegments(textBefore) ?? [];
  return ExpressionEditorTreeHelper.concatFullPath({
    node,
    segments,
  });
}

export {
  getOptionInfoFromDOM,
  applyNode,
  selectNodeByIndex,
  isSkipSelectionChangeUserEvent,
};
