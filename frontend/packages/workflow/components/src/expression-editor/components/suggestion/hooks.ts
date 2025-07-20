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
 
/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable max-lines */

import { useCallback, useEffect } from 'react';

import { ReactEditor } from 'slate-react';
import { Range, type Selection, Transforms } from 'slate';
import { I18n } from '@coze-arch/i18n';

import type {
  ExpressionEditorEventParams,
  ExpressionEditorParseData,
  ExpressionEditorTreeNode,
} from '../../type';
import { ExpressionEditorTreeHelper } from '../../tree-helper';
import { ExpressionEditorParser } from '../../parser';
import type { ExpressionEditorModel } from '../../model';
import {
  ExpressionEditorEvent,
  ExpressionEditorSegmentType,
  ExpressionEditorToken,
} from '../../constant';
import {
  type SuggestionReducer,
  SuggestionActionType,
  type SuggestionState,
} from './type';

import styles from './index.module.less';

/** 内置函数 */
namespace SuggestionViewUtils {
  /** 编辑器选中事件处理 */
  export const editorSelectHandler = (params: {
    reducer: SuggestionReducer;
    payload: ExpressionEditorEventParams<ExpressionEditorEvent.Select>;
  }) => {
    const { reducer, payload } = params;
    const [state, dispatch] = reducer;

    // 设置解析数据
    const parseData = ExpressionEditorParser.parse({
      lineContent: payload.content,
      lineOffset: payload.offset,
    });
    if (!parseData) {
      dispatch({
        type: SuggestionActionType.ClearParseDataAndEditorPath,
      });
      dispatch({
        type: SuggestionActionType.SetVisible,
        payload: false,
      });
      dispatch({
        type: SuggestionActionType.SetRect,
        payload: undefined,
      });
      return;
    }

    dispatch({
      type: SuggestionActionType.SetParseDataAndEditorPath,
      payload: {
        parseData,
        editorPath: payload.path,
      },
    });

    // 重置UI组件内部状态
    const shouldRefresh = parseData.content.reachable === '';
    if (shouldRefresh) {
      dispatch({
        type: SuggestionActionType.Refresh,
      });
    }

    // 设置选中值
    const selected = SuggestionViewUtils.computeSelected({
      model: state.model,
      parseData,
    });
    dispatch({
      type: SuggestionActionType.SetSelected,
      payload: selected,
    });

    // 设置可见变量树
    const variableTree = SuggestionViewUtils.computeVariableTree({
      model: state.model,
      parseData,
    });
    dispatch({
      type: SuggestionActionType.SetVariableTree,
      payload: variableTree,
    });

    // 设置匹配树枝
    const matchTreeBranch: ExpressionEditorTreeNode[] | undefined =
      ExpressionEditorTreeHelper.matchTreeBranch({
        tree: state.model.variableTree,
        segments: parseData.segments.reachable,
      });
    dispatch({
      type: SuggestionActionType.SetMatchTreeBranch,
      payload: matchTreeBranch,
    });

    // 设置空内容
    const emptyContent = SuggestionViewUtils.computeEmptyContent({
      parseData,
      fullVariableTree: state.model.variableTree,
      variableTree,
      matchTreeBranch,
    });
    dispatch({
      type: SuggestionActionType.SetEmptyContent,
      payload: emptyContent,
    });

    // 设置UI相对坐标
    const rect = SuggestionViewUtils.computeRect(state);
    dispatch({
      type: SuggestionActionType.SetRect,
      payload: rect,
    });
    if (!rect) {
      dispatch({
        type: SuggestionActionType.ClearParseDataAndEditorPath,
      });
      return;
    }

    // FIXME: 设置搜索值，很hack的逻辑，后面建议重构不用semi组件，自己写一个
    if (!state.ref.tree.current) {
      // 不设为可见获取不到ref
      dispatch({
        type: SuggestionActionType.SetVisible,
        payload: true,
      });
    }

    dispatch({
      type: SuggestionActionType.SearchEffectStart,
    });
  };

