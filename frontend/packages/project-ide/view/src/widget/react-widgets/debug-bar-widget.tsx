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

import { inject, injectable, postConstruct } from 'inversify';
import { URI, EventService, StorageService } from '@coze-project-ide/core';

import { ReactWidget } from '../react-widget';
import { type ReactElementType } from '../../types/view';
import { ViewOptions } from '../../constants/view-options';
import { DEBUG_BAR_DRAGGABLE } from '../../constants';

export const DEBUG_BAR_CONTENT = new URI('flowide://panel/debug-bar-content');
const DEBUG_BAR_POSITION = 'debug-bar-pos';

@injectable()
export class DebugBarWidget extends ReactWidget {
  @inject(EventService) eventService: EventService;

  @inject(ViewOptions) options: ViewOptions;

  @inject(StorageService)
  protected readonly storageService: StorageService;

  content?: ReactElementType = null;

  ref = React.createRef<HTMLDivElement>();

  private _dragPos: {
    x: number;
    y: number;
  } | null = null;

  private initialPos: {
    x: number;
    y: number;
    width: number;
    height: number;
  } | null = null;

  @postConstruct()
  init() {
    if (this.options?.defaultLayoutData?.debugBar) {
      this.eventService.listenGlobalEvent(
        'mousedown',
        this._evtPointerDown.bind(this),
      );
      this.eventService.listenGlobalEvent(
        'mousemove',
        this._evtPointerMove.bind(this),
      );
      this.eventService.listenGlobalEvent(
        'mouseup',
        this._evtPointerUp.bind(this),
      );
      this.node.classList.remove('lm-Widget');
      this.node.classList.add('global-Widget');
    }
  }

  initContent(content?: {
    render: () => ReactElementType;
    memoPosition?: boolean;
    defaultPosition?: {
      left: string;
      top: string;
    };
  }) {
    this.content = content?.render();
    const layoutPosition = content?.memoPosition
      ? JSON.parse(this.storageService?.getData(DEBUG_BAR_POSITION, '{}'))
      : {};
    if (this.ref.current) {
      this.ref.current.style.left =
        layoutPosition?.left || content?.defaultPosition?.left;
      this.ref.current.style.top =
        layoutPosition?.top || content?.defaultPosition?.top;
    }
  }

  private _evtPointerDown(event: MouseEvent): void {
    if (event.button !== 0 && event.button !== 1) {
      return;
    }

    const draggableDom = this.ref.current?.querySelector(
      `.${DEBUG_BAR_DRAGGABLE}`,
    );

    if (
      event.target &&
      !draggableDom?.contains(event.target as HTMLElement) &&
      draggableDom !== event.target
    ) {
      return;
    }

    if (this._dragPos) {
      return;
    }

    // event.preventDefault();
    event.stopPropagation();

    this._dragPos = {
      x: event.clientX,
      y: event.clientY,
    };

    const box = this.ref.current?.getBoundingClientRect();
    this.initialPos = {
      x: box?.left || 0,
      y: box?.top || 0,
      width: box?.width || 0,
      height: box?.height || 0,
    };
  }

  private _evtPointerMove(event: React.MouseEvent): void {
    if (!this._dragPos || !this.initialPos) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    if (this.initialPos && this._dragPos && this.ref.current) {
      let offsetLeft = 0,
        offsetTop = 0;
      const windowClientWidth = document.documentElement.clientWidth;
      const windowClientHeight = document.documentElement.clientHeight;
      const left = this.initialPos.x + event.clientX - this._dragPos.x;
      const top = this.initialPos.y + event.clientY - this._dragPos.y;
      if (left < 0) {
        offsetLeft = 0;
      } else if (left > windowClientWidth - this.initialPos.width) {
        offsetLeft = windowClientWidth - this.initialPos.width;
      } else {
        offsetLeft = left;
      }
      if (top < 0) {
        offsetTop = 0;
      } else if (top > windowClientHeight - this.initialPos.height) {
        offsetTop = windowClientHeight - this.initialPos.height;
      } else {
        offsetTop = top;
      }
      this.ref.current.style.left = `${offsetLeft}px`;
      this.ref.current.style.top = `${offsetTop}px`;
    }
  }

  private _evtPointerUp(event: React.MouseEvent): void {
    // event.preventDefault();
    event.stopPropagation();
    const position = {
      left: this.ref.current?.style.left,
      top: this.ref.current?.style.top,
    };
    this.storageService.setData(DEBUG_BAR_POSITION, JSON.stringify(position));
    this._dragPos = null;
    this.initialPos = null;
  }

  render() {
    return (
      // Do not use the lumino widget logic, control the hidden through css
      <div
        className="debug-bar-widget-container"
        ref={this.ref}
        style={this.isHidden ? { display: 'none' } : {}}
      >
        {this.content}
      </div>
    );
  }
}
