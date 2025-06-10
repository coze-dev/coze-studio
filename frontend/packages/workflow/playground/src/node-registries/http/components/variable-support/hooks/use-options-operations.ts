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