  export const getFinalScale = (state: SuggestionState): number => {
    if (state.entities.playgroundConfig) {
      return state.entities.playgroundConfig.finalScale;
    }
    return 1;
  };

  /** 计算可见时相对父容器坐标 */
  export const computeRect = (
    state: SuggestionState,
  ):
    | {
        top: number;
        left: number;
      }
    | undefined => {
    const borderTopOffset = 5;
    const containerRect = state.ref.container.current?.getBoundingClientRect();
    if (!state.model.editor.selection || !containerRect) {
      return;
    }
    try {
      const rect = ReactEditor.toDOMRange(
        state.model.editor,
        state.model.editor.selection,
      ).getBoundingClientRect();
      return {
        top:
          (rect.top - containerRect.top) / getFinalScale(state) +
          borderTopOffset,
        left: (rect.left - containerRect.left) / getFinalScale(state),
      };
    } catch (e) {
      // slate DOM 计算报错可忽略
      return;
    }
  };

  /** 计算当前选中变量 */
  export const computeSelected = (params: {
    model: ExpressionEditorModel;
    parseData: ExpressionEditorParseData;
  }): ExpressionEditorTreeNode | undefined => {
    const { model, parseData } = params;
    if (!parseData?.segments.inline) {
      return;
    }
    const treeBrach = ExpressionEditorTreeHelper.matchTreeBranch({
      tree: model.variableTree,
      segments: parseData.segments.inline,
    });
    if (!treeBrach) {
      return;
    }
    return treeBrach[treeBrach.length - 1];
  };

  /** 计算当前搜索值 */
  export const computeSearch = (
    parseData: ExpressionEditorParseData,
  ): string => {
    if (!parseData) {
      return '';
    }
    const segments = parseData.segments.reachable;
    const lastSegment =
      segments[segments.length - 1].type ===
      ExpressionEditorSegmentType.ArrayIndex
        ? segments[segments.length - 2] // 数组索引属于上一层级，需要去除防止影响到搜索值
        : segments[segments.length - 1];
    if (
      !lastSegment ||
      lastSegment.type !== ExpressionEditorSegmentType.ObjectKey
    ) {
      return '';
    }
    return lastSegment.objectKey;
  };

  /** 计算裁剪层级的变量树 */
  export const computeVariableTree = (params: {
    model: ExpressionEditorModel;
    parseData: ExpressionEditorParseData;
  }): ExpressionEditorTreeNode[] => {
    const { model, parseData } = params;
    if (!parseData?.segments.reachable) {
      return [];
    }
    const prunedVariableTree = ExpressionEditorTreeHelper.pruning({
      tree: model.variableTree,
      segments: parseData.segments.reachable,
    });
    return prunedVariableTree;
  };

  export const computeEmptyContent = (params: {
    parseData: ExpressionEditorParseData;
    fullVariableTree: ExpressionEditorTreeNode[];
    variableTree: ExpressionEditorTreeNode[];
    matchTreeBranch: ExpressionEditorTreeNode[] | undefined;
  }): string | undefined => {
    const { parseData, fullVariableTree, variableTree, matchTreeBranch } =
      params;
    if (
      !fullVariableTree ||
      !Array.isArray(fullVariableTree) ||
      fullVariableTree.length === 0
    ) {
      if (parseData.content.reachable === '') {
        return I18n.t('workflow_variable_refer_no_input');
      }
      return;
    }
    if (
      !variableTree ||
      !Array.isArray(variableTree) ||
      variableTree.length === 0
    ) {
      if (parseData.content.inline === '') {
        return I18n.t('workflow_variable_refer_no_input');
      }
      if (matchTreeBranch && matchTreeBranch.length !== 0) {
        return I18n.t('workflow_variable_refer_no_sub_variable');
      }
      return;
    }
    return;
  };

