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
 
import { type MutableRefObject, useRef } from 'react';

import { last } from 'lodash-es';
import type { WorkflowVariableFacade } from '@coze-workflow/variable/src/core/workflow-variable-facade';
import {
  allGlobalVariableKeys,
  TRANS_WORKFLOW_VARIABLE_SOURCE,
  GlobalVariableKey,
} from '@coze-workflow/variable';
import type { SelectionEnlargerSpec } from '@coze-editor/editor';
import type { EditorState, Transaction } from '@codemirror/state';
import { syntaxTree } from '@codemirror/language';

import type { VariableWithNodeInfo, InputVariableInfo } from './types';
import {
  iconCozWarningCircleFillPaletteSvg,
  iconCozFolderUrlSvg,
  iconCozPeopleUrlSvg,
  iconCozSettingUrlSvg,
} from './constants';

export function findInputVariable(
  availableVariables: VariableWithNodeInfo[],
  fieldPartInfo: {
    nodePart: string;
    globalVariableKey: string;
    /**
     * 流程变量字段名
     */
    fieldPart: string;
    /**
     * 全局变量字段名
     */
    parsedKeyPath: string[];
  },
  matchedVariable?: WorkflowVariableFacade,
): InputVariableInfo {
  const { globalVariableKey, nodePart, fieldPart, parsedKeyPath } =
    fieldPartInfo;
  const isValid = !!matchedVariable;
  const res = {
    iconUrl: '',
    nodeTitle: '',
    isValid,
    globalVariableKey,
    parsedKeyPath: '',
    isVariableExist: false,
  };

  availableVariables.forEach(variable => {
    const nodePartEqual = variable.expressionPath.source === nodePart;
    if ((!res.iconUrl || !res.nodeTitle) && nodePartEqual) {
      res.iconUrl = variable.iconUrl;
      res.nodeTitle = variable.nodeTitle;
      res.isVariableExist = true;
    }

    const curParsedKeyPath = parsedKeyPath?.join('.');

    res.parsedKeyPath = globalVariableKey ? curParsedKeyPath : fieldPart;
  });

  return res;
}

export function getVariableRanges(state: EditorState) {
  const ranges: SelectionEnlargerSpec[] = [];

  const tree = syntaxTree(state);
  const cursor = tree.cursor();

  do {
    if (
      cursor.name === 'Interpolation' &&
      cursor.node.firstChild?.name === '{{' &&
      cursor.node.lastChild?.name === '}}'
    ) {
      const from = cursor.node.firstChild.to;
      const to = cursor.node.lastChild.from;
      const content = state.sliceDoc(from, to);
      let matches = content.match(
        `^(${TRANS_WORKFLOW_VARIABLE_SOURCE}\\d+)\\.?`,
      );
      allGlobalVariableKeys?.forEach((varKey: string) => {
        const globalVariableRegexStr = `^(${varKey})`;
        const curMatch = content.match(globalVariableRegexStr);
        if (curMatch) {
          matches = curMatch;
        }
      });

      if (matches) {
        const { length } = matches[0];

        ranges.push({
          source: {
            from: cursor.from,
            to: from + length,
          },
          target: {
            from: cursor.from,
            to: cursor.to,
          },
        });

        ranges.push({
          source: {
            from: to,
            to: cursor.node.lastChild.to,
          },
          target: {
            from: cursor.from,
            to: cursor.to,
          },
        });
      }
    }
  } while (cursor.next());

  return ranges;
}

/**
 * 将字符串路径转换为键路径数组
 * - 输入: `["Ob+.\".j"]["child"]`
 * - 输出: ['Ob+.".j', 'child']
 */
export function convertStrPathToKeyPath(str: string): string[] {
  // 去除字符串两端的方括号
  str = str.slice(2, -2);
  const parts = str.split('"]["');

  return parts.map(part => `${part}`);
}

