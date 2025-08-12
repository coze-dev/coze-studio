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

import { inject, injectable } from 'inversify';
import { TransformData } from '@flowgram-adapter/free-layout-editor';
import {
  WorkflowCommands,
  WorkflowDocument,
  type WorkflowEdgeJSON,
  type WorkflowLineEntity,
  WorkflowNodeEntity,
  WorkflowNodeLinesData,
  WorkflowSelectService,
} from '@flowgram-adapter/free-layout-editor';
import { Rectangle } from '@flowgram-adapter/common';
import type {
  WorkflowShortcutsContribution,
  WorkflowShortcutsRegistry,
} from '@coze-workflow/render';
import { WorkflowNodeData } from '@coze-workflow/nodes';
import type { StandardNodeType } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';
import { Toast } from '@coze-arch/coze-design';

import { WorkflowGlobalStateEntity } from '@/typing';

import { safeFn } from '../../utils';
import type {
  WorkflowClipboardData,
  WorkflowClipboardJSON,
  WorkflowClipboardNodeTemporary,
  WorkflowClipboardNodeJSON,
  WorkflowClipboardRect,
  WorkflowClipboardSource,
} from '../../type';
import { WORKFLOW_CLIPBOARD_TYPE } from '../../constant';
import { isValid } from './is-valid';
import { hasSystemNodes } from './is-system-nodes';
import { getValidNodes } from './get-valid-nodes';

/**
 * Copy shortcut
 */