  export const keyboardSelectedClassName = () =>
    styles['expression-editor-suggestion-keyboard-selected'];

  /** 将选中项设为高亮 */
  export const setUIOptionSelected = (uiOption: Element): void => {
    if (
      !uiOption?.classList?.add ||
      !uiOption?.classList?.contains ||
      uiOption.classList.contains('semi-tree-option-empty')
    ) {
      return;
    }
    uiOption.classList.add(SuggestionViewUtils.keyboardSelectedClassName());
  };

  /** 获取所有选项UI元素 */
  export const computeUIOptions = (
    state: SuggestionState,
  ):
    | {
        optionList: Element[];
        selectedIndex: number;
        selectedOption?: Element;
      }
    | undefined => {
    // 获取所有的选项元素
    const optionListDom =
      state.ref.suggestion.current?.children?.[0]?.children?.[1]?.children;
    if (!optionListDom) {
      return;
    }
    const optionList = Array.from(optionListDom);
    // 找到当前高亮的选项
    const selectedIndex = optionList.findIndex(element =>
      element.classList.contains(keyboardSelectedClassName()),
    );
    return {
      optionList,
      selectedIndex,
      selectedOption: optionList[selectedIndex],
    };
  };

  /** 禁止变更 visible 防止 ui 抖动 */
  export const preventVisibleJitter = (
    reducer: SuggestionReducer,
    time = 150,
  ) => {
    const [state, dispatch] = reducer;
    if (!state.allowVisibleChange) {
      return;
    }
    dispatch({
      type: SuggestionActionType.SetAllowVisibleChange,
      payload: false,
    });
    setTimeout(() => {
      dispatch({
        type: SuggestionActionType.SetAllowVisibleChange,
        payload: true,
      });
    }, time);
  };

  /** 清空键盘UI选项 */
  export const clearSelectedUIOption = (state: SuggestionState) => {
    const uiOptions = SuggestionViewUtils.computeUIOptions(state);
    if (uiOptions?.selectedOption) {
      // 清空键盘选中状态
      uiOptions.selectedOption.classList.remove(
        SuggestionViewUtils.keyboardSelectedClassName(),
      );
    }
  };

  /** 默认键盘UI选项为第一项 */
  export const selectFirstUIOption = (state: SuggestionState) => {
    const uiOptions = SuggestionViewUtils.computeUIOptions(state);
    if (!uiOptions?.optionList) {
      return;
    }
    clearSelectedUIOption(state);
    if (!uiOptions?.optionList?.[0]?.classList?.add) {
      return;
    }
    // 默认首项高亮
    SuggestionViewUtils.setUIOptionSelected(uiOptions.optionList[0]);
  };
}

/** 选中节点 */
export const useSelectNode = (reducer: SuggestionReducer) => {
  const [state] = reducer;
  return useCallback(
    (node: ExpressionEditorTreeNode) => {
      const fullPath: string = ExpressionEditorTreeHelper.concatFullPath({
        node,
        segments: state.parseData?.segments.reachable ?? [],
      });
      if (!state.parseData || !state.editorPath) {
        return;
      }
      const selection: Selection = {
        anchor: {
          path: state.editorPath,
          offset: state.parseData.offset.lastStart - 1,
        },
        focus: {
          path: state.editorPath,
          offset: state.parseData.offset.firstEnd + 2,
        },
      };
      const insertText = `${ExpressionEditorToken.FullStart}${fullPath}${ExpressionEditorToken.FullEnd}`;
      // 替换文本
      Transforms.insertText(state.model.editor, insertText, {
        at: selection,
      });
    },
    [state],
  );
};

