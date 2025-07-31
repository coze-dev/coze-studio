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

/** built-in function */
namespace SuggestionViewUtils {
  /** Editor selected event handling */
  export const editorSelectHandler = (params: {
    reducer: SuggestionReducer;
    payload: ExpressionEditorEventParams<ExpressionEditorEvent.Select>;
  }) => {
    const { reducer, payload } = params;
    const [state, dispatch] = reducer;

    // Set up parse data
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

    // Reset UI component internal state
    const shouldRefresh = parseData.content.reachable === '';
    if (shouldRefresh) {
      dispatch({
        type: SuggestionActionType.Refresh,
      });
    }

    // Set the selected value
    const selected = SuggestionViewUtils.computeSelected({
      model: state.model,
      parseData,
    });
    dispatch({
      type: SuggestionActionType.SetSelected,
      payload: selected,
    });

    // Set the visible variable tree
    const variableTree = SuggestionViewUtils.computeVariableTree({
      model: state.model,
      parseData,
    });
    dispatch({
      type: SuggestionActionType.SetVariableTree,
      payload: variableTree,
    });

    // Set matching branches
    const matchTreeBranch: ExpressionEditorTreeNode[] | undefined =
      ExpressionEditorTreeHelper.matchTreeBranch({
        tree: state.model.variableTree,
        segments: parseData.segments.reachable,
      });
    dispatch({
      type: SuggestionActionType.SetMatchTreeBranch,
      payload: matchTreeBranch,
    });

    // Set empty content
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

    // Set UI relative coordinates
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

    // FIXME: Set the search value, very hacked logic. Later, it is recommended to refactor without semi components, and write one yourself.
    if (!state.ref.tree.current) {
      // Not set to visible can't get ref
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

  /** Calculate relative parent container coordinates when visible */
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
      // Slate DOM calculation error can be ignored
      return;
    }
  };

  /** Calculate the currently selected variable */
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

  /** Calculate the current search value */
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
        ? segments[segments.length - 2] // The array index belongs to the previous level and needs to be removed to prevent it from affecting the search value
        : segments[segments.length - 1];
    if (
      !lastSegment ||
      lastSegment.type !== ExpressionEditorSegmentType.ObjectKey
    ) {
      return '';
    }
    return lastSegment.objectKey;
  };

  /** Calculate the variable tree of the clipping level */
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

  /** Highlight the selected item */
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

  /** Get all options UI elements */
  export const computeUIOptions = (
    state: SuggestionState,
  ):
    | {
        optionList: Element[];
        selectedIndex: number;
        selectedOption?: Element;
      }
    | undefined => {
    // Get all option elements
    const optionListDom =
      state.ref.suggestion.current?.children?.[0]?.children?.[1]?.children;
    if (!optionListDom) {
      return;
    }
    const optionList = Array.from(optionListDom);
    // Find the currently highlighted option
    const selectedIndex = optionList.findIndex(element =>
      element.classList.contains(keyboardSelectedClassName()),
    );
    return {
      optionList,
      selectedIndex,
      selectedOption: optionList[selectedIndex],
    };
  };

  /** Disable visible changes Prevent UI jitter */
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

  /** Clear keyboard UI options */
  export const clearSelectedUIOption = (state: SuggestionState) => {
    const uiOptions = SuggestionViewUtils.computeUIOptions(state);
    if (uiOptions?.selectedOption) {
      // Clear keyboard selection
      uiOptions.selectedOption.classList.remove(
        SuggestionViewUtils.keyboardSelectedClassName(),
      );
    }
  };

  /** The default keyboard UI option is the first item */
  export const selectFirstUIOption = (state: SuggestionState) => {
    const uiOptions = SuggestionViewUtils.computeUIOptions(state);
    if (!uiOptions?.optionList) {
      return;
    }
    clearSelectedUIOption(state);
    if (!uiOptions?.optionList?.[0]?.classList?.add) {
      return;
    }
    // Default first item highlighting
    SuggestionViewUtils.setUIOptionSelected(uiOptions.optionList[0]);
  };
}

