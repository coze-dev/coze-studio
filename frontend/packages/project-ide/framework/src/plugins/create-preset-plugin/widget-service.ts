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
import {
  CommandRegistry,
  Emitter,
  type CustomTitleType,
  type Event,
} from '@coze-project-ide/client';

import { ProjectIDEWidget } from '@/widgets/project-ide-widget';
import { type WidgetTitleRender } from '@/types/client';
import { type WidgetRegistry, type WidgetUIState } from '@/types';
@injectable()
export class WidgetService {
  @inject(ProjectIDEWidget) public widget: ProjectIDEWidget;

  @inject(CommandRegistry) private commandRegistry: CommandRegistry;

  private _uiState: WidgetUIState = 'loading';

  private _title: string;

  private _iconType: string;

  private _widgetTitleRender: WidgetTitleRender;

  private registry: WidgetRegistry;

  readonly onFocusEmitter = new Emitter<void>();

  readonly onFocus: Event<void> = this.onFocusEmitter.event;

  readonly onTitleChangedEmitter = new Emitter<string>();

  readonly onTitleChanged: Event<string> = this.onTitleChangedEmitter.event;

  readonly onIconTypeChangeEmitter = new Emitter<string>();

  readonly onIconTypeChanged: Event<string> =
    this.onIconTypeChangeEmitter.event;

  init(factory: WidgetRegistry, widgetTitleRender: WidgetTitleRender) {
    this.registry = factory;
    this._widgetTitleRender = widgetTitleRender;
    this.setTitle(this._title);
  }

  /** Trigger rerendering */
  update() {
    (this.widget.title as CustomTitleType).iconLabel = this._widgetTitleRender({
      commandRegistry: this.commandRegistry,
      registry: this.registry,
      uiState: this._uiState,
      title: this._title,
      widget: this.widget,
    }) as any;
    (this.widget.title as CustomTitleType).saving = this._uiState === 'saving';
  }

  setTitle(title: string, uiState?: WidgetUIState) {
    if (this._title !== title) {
      this.onTitleChangedEmitter.fire(title);
    }
    this._title = title;
    if (uiState) {
      this._uiState = uiState;
    }
    this.update();
  }

  getTitle() {
    return this._title;
  }

  getUIState() {
    return this._uiState;
  }

  setUIState(uiState: WidgetUIState) {
    if (this._uiState !== uiState) {
      this._uiState = uiState;
      this.update();
    }
  }

  getIconType(): string {
    return this._iconType;
  }

  setIconType(iconType: string) {
    if (this._iconType !== iconType) {
      this.onIconTypeChangeEmitter.fire(iconType);
    }
    this._iconType = iconType;
    this.update();
  }

  close() {
    this.widget.close();
  }
}
