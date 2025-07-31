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

/**
 * Project ide app life cycle
 */
import { injectable, inject } from 'inversify';
import {
  type LifecycleContribution,
  LayoutRestorer,
  Emitter,
} from '@coze-project-ide/framework';

import { WidgetEventService } from './widget-event-service';
import { ProjectInfoService } from './project-info-service';
import { OpenURIResourceService } from './open-url-resource-service';

@injectable()
export class AppContribution implements LifecycleContribution {
  @inject(OpenURIResourceService)
  private openURIResourceService: OpenURIResourceService;

  @inject(WidgetEventService)
  private widgetEventService: WidgetEventService;

  @inject(LayoutRestorer)
  private layoutRestorer: LayoutRestorer;

  @inject(ProjectInfoService)
  private projectInfoService: ProjectInfoService;

  onStartedEmitter = new Emitter<void>();
  onStarted = this.onStartedEmitter.event;

  // When IDE initialization is complete and business logic can be executed
  onStart() {
    // Update project information
    this.projectInfoService.init();

    // Open the resources carried on the URL
    this.openURIResourceService.open();
    this.openURIResourceService.listen();
    // Subscribe to change events
    this.widgetEventService.listen();
    // listen layout store
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    this.layoutRestorer.listen();
    this.onStartedEmitter.fire();
  }

  onDispose() {
    // Destroy all subscriptions
    this.widgetEventService.dispose();
    this.openURIResourceService.dispose();
    this.onStartedEmitter.dispose();
  }
}
