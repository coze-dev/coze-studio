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

import { isFunction, isPlainObject, isString } from 'lodash-es';
import { injectable } from 'inversify';
import { Emitter } from '@flowgram-adapter/common';

type Area = 'right' | 'bottom';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Render = (props?: any) => React.ReactNode;

export interface PanelInfo {
  key: string;
  area: Area;
}

export interface LayoutSize {
  height: number;
  width: number;
}

export class FloatLayoutPanel {
  key: string | null = null;
  panel: React.ReactNode = null;

  onUpdateEmitter = new Emitter<React.ReactNode>();
  onUpdate = this.onUpdateEmitter.event;

  update(val: React.ReactNode) {
    this.onUpdateEmitter.fire(val);
  }

  close() {
    this.panel = null;
    this.key = null;
    this.update(null);
  }
  open(node: React.ReactNode, key: string) {
    this.panel = node;
    this.key = key;
    this.update(node);
  }

  render() {
    return this.panel;
  }
}

@injectable()
export class WorkflowFloatLayoutService {
  /** layout size */
  size = {
    height: 0,
    width: 0,
  };
  onSizeChangeEmitter = new Emitter<LayoutSize>();
  onSizeChange = this.onSizeChangeEmitter.event;

  right = new FloatLayoutPanel();
  bottom = new FloatLayoutPanel();

  private components = new Map<string, Render>();

  onMountEmitter = new Emitter<PanelInfo>();
  onMount = this.onMountEmitter.event;

  onUnmountEmitter = new Emitter<PanelInfo>();
  onUnmount = this.onUnmountEmitter.event;

  register(val: Record<string, Render>): void;
  register(val: string, component: Render): void;
  register(
    val: string | Record<string, () => React.ReactNode>,
    component?: () => React.ReactNode,
  ) {
    if (isPlainObject(val)) {
      Object.entries(val).forEach(([key, comp]) => {
        this.register(key, comp);
      });
    } else if (isString(val) && component && isFunction(component)) {
      this.components.set(val, component);
    }
  }

  open<T>(key: string, area: Area = 'right', props?: T) {
    const panel = this.getPanel(area);
    const component = this.components.get(key);

    if (component && isFunction(component)) {
      const prevKey = panel.key;
      panel.open(component(props), key);
      if (prevKey) {
        this.onUnmountEmitter.fire({ key: prevKey, area });
      }
      this.onMountEmitter.fire({ key, area });
    }
  }
  close(area: Area = 'right') {
    const panel = this.getPanel(area);
    const prevKey = panel.key;
    panel.close();
    if (prevKey) {
      this.onUnmountEmitter.fire({ key: prevKey, area });
    }
  }
  closeAll() {
    this.close('right');
    this.close('bottom');
  }

  getPanel(area: Area) {
    if (area === 'right') {
      return this.right;
    }
    return this.bottom;
  }

  setLayoutSize(size: LayoutSize) {
    this.size = size;
    this.onSizeChangeEmitter.fire(size);
  }
}
