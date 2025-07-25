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
 
import { nanoid } from 'nanoid';
import {
  Layer,
  observeEntity,
  PlaygroundConfigEntity,
  SCALE_WIDTH,
} from '@flowgram-adapter/free-layout-editor';
import { domUtils } from '@flowgram-adapter/common';

interface BackgroundScaleUnit {
  realSize: number;
  renderSize: number;
  zoom: number;
}

const PATTERN_ID = 'grid-dot-pattern';
const RENDER_SIZE = 20;
const DOT_SIZE = 1;

/**
 * dot 网格背景
 */
export class BackgroundLayer extends Layer {
  static type = 'WorkflowBackgroundLayer';
  @observeEntity(PlaygroundConfigEntity)
  protected playgroundConfigEntity: PlaygroundConfigEntity;
  protected patternId = `${PATTERN_ID}${nanoid()}`;

  node = domUtils.createDivWithClass('gedit-flow-background-layer');
  grid: HTMLElement = document.createElement('div');

  /**
   * 当前缩放比
   */
  get zoom(): number {
    return this.config.finalScale;
  }

  onReady() {
    const { firstChild } = this.pipelineNode;
    // 背景插入到最下边
    this.pipelineNode.insertBefore(this.node, firstChild);
    // 初始化设置最大 200% 最小 10% 缩放
    this.playgroundConfigEntity.updateConfig({
      minZoom: 0.1,
      maxZoom: 2,
    });
    // 确保点的位置在线条的下方
    this.grid.style.zIndex = '-1';
    this.grid.style.position = 'relative';
    this.node.appendChild(this.grid);
    this.grid.className = 'gedit-grid-svg';
  }

  /**
   * 最小单元格大小
   */
  getScaleUnit(): BackgroundScaleUnit {
    const { zoom } = this;

    return {
      realSize: RENDER_SIZE, // 一个单元格代表的真实大小
      renderSize: Math.round(RENDER_SIZE * zoom * 100) / 100, // 一个单元格渲染的大小值
      zoom, // 缩放比
    };
  }
  /**
   * 绘制
   */
  autorun(): void {
    const playgroundConfig = this.playgroundConfigEntity.config;
    const scaleUnit = this.getScaleUnit();
    const mod = scaleUnit.renderSize * 10;
    const viewBoxWidth = playgroundConfig.width + mod * 2;
    const viewBoxHeight = playgroundConfig.height + mod * 2;
    const { scrollX } = playgroundConfig;
    const { scrollY } = playgroundConfig;
    const scrollXDelta = this.getScrollDelta(scrollX, mod);
    const scrollYDelta = this.getScrollDelta(scrollY, mod);
    domUtils.setStyle(this.node, {
      left: scrollX - SCALE_WIDTH,
      top: scrollY - SCALE_WIDTH,
    });
    this.drawGrid(scaleUnit);
    // 设置网格
    this.setSVGStyle(this.grid, {
      width: viewBoxWidth,
      height: viewBoxHeight,
      left: SCALE_WIDTH - scrollXDelta - mod,
      top: SCALE_WIDTH - scrollYDelta - mod,
    });
  }

  /**
   * 绘制网格
   */
  protected drawGrid(unit: BackgroundScaleUnit): void {
    const minor = unit.renderSize;
    if (!this.grid) {
      return;
    }
    const patternSize = DOT_SIZE * this.zoom;
    const newContent = `
    <svg width="100%" height="100%">
      <pattern id="${this.patternId}" width="${minor}" height="${minor}" patternUnits="userSpaceOnUse">
        <circle
          cx="${patternSize}"
          cy="${patternSize}"
          r="${patternSize}"
          stroke="#eceeef"
          fill-opacity="0.5"
        />
      </pattern>
      <rect width="100%" height="100%" fill="url(#${this.patternId})"/>
    </svg>`;
    this.grid.innerHTML = newContent;
  }

  protected setSVGStyle(
    svgElement: HTMLElement | undefined,
    style: { width: number; height: number; left: number; top: number },
  ): void {
    if (!svgElement) {
      return;
    }

    svgElement.style.width = `${style.width}px`;
    svgElement.style.height = `${style.height}px`;
    svgElement.style.left = `${style.left}px`;
    svgElement.style.top = `${style.top}px`;
  }

  /**
   * 获取相对滚动距离
   * @param realScroll
   * @param mod
   */
  protected getScrollDelta(realScroll: number, mod: number): number {
    // 正向滚动不用补差
    if (realScroll >= 0) {
      return realScroll % mod;
    }
    return mod - (Math.abs(realScroll) % mod);
  }
}