const SELECTED_OPTION_CLASSNAME = 'coz-mg-primary';
interface OptionsInfo {
  elements: Element[];
  selectedIndex: number;
  selectedElement?: Element;
}
export function getOptionInfoFromDOM(
  root: Element | null,
  classNames?: string,
): OptionsInfo | undefined {
  if (!root) {
    return;
  }

  // 获取所有的选项元素
  const foundNodes = root.querySelectorAll(classNames ?? '.semi-list-item');

  if (foundNodes.length === 0) {
    return;
  }

  const optionElements = [...foundNodes];

  // 找到当前高亮的选项
  const selectedIndex = optionElements.findIndex(element =>
    element.classList.contains(SELECTED_OPTION_CLASSNAME),
  );

  return {
    elements: optionElements,
    selectedIndex,
    selectedElement: optionElements[selectedIndex],
  };
}

export function selectNodeByIndex(elements: Element[], index: number) {
  const newSelectedElement = elements[index];

  if (!newSelectedElement) {
    return;
  }

  // remove old selected class
  elements.forEach(element => {
    if (element.classList.contains(SELECTED_OPTION_CLASSNAME)) {
      element.classList.remove(SELECTED_OPTION_CLASSNAME);
    }
  });

  newSelectedElement.classList.add(SELECTED_OPTION_CLASSNAME);

  newSelectedElement.scrollIntoView({
    behavior: 'smooth',
    block: 'nearest',
  });
}

export function useLatest<T>(value: T): MutableRefObject<T> {
  const ref = useRef(value);
  ref.current = value;

  return ref;
}

const SKIP_SELECTION_CHANGE_USER_EVENT = 'api.skip-selection-change';

export function isSkipSelectionChangeUserEvent(tr: Transaction) {
  return tr.isUserEvent(SKIP_SELECTION_CHANGE_USER_EVENT);
}

export function getVariableInfoFromExpression(expression: string): {
  nodeId: string;
  nodeName: string;
  /**
   * 包含 . 的变量名，仅用于流程变量
   */
  nodeNameWithDot: string;
  fieldPart: string;
  fieldKeyPath: string[];
  parsedKeyPath: string[];
  globalVariableKey: string;
} {
  let globalVariableKey = '';

  let nodeName = '';
  let nodeNameWithDot = '';
  let fieldPart;
  let fieldKeyPath;
  let parsedKeyPath;

  // block_output_ 为流程变量特化前缀，由 block-output_ 转换来
  let matches = expression.match(
    `^(${TRANS_WORKFLOW_VARIABLE_SOURCE}\\d+)\\.?`,
  );
  // 全局变量格式 {{global_variable_app["aaa"]["bbb"]}}
  allGlobalVariableKeys?.forEach((varKey: string) => {
    const globalVariableRegexStr = `^(${varKey})`;
    const curMatch = expression.match(globalVariableRegexStr);
    if (curMatch) {
      matches = curMatch;
      globalVariableKey = varKey;
    }
  });
  nodeNameWithDot = matches?.[0] as string;
  nodeName = matches?.[1] as string;

  const nodeId = last(nodeName?.split('_')) as string;

  if (matches) {
    fieldPart = expression.slice(nodeNameWithDot.length, expression.length);
    parsedKeyPath = globalVariableKey ? convertStrPathToKeyPath(fieldPart) : [];

    fieldKeyPath = globalVariableKey
      ? [nodeName].concat(parsedKeyPath)
      : [nodeId].concat(fieldPart.split('.'));
  }

  return {
    nodeId,
    nodeName,
    nodeNameWithDot,
    fieldPart,
    fieldKeyPath,
    parsedKeyPath,
    globalVariableKey,
  };
}

export const getIconSvgString = (color = '#080D1E') => ({
  delete: iconCozWarningCircleFillPaletteSvg(color),
  [GlobalVariableKey.App]: iconCozFolderUrlSvg(color),
  [GlobalVariableKey.System]: iconCozPeopleUrlSvg(color),
  [GlobalVariableKey.User]: iconCozSettingUrlSvg(color),
});
