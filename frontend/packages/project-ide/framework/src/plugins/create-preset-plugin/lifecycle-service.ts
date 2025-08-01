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

import { inject, injectable, postConstruct } from 'inversify';
import {
  ApplicationShell,
  DisposableCollection,
  type Disposable,
  Emitter,
  type CustomTitleType,
  type Event,
  EventService,
  MenuService,
} from '@coze-project-ide/client';

@injectable()
export class LifecycleService implements Disposable {
  @inject(ApplicationShell) shell: ApplicationShell;

  @inject(EventService) eventService: EventService;

  @inject(MenuService) menuService: MenuService;

  protected readonly onFocusEmitter = new Emitter<CustomTitleType>();

  readonly onFocus: Event<CustomTitleType> = this.onFocusEmitter.event;

  private disposable = new DisposableCollection(this.onFocusEmitter);

  @postConstruct()
  init() {
    this.disposable.push(
      this.shell.mainPanel.onDidChangeCurrent(title => {
        if (title) {
          this.onFocusEmitter.fire(title as CustomTitleType);
        }
      }),
    );
  }

  dispose() {
    this.disposable.dispose();
  }
}