@injectable()
export class WorkflowCopyShortcutsContribution
  implements WorkflowShortcutsContribution
{
  @inject(WorkflowDocument) private document: WorkflowDocument;
  @inject(WorkflowSelectService) private selection: WorkflowSelectService;
  @inject(WorkflowGlobalStateEntity)
  private globalState: WorkflowGlobalStateEntity;
  /** Registration shortcut */
  public registerShortcuts(registry: WorkflowShortcutsRegistry): void {
    registry.addHandlers({
      commandId: WorkflowCommands.COPY_NODES,
      shortcuts: ['meta c', 'ctrl c'],
      isEnabled: () => !this.globalState.readonly,
      execute: safeFn(this.handle.bind(this)),
    });
  }
  public async toData(): Promise<WorkflowClipboardData> {
    const validNodes = getValidNodes(this.selectedNodes);
    const source = this.toSource();
    const json = await this.toJSON(validNodes);
    const bounds = this.getEntireBounds(validNodes);
    return {
      type: WORKFLOW_CLIPBOARD_TYPE,
      source,
      json,
      bounds,
    };
  }
  /** Access to source data */
  public toSource(): WorkflowClipboardSource {
    return {
      workflowId: this.globalState.workflowId,
      flowMode: this.globalState.flowMode,
      spaceId: this.globalState.spaceId,
      isDouyin: this.globalState.isBindDouyin,
      host: window.location.host,
    };
  }
  /** Get the node's JSON */
  public async toJSON(
    nodes: WorkflowNodeEntity[],
  ): Promise<WorkflowClipboardJSON> {
    const nodeJSONs = await this.getNodeJSONs(nodes);
    const edgeJSONs = this.getEdgeJSONs(nodes);
    return {
      nodes: nodeJSONs,
      edges: edgeJSONs,
    };
  }
  /** Handling replication events */
  private async handle(): Promise<void> {
    if (await this.hasTextSelected()) {
      // If there is a selected text, copy the text first.
      return;
    }
    if (!isValid(this.selectedNodes)) {
      return;
    }
    const data = await this.toData();
    await this.write(data);
  }
  /** Write to clipboard */
  private async write(data: WorkflowClipboardData): Promise<void> {
    try {
      await navigator.clipboard.writeText(JSON.stringify(data));
      if (hasSystemNodes(this.selectedNodes)) {
        Toast.warning({
          content: I18n.t('workflow_multi_choice_copy_partial_success'),
          showClose: false,
        });
      } else {
        Toast.success({
          content: I18n.t('workflow_multi_choice_copy_success'),
          showClose: false,
        });
      }
    } catch (err) {
      console.error('Failed to write text: ', err);
    }
  }
  /** Is there any selected text? */
  private async hasTextSelected(): Promise<boolean> {
    if (!window.getSelection()?.toString()) {
      return false;
    }
    await navigator.clipboard.writeText(
      window.getSelection()?.toString() ?? '',
    );
    Toast.success({
      content: I18n.t('workflow_text_copy', {}, '文本已复制到剪贴板'),
    });
    return true;
  }
  /** Get the selected node */
  private get selectedNodes(): WorkflowNodeEntity[] {
    return this.selection.selection.filter(
      n => n instanceof WorkflowNodeEntity,
    ) as WorkflowNodeEntity[];
  }
  /** Get the node's JSON */
  private async getNodeJSONs(
    nodes: WorkflowNodeEntity[],
  ): Promise<WorkflowClipboardNodeJSON[]> {
    const nodeJSONs = await Promise.all(
      nodes.map(node => this.tryToNodeJSON(node)),
    );
    return nodeJSONs.filter(Boolean) as WorkflowClipboardNodeJSON[];
  }
  /** Get the node's JSON */
  private async toNodeJSON(
    node: WorkflowNodeEntity,
  ): Promise<WorkflowClipboardNodeJSON> {
    const nodeJSON = (await this.document.toNodeJSON(
      node,
    )) as WorkflowClipboardNodeJSON;
    nodeJSON._temp = this.getNodeTemporary(node);

    // Recursive processing of blocks at all nested levels
    if (nodeJSON.blocks?.length) {
      await Promise.all(
        nodeJSON.blocks.map(async childJSON => {
          const child = this.document.getNode(childJSON.id);
          if (!child) {
            return;
          }
          childJSON._temp = this.getNodeTemporary(child);

          // Recursive processing of sub-node blocks
          if (childJSON.blocks?.length) {
            await this.processBlocksRecursively(childJSON.blocks);
          }
        }),
      );
    }
    return nodeJSON;
  }
  /** Recursive processing blocks */
  private async processBlocksRecursively(
    blocks: WorkflowClipboardNodeJSON[],
  ): Promise<void> {
    await Promise.all(
      blocks.map(async blockJSON => {
        const node = this.document.getNode(blockJSON.id);
        if (!node) {
          return;
        }
        blockJSON._temp = this.getNodeTemporary(node);

        if (blockJSON.blocks?.length) {
          await this.processBlocksRecursively(blockJSON.blocks);
        }
      }),
    );
  }
  private async tryToNodeJSON(
    node: WorkflowNodeEntity,
  ): Promise<WorkflowClipboardNodeJSON | undefined> {
    try {
      return await this.toNodeJSON(node);
      // eslint-disable-next-line @coze-arch/use-error-in-catch -- ignore error
    } catch (err) {
      return;
    }
  }
  /** Get additional data for the node */
  private getNodeTemporary(
    node: WorkflowNodeEntity,
  ): WorkflowClipboardNodeTemporary {
    const bounds = this.getNodeBounds(node);
    const nodeDataEntity = node.getData<WorkflowNodeData>(WorkflowNodeData);
    const externalData = nodeDataEntity.getNodeData<StandardNodeType.Api>();
    return {
      bounds,
      externalData,
    };
  }
  /** Get the node's rectangle */
  private getNodeBounds(node: WorkflowNodeEntity): WorkflowClipboardRect {
    const nodeData = node.getData<TransformData>(TransformData);
    return {
      x: nodeData.bounds.x,
      y: nodeData.bounds.y,
      width: nodeData.bounds.width,
      height: nodeData.bounds.height,
    };
  }
  /** Get the edges of all nodes */
  private getEdgeJSONs(nodes: WorkflowNodeEntity[]): WorkflowEdgeJSON[] {
    const lineSet = new Set<WorkflowLineEntity>();
    const nodeIdSet = new Set(nodes.map(n => n.id));
    nodes.forEach(node => {
      const linesData = node.getData(WorkflowNodeLinesData);
      const lines = [...linesData.inputLines, ...linesData.outputLines];
      lines.forEach(line => {
        if (
          nodeIdSet.has(line.from.id) &&
          line.to?.id &&
          nodeIdSet.has(line.to.id)
        ) {
          lineSet.add(line);
        }
      });
    });
    return Array.from(lineSet).map(line => line.toJSON());
  }
  /** Get the rectangle of all nodes */
  private getEntireBounds(nodes: WorkflowNodeEntity[]): WorkflowClipboardRect {
    const bounds = nodes.map(
      node => node.getData<TransformData>(TransformData).bounds,
    );
    const rect = Rectangle.enlarge(bounds);
    return {
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
    };
  }
}
