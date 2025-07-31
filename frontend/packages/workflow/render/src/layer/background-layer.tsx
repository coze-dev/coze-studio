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
 * Dot grid background
 */
export class BackgroundLayer extends Layer {
  static type = 'WorkflowBackgroundLayer';
  @observeEntity(PlaygroundConfigEntity)
  protected playgroundConfigEntity: PlaygroundConfigEntity;
  protected patternId = `${PATTERN_ID}${nanoid()}`;

  node = domUtils.createDivWithClass('gedit-flow-background-layer');
  grid: HTMLElement = document.createElement('div');

  /**
   * current zoom ratio
   */
  get zoom(): number {
    return this.config.finalScale;
  }

  onReady() {
    const { firstChild } = this.pipelineNode;
    // Insert the background to the bottom
    this.pipelineNode.insertBefore(this.node, firstChild);
    // Initialization settings Maximum 200% Minimum 10% Zoom
    this.playgroundConfigEntity.updateConfig({
      minZoom: 0.1,
      maxZoom: 2,
    });
    // Make sure the dot is located below the line
    this.grid.style.zIndex = '-1';
    this.grid.style.position = 'relative';
    this.node.appendChild(this.grid);
    this.grid.className = 'gedit-grid-svg';
  }

  /**
   * Minimum cell size
   */
  getScaleUnit(): BackgroundScaleUnit {
    const { zoom } = this;

    return {
      realSize: RENDER_SIZE, // The actual size represented by a cell
      renderSize: Math.round(RENDER_SIZE * zoom * 100) / 100, // The size value of a cell rendering
      zoom, // zoom ratio
    };
  }
  /**
   * draw
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
    // Set Grid
    this.setSVGStyle(this.grid, {
      width: viewBoxWidth,
      height: viewBoxHeight,
      left: SCALE_WIDTH - scrollXDelta - mod,
      top: SCALE_WIDTH - scrollYDelta - mod,
    });
  }

  /**
   * Draw mesh
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
   * Get the relative scroll distance
   * @param realScroll
   * @param mod
   */
  protected getScrollDelta(realScroll: number, mod: number): number {
    // There is no need to make up for the difference in forward scrolling.
    if (realScroll >= 0) {
      return realScroll % mod;
    }
    return mod - (Math.abs(realScroll) % mod);
  }
}
