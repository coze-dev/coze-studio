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
  /**
   * The position where the hover should appear.
   * Note that the hover service will try to invert the position (i.e. right -> left)
   * if the specified content does not fit in the window next to the target element
   */
  position: HoverPosition;
  /**
   * Additional css classes that should be added to the hover box.
   * Used to style certain boxes different e.g. for the extended tab preview.
   */
  cssClasses?: string[];
  /**
   * A function to render a visual preview on the hover.
   * Function that takes the desired width and returns a HTMLElement to be rendered.
   */
  visualPreview?: (width: number) => HTMLElement | undefined;
  /** hover 位置偏移 */
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

  protected getHoverDelay(): number {
    return Date.now() - this.lastHidHover < 200 ? 0 : 200;
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

    host.style.left = '0px';
    host.style.top = '0px';
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

    await animationFrame(); // Allow the browser to size the host
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
