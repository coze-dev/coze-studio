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
 
import { useMemo } from 'react';

import { getOptionInfoFromDOM, selectNodeByIndex } from '../utils';
import type { UseOptionsOperationsProps } from '../types';

function useOptionsOperations(props: UseOptionsOperationsProps) {
  const {
    editorRef,
    dropdownContext: { dropdownRef, setActiveOptionHover, variableMenuRef },
    setTreeVisible,
    isInputDropdownOpen,
    applyNode,
  } = props;

  return useMemo(() => {
    function prev() {
      if (variableMenuRef.current) {
        // 操作变量菜单
        const optionsInfo = getOptionInfoFromDOM(
          variableMenuRef.current?.treeContainerRef,
          '.semi-tree-option-list .semi-tree-option',
        );

        if (!optionsInfo) {
          return;
        }

        const { elements, selectedIndex } = optionsInfo;
        if (elements.length === 1) {
          return;
        }

        const newIndex =
          selectedIndex - 1 < 0 ? elements.length - 1 : selectedIndex - 1;
        selectNodeByIndex(elements, newIndex);
        return;
      }
      const optionsInfo = getOptionInfoFromDOM(dropdownRef.current);
      if (!optionsInfo) {
        return;
      }

      const { elements, selectedIndex } = optionsInfo;

      if (elements.length === 1) {
        return;
      }

      const newIndex =
        selectedIndex - 1 < 0 ? elements.length - 1 : selectedIndex - 1;
      selectNodeByIndex(elements, newIndex);
      setActiveOptionHover(newIndex);
    }

    function next() {
      if (variableMenuRef.current) {
        // 操作变量菜单
        const optionsInfo = getOptionInfoFromDOM(
          variableMenuRef.current?.treeContainerRef,
          '.semi-tree-option-list .semi-tree-option',
        );

        if (!optionsInfo) {
          return;
        }

        const { elements, selectedIndex } = optionsInfo;
        const newIndex =
          selectedIndex + 1 >= elements.length ? 0 : selectedIndex + 1;
        selectNodeByIndex(elements, newIndex);
        return;
      }

      const optionsInfo = getOptionInfoFromDOM(dropdownRef.current);
      if (!optionsInfo) {
        return;
      }

      const { elements, selectedIndex } = optionsInfo;

      const newIndex =
        selectedIndex + 1 >= elements.length ? 0 : selectedIndex + 1;
      selectNodeByIndex(elements, newIndex);
      setActiveOptionHover(newIndex);
    }

    function left() {
      // 只要按左键 变量面板就应该关闭
      setTreeVisible(false);
      const optionsInfo = getOptionInfoFromDOM(dropdownRef.current);
      if (!optionsInfo) {
        return;
      }
      setActiveOptionHover(NaN);
    }

    /**
     * 变量面板关闭时直接打开
     */
    function right() {
      if (!variableMenuRef.current) {
        setTreeVisible(true);
      }
      const optionsInfo = getOptionInfoFromDOM(dropdownRef.current);
      if (!optionsInfo) {
        return;
      }
      const { selectedIndex } = optionsInfo;
      setActiveOptionHover(selectedIndex);
    }

    function apply() {
      if (!variableMenuRef.current?.treeRef) {
        return;
      }
      const optionsInfo = getOptionInfoFromDOM(
        variableMenuRef.current?.treeContainerRef,
        '.semi-tree-option-list .semi-tree-option',
      );
      if (!optionsInfo) {
        return;
      }
      const { selectedElement } = optionsInfo;
      const selectedDataKey = selectedElement?.getAttribute('data-key');
      if (!selectedDataKey) {
        return;
      }
      const variableTreeNode =
        variableMenuRef.current?.treeRef?.state?.keyEntities?.[selectedDataKey]
          ?.data;
      if (!variableTreeNode) {
        return;
      }

      applyNode(
        variableTreeNode,
        { type: isInputDropdownOpen ? 'input' : 'update' },
        editorRef,
      );
    }

    return {
      prev,
      next,
      left,
      right,
      apply,
    };
  }, [isInputDropdownOpen, setTreeVisible]);
}

export { useOptionsOperations };