/** 挂载监听器 */
export const useListeners = (reducer: SuggestionReducer) => {
  const [state, dispatch] = reducer;

  useEffect(() => {
    // 挂载监听: 鼠标点击事件
    const mouseHandler = (e: MouseEvent) => {
      if (!state.visible || !state.ref.suggestion.current) {
        return;
      }
      if (state.ref.suggestion.current?.contains(e.target as Node)) {
        return;
      }
      dispatch({
        type: SuggestionActionType.SetVisible,
        payload: false,
      });
      dispatch({
        type: SuggestionActionType.SetRect,
        payload: undefined,
      });
    };
    window.addEventListener('mousedown', mouseHandler);
    const mouseDisposer = () => {
      window.removeEventListener('mousedown', mouseHandler);
    };
    return () => {
      // 销毁时卸载监听器防止内存泄露
      mouseDisposer();
    };
  }, [state]);

  useEffect(() => {
    // 挂载监听: 编辑器选择事件
    const editorSelectDisposer = state.model.on<ExpressionEditorEvent.Select>(
      ExpressionEditorEvent.Select,
      payload =>
        SuggestionViewUtils.editorSelectHandler({
          reducer,
          payload,
        }),
    );
    return () => {
      // 销毁时卸载监听器防止内存泄露
      editorSelectDisposer();
    };
  }, []);

  useEffect(() => {
    // 挂载监听: 编辑器拼音输入事件
    const compositionStartDisposer =
      state.model.on<ExpressionEditorEvent.CompositionStart>(
        ExpressionEditorEvent.CompositionStart,
        payload =>
          dispatch({
            type: SuggestionActionType.SetVisible,
            payload: false,
          }),
      );
    return () => {
      // 销毁时卸载监听器防止内存泄露
      compositionStartDisposer();
    };
  }, []);

  useEffect(() => {
    // 初始化前首次渲染激活DOM
    if (state.initialized) {
      return;
    }
    dispatch({
      type: SuggestionActionType.SetVisible,
      payload: false,
    });
  }, []);

  useEffect(() => {
    // 初始化前监听到DOM激活后隐藏
    if (state.initialized || state.visible) {
      return;
    }
    dispatch({
      type: SuggestionActionType.SetHiddenDOM,
      payload: false,
    });
    dispatch({
      type: SuggestionActionType.SetInitialized,
    });
  }, [state]);
};

