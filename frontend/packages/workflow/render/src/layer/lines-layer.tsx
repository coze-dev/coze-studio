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

import ReactDOM from 'react-dom';
import React from 'react';

import { inject, injectable } from 'inversify';
import {
  Layer,
  observeEntities,
  observeEntityDatas,
  TransformData,
} from '@flowgram-adapter/free-layout-editor';
import {
  LineColors,
  LineType,
  WorkflowDocument,
  WorkflowHoverService,
  WorkflowLineEntity,
  WorkflowLineRenderData,
  WorkflowNodeEntity,
  WorkflowPortEntity,
  WorkflowSelectService,
} from '@flowgram-adapter/free-layout-editor';
import { domUtils } from '@flowgram-adapter/common';

import { FoldLineRender } from '../components/lines/fold-line';
import { BezierLineRender } from '../components/lines/bezier-line';

const errorActiveColor = '#FF5DC8';

@injectable()
export class LinesLayer extends Layer {
  static type = 'WorkflowLinesLayer';
  @inject(WorkflowHoverService) hoverService: WorkflowHoverService;
  @inject(WorkflowSelectService) selectService: WorkflowSelectService;
  // @observeEntity(FlowDocumentTransformerEntity)
  // readonly documentTransformer: FlowDocumentTransformerEntity

  @observeEntities(WorkflowLineEntity) readonly lines: WorkflowLineEntity[];
  @observeEntities(WorkflowPortEntity) readonly ports: WorkflowPortEntity[];
  @observeEntityDatas(WorkflowNodeEntity, TransformData)
  readonly trans: TransformData[];
  @inject(WorkflowDocument) protected workflowDocument: WorkflowDocument;

  private _frontLineEntities: WorkflowLineEntity[] = [];

  private _backLineEntities: WorkflowLineEntity[] = [];
  private _version = 0;
  /**
   * The line under the node
   */
  protected backLines = domUtils.createDivWithClass(
    'gedit-playground-layer gedit-flow-lines-layer back',
  );
  /**
   * The line in front of the node
   */
  protected frontLines = domUtils.createDivWithClass(
    'gedit-playground-layer gedit-flow-lines-layer front',
  );

  onZoom(scale: number): void {
    this.backLines.style.transform = `scale(${scale})`;
    this.frontLines.style.transform = `scale(${scale})`;
  }

  // To bypass the memo
  private bumpVersion() {
    this._version = this._version + 1;
    if (this._version === Number.MAX_SAFE_INTEGER) {
      this._version = 0;
    }
  }

  onReady() {
    this.pipelineNode.appendChild(this.backLines);
    this.pipelineNode.appendChild(this.frontLines);
    this.frontLines.style.zIndex = '20';
    this.toDispose.pushAll([
      this.selectService.onSelectionChanged(() => this.render()),
      this.hoverService.onHoveredChange(() => this.render()),
      this.workflowDocument.linesManager.onForceUpdate(() => {
        this.bumpVersion();
        this.render();
      }),
    ]);
  }
  getLineColor(line: WorkflowLineEntity): string {
    // Hidden priority is higher than hasError
    if (line.isHidden) {
      return line.highlightColor;
    }
    if (line.hasError) {
      if (
        (this.selectService.isSelected(line.id) ||
          this.hoverService.isHovered(line.id)) &&
        !this.config.readonly
      ) {
        return errorActiveColor;
      }
      return LineColors.ERROR;
    }
    if (line.highlightColor) {
      return line.highlightColor;
    }
    if (line.drawingTo) {
      return LineColors.DRAWING;
    }

    if (
      (this.selectService.isSelected(line.id) ||
        this.hoverService.isHovered(line.id)) &&
      !this.config.readonly
    ) {
      return LineColors.HOVER;
    }
    return LineColors.DEFUALT;
  }
  renderLines(lines: WorkflowLineEntity[]) {
    const { lineType } = this.workflowDocument.linesManager;

    // const isViewportVisible = this.config.isViewportVisible.bind(this.config);
    return (
      <>
        {lines
          .map(line => {
            const color = this.getLineColor(line);
            const selected = this.config.readonly
              ? false
              : this.selectService.isSelected(line.id);
            const renderData = line.getData(WorkflowLineRenderData);
            const version = `${this._version}:${line.version}:${renderData.renderVersion}`;
            // The line being drawn uses a Bézier curve
            if (lineType === LineType.LINE_CHART) {
              return (
                <FoldLineRender
                  key={line.id}
                  color={color}
                  selected={selected}
                  line={line}
                  version={version}
                />
              );
            }
            return (
              <BezierLineRender
                key={line.id}
                color={color}
                selected={selected}
                line={line}
                version={version}
              />
            );
          })
          .filter(l => l)}
      </>
    );
  }
  protected isFrontLine(line: WorkflowLineEntity): boolean {
    if (
      this.hoverService.isHovered(line.id) ||
      this.selectService.isSelected(line.id) ||
      line.isDrawing
    ) {
      return true;
    }
    // const { activatedNode } = this.selectService
    // //Place the cable of the selected node to the front
    // if (activatedNode) {
    //   const { inputLines, outputLines } = activatedNode.getData<WorkflowNodeLinesData>(WorkflowNodeLinesData)!
    //   if (inputLines.includes(line) || outputLines.includes(line)) {
    //     return true
    //   }
    // }
    return false;
  }
  renderBackLines(): React.ReactNode {
    return ReactDOM.createPortal(
      this.renderLines(this._backLineEntities),
      this.backLines,
    );
  }
  renderFrontLines(): React.ReactNode {
    return ReactDOM.createPortal(
      this.renderLines(this._frontLineEntities),
      this.frontLines,
    );
  }

  // onViewportChange = throttle(() => {
  //   this.render();
  // }, 100);
  /**
   * Group lines
   */
  groupLines(): void {
    this._backLineEntities = [];
    this._frontLineEntities = [];
    this.lines.forEach(line => {
      if (this.isFrontLine(line)) {
        this._frontLineEntities.push(line);
      } else {
        this._backLineEntities.push(line);
      }
    });
  }

  render(): JSX.Element {
    // const isViewportVisible = this.config.isViewportVisible.bind(this.config);
    // Group lines
    this.groupLines();
    return (
      <>
        {this.renderBackLines()}
        {this.renderFrontLines()}
      </>
    );
  }
}
