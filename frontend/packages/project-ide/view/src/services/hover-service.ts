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

import type React from 'react';

import { type Root, createRoot } from 'react-dom/client';
import { inject, injectable } from 'inversify';
import {
  type Disposable,
  DisposableCollection,
} from '@flowgram-adapter/common';
import { LabelService } from '@coze-project-ide/core';

import { HOVER_TOOLTIP_LABEL } from '../constants';

export function createDisposableTimer(
  ...args: Parameters<typeof setTimeout>
): Disposable {
  const handle = setTimeout(...args);
  return { dispose: () => clearTimeout(handle) };
}
export function animationFrame(n = 1): Promise<void> {
  return new Promise(resolve => {
    function frameFunc(): void {
      if (n <= 0) {
        resolve();
      } else {
        n--;
        requestAnimationFrame(frameFunc);
      }
    }
    frameFunc();
  });
}

export type HoverPosition = 'left' | 'right' | 'top' | 'bottom';

export namespace HoverPosition {
  export function invertIfNecessary(
    position: HoverPosition,
    target: DOMRect,
    host: DOMRect,
    totalWidth: number,
    totalHeight: number,
    enableCustomHost: boolean,
  ): HoverPosition {
    if (position === 'left') {
      if (enableCustomHost) {
        if (target.left - target.width < 0) {
          return 'right';
        }
      } else if (target.left - host.width < 0) {
        return 'right';
      }
    } else if (position === 'right') {
      if (enableCustomHost) {
        if (target.right + target.width > totalWidth) {
          return 'left';
        }
      } else if (target.right + host.width > totalWidth) {
        return 'left';
      }
    } else if (position === 'top') {
      if (enableCustomHost) {
        if (target.top - target.height < 0) {
          return 'bottom';
        }
      } else if (target.top - host.height < 0) {
        return 'bottom';
      }
    } else if (position === 'bottom') {
      if (enableCustomHost) {
        if (target.bottom + target.height > totalHeight) {
          return 'top';
        }
      } else if (target.bottom + host.height > totalHeight) {
        return 'top';
      }
    }
    return position;
  }
}

export interface HoverRequest {
  content: string | HTMLElement | React.ReactNode;
  target: HTMLElement;
  position: HoverPosition;
  cssClasses?: string[];
  visualPreview?: (width: number) => HTMLElement | undefined;
  /** Hover position offset */
  offset?: number;
}

@injectable()
export class HoverService {
  @inject(LabelService) labelService: LabelService;

  protected static hostClassName = 'flow-hover';

  protected static styleSheetId = 'flow-hover-style';

  protected _hoverHost: HTMLElement | undefined;

  reactRoot: Root | null = null;

  protected get hoverHost(): HTMLElement {
    if (!this._hoverHost) {
      this._hoverHost = document.createElement('div');
      this._hoverHost.classList.add(HoverService.hostClassName);
      this._hoverHost.style.position = 'absolute';
    }
    return this._hoverHost;
  }

  protected pendingTimeout: Disposable | undefined;

  protected hoverTarget: HTMLElement | undefined;

  protected lastHidHover = Date.now();

  protected enableCustomHost = false;

  // protected timer: any = null;

  protected readonly disposeOnHide = new DisposableCollection();

  enableCustomHoverHost() {
    if (!this._hoverHost) {
      this.enableCustomHost = true;
      this._hoverHost = document.createElement('div');
      this.reactRoot = createRoot(this._hoverHost);
      this._hoverHost.style.position = 'absolute';
    }
  }

  requestHover(r: HoverRequest): void {
    if (r.target !== this.hoverTarget) {
      this.cancelHover();
      // clearTimeout(this.timer);
      this.pendingTimeout = createDisposableTimer(
        () => this.renderHover(r),
        this.getHoverDelay(),
      );
    }
  }