/** 键盘上下回车键选中节点 */
export const useKeyboardSelect = (
  reducer: SuggestionReducer,
  selectNode: (node: ExpressionEditorTreeNode) => void,
) => {
  const [state, dispatch] = reducer;

  // 键盘上下
  useEffect(() => {
    const keyboardArrowHandler = event => {
      if (
        !state.visible ||
        !state.ref.suggestion.current ||
        !['ArrowDown', 'ArrowUp'].includes(event.key)
      ) {
        return;
      }
      const uiOptions = SuggestionViewUtils.computeUIOptions(state);
      if (!uiOptions) {
        return;
      }
      const { optionList, selectedIndex } = uiOptions;
      if (optionList.length === 1) {
        // 仅有一项可选项的时候不做处理
        return;
      }
      event.preventDefault();
      let newIndex = selectedIndex;
      if (event.key === 'ArrowDown') {
        // 如果当前没有高亮的选项或者是最后一个选项，则高亮第一个选项
        newIndex =
          selectedIndex === -1 || selectedIndex === optionList.length - 1
            ? 0
            : selectedIndex + 1;
      } else if (event.key === 'ArrowUp') {
        // 如果当前没有高亮的选项或者是第一个选项，则高亮最后一个选项
        newIndex =
          selectedIndex <= 0 ? optionList.length - 1 : selectedIndex - 1;
      }
      const selectedOption = optionList[newIndex];
      // 更新高亮选项
      if (selectedIndex !== -1) {
        optionList[selectedIndex].classList.remove(
          SuggestionViewUtils.keyboardSelectedClassName(),
        );
      }
      SuggestionViewUtils.setUIOptionSelected(selectedOption);
      // 将新选中的选项滚动到视图中
      selectedOption.scrollIntoView({
        behavior: 'smooth', // 平滑滚动
        block: 'nearest', // 最接近的视图边界，可能是顶部或底部
      });
    };
    document.addEventListener('keydown', keyboardArrowHandler);
    return () => {
      document.removeEventListener('keydown', keyboardArrowHandler);
    };
  }, [state]);

  // 键盘回车
  useEffect(() => {
    const keyboardEnterHandler = event => {
      if (
        !state.visible ||
        !state.ref.suggestion.current ||
        event.key !== 'Enter'
      ) {
        return;
      }
      const uiOptions = SuggestionViewUtils.computeUIOptions(state);
      if (!uiOptions?.selectedOption) {
        return;
      }
      const { selectedOption } = uiOptions;
      const selectedDataKey = selectedOption.getAttribute('data-key');
      if (!selectedDataKey) {
        return;
      }
      const variableTreeNode =
        state.ref.tree.current?.state?.keyEntities?.[selectedDataKey]?.data;
      if (!variableTreeNode) {
        return;
      }
      event.preventDefault();
      dispatch({
        type: SuggestionActionType.SetVisible,
        payload: false,
      });
      selectNode(variableTreeNode as ExpressionEditorTreeNode);
      if (
        !variableTreeNode.variable?.children ||
        variableTreeNode.variable?.children.length === 0
      ) {
        // 叶子节点
        return;
      }
      // 非叶子节点，光标向前移动两格
      const { selection } = state.model.editor;
      if (selection && Range.isCollapsed(selection)) {
        // 向前移动两个字符的光标
        Transforms.move(state.model.editor, { distance: 2, reverse: true });
      }
      SuggestionViewUtils.preventVisibleJitter(reducer);
    };
    document.addEventListener('keydown', keyboardEnterHandler);
    return () => {
      document.removeEventListener('keydown', keyboardEnterHandler);
    };
  }, [state]);

  // 键盘 ESC 取消弹窗
  useEffect(() => {
    const keyboardESCHandler = event => {
      if (
        !state.visible ||
        !state.ref.suggestion.current ||
        event.key !== 'Escape'
      ) {
        return;
      }
      event.preventDefault();
      dispatch({
        type: SuggestionActionType.SetVisible,
        payload: false,
      });
    };
    document.addEventListener('keydown', keyboardESCHandler);
    return () => {
      document.removeEventListener('keydown', keyboardESCHandler);
    };
  }, [state]);

  // 默认选中首项
  useEffect(() => {
    SuggestionViewUtils.selectFirstUIOption(state);
  }, [state]);
};

/** 等待semi组件数据更新后的副作用 */
export const useRenderEffect = (reducer: SuggestionReducer) => {
  const [state, dispatch] = reducer;

  // 组件树状数据更新后设置搜索值
  useEffect(() => {
    if (!state.renderEffect.search || !state.parseData) {
      return;
    }
    dispatch({
      type: SuggestionActionType.SearchEffectEnd,
    });
    const searchValue = SuggestionViewUtils.computeSearch(state.parseData);
    state.ref.tree.current?.search(searchValue);
    if (!searchValue && state.matchTreeBranch) {
      dispatch({
        type: SuggestionActionType.SetVisible,
        payload: true,
      });
      return;
    }
    dispatch({
      type: SuggestionActionType.FilteredEffectStart,
    });
  }, [state]);

  // 搜索过滤后是否为空
  useEffect(() => {
    if (!state.renderEffect.filtered) {
      return;
    }
    dispatch({
      type: SuggestionActionType.FilteredEffectEnd,
    });
    const filteredKeys = Array.from(
      state.ref.tree.current?.state.filteredKeys || [],
    );
    if (!state.emptyContent && filteredKeys.length === 0) {
      dispatch({
        type: SuggestionActionType.SetVisible,
        payload: false,
      });
      return;
    }
    dispatch({
      type: SuggestionActionType.SetVisible,
      payload: true,
    });
  }, [state]);
};
