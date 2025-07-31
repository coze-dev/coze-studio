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

/* eslint-disable complexity */
import { useReducer } from 'react';

import { type ExpressionEditorTreeNode } from '../../type';
import {
  type SuggestionState,
  type SuggestionAction,
  SuggestionActionType,
  type SuggestionActionPayload,
  type SuggestionReducer,
} from './type';

const updateState = (
  state: SuggestionState,
  snapshot: Partial<SuggestionState>,
): SuggestionState => ({
  ...state,
  version: state.version + 1,
  ...snapshot,
});

export const suggestionReducer = (
  state: SuggestionState,
  action: SuggestionAction,
) => {
  if (action.type === SuggestionActionType.SetInitialized) {
    return updateState(state, {
      initialized: true,
    });
  }
  if (action.type === SuggestionActionType.Refresh) {
    return updateState(state, {
      key: state.key + 1,
    });
  }
  if (action.type === SuggestionActionType.SetParseDataAndEditorPath) {
    const { parseData, editorPath } =
      (action.payload as SuggestionActionPayload<SuggestionActionType.SetParseDataAndEditorPath>) ||
      {};
    return updateState(state, {
      parseData,
      editorPath,
    });
  }
  if (action.type === SuggestionActionType.ClearParseDataAndEditorPath) {
    return updateState(state, {
      parseData: undefined,
      editorPath: undefined,
    });
  }
  if (action.type === SuggestionActionType.SetVariableTree) {
    const variableTree = action.payload as ExpressionEditorTreeNode[];
    return updateState(state, {
      variableTree,
    });
  }
  if (action.type === SuggestionActionType.SetAllowVisibleChange) {
    const allowVisibleChange =
      action.payload as SuggestionActionPayload<SuggestionActionType.SetAllowVisibleChange>;
    return updateState(state, {
      allowVisibleChange,
    });
  }
  if (
    action.type === SuggestionActionType.SetVisible &&
    state.allowVisibleChange
  ) {
    const visible =
      action.payload as SuggestionActionPayload<SuggestionActionType.SetVisible>;
    if (state.entities.selectorBoxConfig) {
      if (visible) {
        state.entities.selectorBoxConfig.disabled = true; // Prevent mouse dragging from triggering clicks
      }
      if (!visible) {
        state.entities.selectorBoxConfig.disabled = false;
      }
    }
    return updateState(state, {
      visible,
    });
  }
  if (action.type === SuggestionActionType.SetHiddenDOM) {
    const hiddenDOM =
      action.payload as SuggestionActionPayload<SuggestionActionType.SetHiddenDOM>;
    return updateState(state, {
      hiddenDOM,
    });
  }
  if (action.type === SuggestionActionType.SetRect) {
    const rect = action.payload as {
      top: number;
      left: number;
    };
    return updateState(state, {
      rect,
    });
  }
  if (action.type === SuggestionActionType.SetSelected) {
    const selected = action.payload as ExpressionEditorTreeNode;
    return updateState(state, {
      selected,
    });
  }
  if (action.type === SuggestionActionType.SetEmptyContent) {
    const emptyContent = action.payload as string;
    return updateState(state, {
      emptyContent,
    });
  }
  if (action.type === SuggestionActionType.SetMatchTreeBranch) {
    const matchTreeBranch = action.payload as
      | ExpressionEditorTreeNode[]
      | undefined;
    return updateState(state, {
      matchTreeBranch,
    });
  }
  if (action.type === SuggestionActionType.SearchEffectStart) {
    return updateState(state, {
      renderEffect: {
        ...state.renderEffect,
        search: true,
      },
    });
  }
  if (action.type === SuggestionActionType.SearchEffectEnd) {
    return updateState(state, {
      renderEffect: {
        ...state.renderEffect,
        search: false,
      },
    });
  }
  if (action.type === SuggestionActionType.FilteredEffectStart) {
    return updateState(state, {
      renderEffect: {
        ...state.renderEffect,
        filtered: true,
      },
    });
  }
  if (action.type === SuggestionActionType.FilteredEffectEnd) {
    return updateState(state, {
      renderEffect: {
        ...state.renderEffect,
        filtered: false,
      },
    });
  }
  return state;
};

/** Get status */
export const useSuggestionReducer = (
  initialState: Omit<
    SuggestionState,
    | 'initialized'
    | 'version'
    | 'key'
    | 'visible'
    | 'allowVisibleChange'
    | 'hiddenDOM'
    | 'variableTree'
    | 'renderEffect'
  >,
): SuggestionReducer => {
  const [state, dispatch]: SuggestionReducer = useReducer(suggestionReducer, {
    ...initialState,
    initialized: false, // initialization
    version: 0, // update status count
    key: 0, // Used to trigger react to re-render components
    variableTree: [], // Component tree for presentation
    visible: true, // Default display, allowing ref to access the DOM
    hiddenDOM: true, // Hidden by default, so that users cannot see the UI.
    allowVisibleChange: true, // Allow visible changes
    renderEffect: {
      // rendering side effects
      search: false,
      filtered: false,
    },
  });
  return [state, dispatch];
};
