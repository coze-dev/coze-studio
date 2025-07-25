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
 
import {
  type ClipboardService,
  type EditorPluginContext,
  EditorProps,
  type FlowDocument,
  type FlowDocumentJSON,
  type FlowLayoutDefault,
  type FlowOperationService,
  type SelectionService,
  type FixedHistoryPluginOptions,
  type HistoryService,
} from '@flowgram-adapter/fixed-layout-editor';

export interface FixedLayoutPluginContext extends EditorPluginContext {
  document: FlowDocument;
  /**
   * 提供对画布节点相关操作方法, 并 支持 redo/undo
   */
  operation: FlowOperationService;
  clipboard: ClipboardService;
  selection: SelectionService;
  history: HistoryService;
}

/**
 * 固定布局配置
 */
export interface FixedLayoutProps
  extends EditorProps<FixedLayoutPluginContext, FlowDocumentJSON> {
  history?: FixedHistoryPluginOptions<FixedLayoutPluginContext> & {
    disableShortcuts?: boolean;
  };
  defaultLayout?: FlowLayoutDefault | string; // 默认布局
}

export const DEFAULT: FixedLayoutProps =
  EditorProps.DEFAULT as FixedLayoutProps;