  protected async renderHover(request: HoverRequest): Promise<void> {
    const host = this.hoverHost;
    let firstChild: HTMLElement | undefined;
    const { target, content, position, cssClasses, offset } = request;
    if (cssClasses) {
      host.classList.add(...cssClasses);
    }
    this.hoverTarget = target;

    if (!this.reactRoot && content instanceof HTMLElement) {
      host.appendChild(content);
      firstChild = content;
    } else if (!this.reactRoot && typeof content === 'string') {
      host.textContent = content;
    }

    host.style.top = '0px';
    host.style.left = '0px';
    document.body.append(host);

    if (request.visualPreview) {
      const width = firstChild
        ? firstChild.offsetWidth
        : this.hoverHost.offsetWidth;
      const visualPreview = request.visualPreview(width);
      if (visualPreview) {
        host.appendChild(visualPreview);
      }
    }

    await animationFrame();
    const newPos = this.setHostPosition(target, host, position, offset);

    if (this.reactRoot) {
      const renderer = this.labelService.renderer(HOVER_TOOLTIP_LABEL, {
        content,
        position: newPos,
        key: new Date().getTime(),
      });
      this.reactRoot.render(renderer);
    }

    this.disposeOnHide.push({
      dispose: () => {
        this.lastHidHover = Date.now();
        host.classList.remove(newPos);
        if (cssClasses) {
          host.classList.remove(...cssClasses);
        }
      },
    });

    this.listenForMouseOut();
  }

  protected listenForMouseOut(): void {
    const handleMouseMove = (e: MouseEvent) => {
      if (!this.hoverTarget) {
        return;
      }
      if (
        e.target instanceof Node &&
        !this.hoverHost.contains(e.target) &&
        !this.hoverTarget?.contains(e.target)
      ) {
        // clearTimeout(this.timer);
        // this.timer = setTimeout(() => {
        //   this.cancelHover();
        // }, 300);
        this.cancelHover();
      }
    };
    document.addEventListener('mousemove', handleMouseMove);
    this.disposeOnHide.push({
      dispose: () => document.removeEventListener('mousemove', handleMouseMove),
    });
  }

  protected getHoverDelay(): number {
    return Date.now() - this.lastHidHover < 200 ? 0 : 200;
  }

  protected setHostPosition(
    target: HTMLElement,
    host: HTMLElement,
    position: HoverPosition,
    offset?: number,
  ): HoverPosition {
    const hostRect = host.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const documentHeight = document.documentElement.scrollHeight;
    const documentWidth = document.body.getBoundingClientRect().width;
    const calcOffset = offset || 0;

    position = HoverPosition.invertIfNecessary(
      position,
      targetRect,
      hostRect,
      documentWidth,
      documentHeight,
      this.enableCustomHost,
    );

    if (position === 'top' || position === 'bottom') {
      const targetMiddleWidth = targetRect.left + targetRect.width / 2;
      const middleAlignment = targetMiddleWidth - hostRect.width / 2;
      const furthestRight = Math.min(
        documentWidth - hostRect.width,
        middleAlignment,
      );
      const top =
        position === 'top'
          ? targetRect.top - hostRect.height + calcOffset
          : targetRect.bottom - calcOffset;
      const left = Math.max(0, furthestRight);
      host.style.top = `${top}px`;
      host.style.left = `${left}px`;
    } else {
      const targetMiddleHeight = targetRect.top + targetRect.height / 2;
      const middleAlignment = targetMiddleHeight - hostRect.height / 2;
      const furthestTop = Math.min(
        documentHeight - hostRect.height,
        middleAlignment,
      );
      const left =
        position === 'left'
          ? targetRect.left - hostRect.width - calcOffset
          : targetRect.right + calcOffset;
      const top = Math.max(0, furthestTop);
      host.style.left = `${left}px`;
      host.style.top = `${top}px`;
    }
    host.classList.add(position);
    return position;
  }

  protected unRender(): void {
    this.hoverHost.remove();
    this.hoverHost.replaceChildren();
  }

  cancelHover(): void {
    if (this.reactRoot) {
      const renderer = this.labelService.renderer(HOVER_TOOLTIP_LABEL, {
        visible: false,
        key: new Date().getTime(),
      });
      this.reactRoot.render(renderer);
    } else {
      this.unRender();
    }
    this.pendingTimeout?.dispose();
    this.disposeOnHide.dispose();
    this.hoverTarget = undefined;
  }
}
