import type { Dispatch, RefObject } from 'react';

import type { Tree } from '@coze-arch/bot-semi';
import type { SelectorBoxConfigEntity } from '@flowgram-adapter/free-layout-editor';
import type { PlaygroundConfigEntity } from '@flowgram-adapter/free-layout-editor';

import type {
  ExpressionEditorParseData,
  ExpressionEditorTreeNode,
} from '../../type';
import type { ExpressionEditorModel } from '../../model';

export interface SuggestionState {
  initialized: boolean;
  version: number;
  model: ExpressionEditorModel;
  entities: {
    playgroundConfig?: PlaygroundConfigEntity;
    selectorBoxConfig?: SelectorBoxConfigEntity;
  };
  ref: {
    container: RefObject<HTMLDivElement>;
    suggestion: RefObject<HTMLDivElement>;
    tree: RefObject<Tree>;
  };
  key: number;
  variableTree: ExpressionEditorTreeNode[];
  visible: boolean;
  allowVisibleChange: boolean;
  hiddenDOM: boolean;
  renderEffect: {
    search: boolean;
    filtered: boolean;
  };
  rect?: {
    top: number;
    left: number;
  };
  selected?: ExpressionEditorTreeNode;
  parseData?: ExpressionEditorParseData;
  editorPath?: number[];
  emptyContent?: string;
  matchTreeBranch?: ExpressionEditorTreeNode[];
}

export enum SuggestionActionType {
  SetInitialized = 'set_initialized',
  Refresh = 'refresh',
  SetParseDataAndEditorPath = 'set_parse_data_and_editor_path',
  ClearParseDataAndEditorPath = 'clear_parse_data_and_editor_path',
  SetVariableTree = 'set_variable_tree',
  SetVisible = 'set_visible',
  SetAllowVisibleChange = 'set_allow_visible_change',
  SetHiddenDOM = 'set_hidden_dom',
  SetRect = 'set_rect',
  SetSelected = 'set_selected',
  SetEmptyContent = 'set_empty_content',
  SetMatchTreeBranch = 'set_match_tree_branch',
  SearchEffectStart = 'search_effect_start',
  SearchEffectEnd = 'search_effect_end',
  FilteredEffectStart = 'filtered_effect_start',
  FilteredEffectEnd = 'filtered_effect_end',
}

export type SuggestionActionPayload<T extends SuggestionActionType> = {
  [SuggestionActionType.SetInitialized]?: undefined;
  [SuggestionActionType.Refresh]?: undefined;
  [SuggestionActionType.SetParseDataAndEditorPath]?: {
    parseData: ExpressionEditorParseData;
    editorPath: number[];
  };
  [SuggestionActionType.ClearParseDataAndEditorPath]?: undefined;
  [SuggestionActionType.SetVariableTree]: ExpressionEditorTreeNode[];
  [SuggestionActionType.SetVisible]: boolean;
  [SuggestionActionType.SetAllowVisibleChange]: boolean;
  [SuggestionActionType.SetHiddenDOM]: boolean;
  [SuggestionActionType.SetRect]: {
    top: number;
    left: number;
  };
  [SuggestionActionType.SetSelected]?: ExpressionEditorTreeNode;
  [SuggestionActionType.SetEmptyContent]?: string;
  [SuggestionActionType.SetMatchTreeBranch]:
    | ExpressionEditorTreeNode[]
    | undefined;
  [SuggestionActionType.SearchEffectStart]?: undefined;
  [SuggestionActionType.SearchEffectEnd]?: undefined;
  [SuggestionActionType.FilteredEffectStart]?: undefined;
  [SuggestionActionType.FilteredEffectEnd]?: undefined;
}[T];

export interface SuggestionAction<
  T extends SuggestionActionType = SuggestionActionType,
> {
  type: SuggestionActionType;
  payload?: SuggestionActionPayload<T>;
}

export type SuggestionReducer = [SuggestionState, Dispatch<SuggestionAction>];
