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

import React, { useEffect, useRef } from 'react';

import { debounce } from 'lodash';
import { injectable, inject } from 'inversify';
import { Emitter } from '@flowgram-adapter/common';
import { EventService, useRefresh } from '@coze-project-ide/core';

import { type ReactWidget } from './widget/react-widget';
import { createPortal } from './utils';
import { type ApplicationShell } from './shell';
import { DebugService } from './services/debug-service';
import { Widget } from './lumino/widgets';
import { ViewOptions } from './constants/view-options';
import { VIEW_CONTAINER_CLASS_NAME } from './constants';

@injectable()
export class ViewRenderer {
  @inject(ViewOptions) viewOptions: ViewOptions;

  @inject(EventService) eventService: EventService;

  @inject(DebugService) debugService: DebugService;

  private reactComp?: React.FC;

  protected readonly onViewChangeEmitter = new Emitter<void>();

  readonly onViewChange = this.onViewChangeEmitter.event;

  protected widgets: Set<ReactWidget> = new Set();

  reactPortals: {
    key?: string;
    comp: React.FunctionComponent;
  }[] = [];

  // Global mount, entering the canvas will only be executed once.
  globalReactPortals: {
    key?: string;
    comp: React.FunctionComponent;
  }[] = [];

  addReactPortal(widget: ReactWidget) {
    if (this.widgets.has(widget)) {
      return widget;
    }
    const originRenderer = widget.render.bind(widget);
    this.widgets.add(widget);

    const portal = createPortal(
      widget,
      originRenderer,
      this.viewOptions.widgetFallbackRender!,
    );
    widget.onDispose(() => {
      const index = this.reactPortals.indexOf(portal);
      this.widgets.delete(widget);
      this.reactPortals.splice(index, 1);
      this.fireViewChange();
    });

    this.reactPortals.push(portal);
    this.fireViewChange();

    return widget;
  }

  fireViewChange = debounce(() => {
    this.onViewChangeEmitter.fire();
  }, 0);

  /**
   * To react
   * Inject shell to avoid injection cycle
   */
  toReactComponent(shell: ApplicationShell): React.FC {
    if (this.reactComp) {
      return this.reactComp;
    }
    if (
      !this.globalReactPortals.length &&
      this.viewOptions?.defaultLayoutData?.debugBar
    ) {
      this.globalReactPortals.push(this.debugService.createPortal());
    }
    const comp = ({ className = '' }: { className?: string }) => {
      const portals = this.reactPortals;
      const refresh = useRefresh();
      const flowContainerRef = useRef<HTMLDivElement>(null);
      useEffect(() => {
        const dispose = this.onViewChange(refresh);
        Widget.attach(shell, flowContainerRef.current || document.body);
        this.eventService.listenGlobalEvent('resize', () => {
          shell.update();
        });
        return () => {
          dispose.dispose();
        };
      }, []);
      return (
        <div
          className={`${VIEW_CONTAINER_CLASS_NAME} ${className}`}
          ref={flowContainerRef}
        >
          {this.globalReactPortals.map(Portal => {
            const Comp = Portal.comp;
            return <Comp key={Portal.key} />;
          })}
          {}
          {portals.map(Portal => {
            const Comp = Portal.comp;
            return <Comp key={Portal.key} />;
          })}
        </div>
      );
    };
    this.reactComp = comp;
    return comp;
  }
}