/** selected node */
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
      // replacement text
      Transforms.insertText(state.model.editor, insertText, {
        at: selection,
      });
    },
    [state],
  );
};

/** mount the listener */
export const useListeners = (reducer: SuggestionReducer) => {
  const [state, dispatch] = reducer;

  useEffect(() => {
    // Mount Listening: Mouse Click Events
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
      // Prevent memory leaks by uninstalling listeners when destroyed
      mouseDisposer();
    };
  }, [state]);

  useEffect(() => {
    // Mount Listening: Editor Selection Event
    const editorSelectDisposer = state.model.on<ExpressionEditorEvent.Select>(
      ExpressionEditorEvent.Select,
      payload =>
        SuggestionViewUtils.editorSelectHandler({
          reducer,
          payload,
        }),
    );
    return () => {
      // Prevent memory leaks by uninstalling listeners when destroyed
      editorSelectDisposer();
    };
  }, []);

  useEffect(() => {
    // Mount Monitor: Editor Pinyin Input Event
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
      // Prevent memory leaks by uninstalling listeners when destroyed
      compositionStartDisposer();
    };
  }, []);

  useEffect(() => {
    // First render activation DOM before initialization
    if (state.initialized) {
      return;
    }
    dispatch({
      type: SuggestionActionType.SetVisible,
      payload: false,
    });
  }, []);

  useEffect(() => {
    // Listen to DOM activation before initialization and hide after activation
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

/** Keyboard Enter up and down to select the node */
export const useKeyboardSelect = (
  reducer: SuggestionReducer,
  selectNode: (node: ExpressionEditorTreeNode) => void,
) => {
  const [state, dispatch] = reducer;

  // Keyboard up and down
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
        // Do not deal with when there is only one option
        return;
      }
      event.preventDefault();
      let newIndex = selectedIndex;
      if (event.key === 'ArrowDown') {
        // If there is currently no highlighted option or the last option, highlight the first option
        newIndex =
          selectedIndex === -1 || selectedIndex === optionList.length - 1
            ? 0
            : selectedIndex + 1;
      } else if (event.key === 'ArrowUp') {
        // If there is currently no highlighted option or the first option, highlight the last option
        newIndex =
          selectedIndex <= 0 ? optionList.length - 1 : selectedIndex - 1;
      }
      const selectedOption = optionList[newIndex];
      // Update highlighting options
      if (selectedIndex !== -1) {
        optionList[selectedIndex].classList.remove(
          SuggestionViewUtils.keyboardSelectedClassName(),
        );
      }
      SuggestionViewUtils.setUIOptionSelected(selectedOption);
      // Scroll the newly selected option into view
      selectedOption.scrollIntoView({
        behavior: 'smooth', // Smooth scrolling
        block: 'nearest', // The closest view boundary, possibly the top or bottom
      });
    };
    document.addEventListener('keydown', keyboardArrowHandler);
    return () => {
      document.removeEventListener('keydown', keyboardArrowHandler);
    };
  }, [state]);

  // Keyboard Enter
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
        // leaf node
        return;
      }
      // Non-leaf node, move the cursor forward two spaces
      const { selection } = state.model.editor;
      if (selection && Range.isCollapsed(selection)) {
        // Move the cursor two characters forward
        Transforms.move(state.model.editor, { distance: 2, reverse: true });
      }
      SuggestionViewUtils.preventVisibleJitter(reducer);
    };
    document.addEventListener('keydown', keyboardEnterHandler);
    return () => {
      document.removeEventListener('keydown', keyboardEnterHandler);
    };
  }, [state]);

  // Keyboard ESC cancel pop-up window
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

  // First item selected by default
  useEffect(() => {
    SuggestionViewUtils.selectFirstUIOption(state);
  }, [state]);
};

/** Side effects of waiting for semi component data to be updated */
export const useRenderEffect = (reducer: SuggestionReducer) => {
  const [state, dispatch] = reducer;

  // Set the search value after the component tree data is updated
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

  // Is it empty after searching for filters?
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
