/* eslint-disable @typescript-eslint/no-explicit-any */
import { injectable } from 'inversify';
import { type FlowDocumentContribution } from '@flowgram-adapter/free-layout-editor';
import { lazyInject } from '@flowgram-adapter/free-layout-editor';
import { type WorkflowDocument } from '@flowgram-adapter/free-layout-editor';
import {
  type FlowRendererContribution,
  FlowRendererKey,
  type FlowRendererRegistry,
} from '@coze-workflow/render';
import { WorkflowRenderKey } from '@coze-workflow/nodes';
import { StandardNodeType } from '@coze-workflow/base';

import { WorkflowSaveService } from '../services';
import { SubCanvasRender } from '../components/sub-canvas';
import { NodeRender } from '../components/node-render';
import { LinePopover } from '../components/line-popover';
import { CommentRender } from '../components/comment';

const LINE_POPOVER = 'line-popover';

@injectable()
export class WorkflowPageContribution
  implements
    FlowRendererContribution,
    FlowDocumentContribution<WorkflowDocument>
{
  @lazyInject(WorkflowSaveService) declare saveService: WorkflowSaveService;
  protected document: WorkflowDocument;

  /**
   * 注册表单数据
   * @param document
   */
  // registerDocument(document: WorkflowDocument): void {
  //   document.registerNodeDatas(...createNodeEntityDatas());
  // }
  /**
   * 加载数据
   */
  async loadDocument(doc: WorkflowDocument): Promise<void> {
    this.document = doc;
    await this.saveService.loadDocument(doc);
  }

  /**
   * 注册节点渲染组件
   * @param registry
   */
  registerRenderer(renderer: FlowRendererRegistry): void {
    // 注册节点渲染组件
    renderer.registerReactComponent(FlowRendererKey.NODE_RENDER, NodeRender);

    renderer.registerReactComponent(
      FlowRendererKey.SUB_CANVAS,
      SubCanvasRender,
    );

    renderer.registerReactComponent(StandardNodeType.Comment, CommentRender);

    renderer.registerReactComponent(LINE_POPOVER, LinePopover as any);

    // 注册节点上方 test run 相关渲染组件
    renderer.registerReactComponent(
      WorkflowRenderKey.EXECUTE_STATUS_BAR,
      () => null,
    );
  }
}
