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

import React from 'react';

import { throttle } from 'lodash-es';
import { inject, injectable } from 'inversify';
import {
  FlowDocument,
  FlowDocumentTransformerEntity,
  Layer,
  observeEntity,
  domUtils,
} from '@flowgram-adapter/fixed-layout-editor';

import { CustomHoverService, CustomLinesManager } from '../services';
import { CustomRenderStateEntity } from '../entities';
import { LINE_CLASS_NAME } from '../constants';
import { LinesRenderer } from '../components/lines-render';

@injectable()
export class FlowLinesLayer extends Layer {
  @inject(FlowDocument) declare document: FlowDocument;

  @inject(CustomLinesManager) declare linesManager: CustomLinesManager;

  @inject(CustomHoverService) declare hoverService: CustomHoverService;

  node = domUtils.createDivWithClass('gedit-flow-lines-layer');

  @observeEntity(FlowDocumentTransformerEntity)
  declare documentTransformer: FlowDocumentTransformerEntity;

  @observeEntity(CustomRenderStateEntity)
  protected declare renderState: CustomRenderStateEntity;

  /**
   * Visual area change
   */
  onViewportChange = throttle(() => {
    this.render();
  }, 100) as ReturnType<typeof throttle>;

  onZoom() {
    const svgContainer = this.node!.querySelector('svg.flow-lines-container')!;
    svgContainer?.setAttribute?.('viewBox', this.viewBox);
  }

  onReady() {
    this.node.style.zIndex = '1';
    this.toDispose.pushAll([
      this.listenPlaygroundEvent('click', () => {
        this.hoverService.backgroundClick();
      }),
      this.listenPlaygroundEvent('mousemove', (e: React.MouseEvent) => {
        const lineDomNodes = this.playgroundNode.querySelectorAll(
          `.${LINE_CLASS_NAME}`,
        );
        const checkTargetFromLine = [...lineDomNodes].some(lineDom =>
          lineDom.contains(e.target as HTMLElement),
        );
        const mousePos = this.config.getPosFromMouseEvent(e);
        this.hoverService.updateHoverLine(mousePos, checkTargetFromLine);
      }),
    ]);
  }

  get viewBox(): string {
    const ratio = 1000 / this.config.finalScale;
    return `0 0 ${ratio} ${ratio}`;
  }

  render(): JSX.Element {
    const isViewportVisible = this.config.isViewportVisible.bind(this.config);
    // Not initialized yet
    if (this.documentTransformer?.loading) {
      return <></>;
    }
    this.documentTransformer?.refresh?.();

    return (
      <LinesRenderer
        viewBox={this.viewBox}
        isViewportVisible={isViewportVisible}
        lines={this.linesManager.lines}
        version={this.renderState.config.version}
      />
    );
  }
}
