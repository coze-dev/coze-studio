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
