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
        state.entities.selectorBoxConfig.disabled = true; // 防止鼠标拖选不触发点击
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

/** 获取状态 */
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
    initialized: false, // 初始化
    version: 0, // 更新状态计数
    key: 0, // 用于触发 react 重新渲染组件
    variableTree: [], // 用于展示的组件树
    visible: true, // 默认显示，让ref能访问到DOM
    hiddenDOM: true, // 默认隐藏，让用户看不到UI
    allowVisibleChange: true, // 允许visible变更
    renderEffect: {
      // 渲染副作用
      search: false,
      filtered: false,
    },
  });
  return [state, dispatch];
};
