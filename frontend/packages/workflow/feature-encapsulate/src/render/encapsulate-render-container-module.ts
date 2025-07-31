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

import { ContainerModule } from 'inversify';
import { bindContributions } from '@flowgram-adapter/free-layout-editor';
import { WorkflowShortcutsContribution } from '@coze-workflow/render';

import { EncapsulateShortcutsContribution } from './encapsulate-shortcuts-contribution';
import { EncapsulateRenderService } from './encapsulate-render-service';

export const EncapsulateRenderContainerModule = new ContainerModule(bind => {
  bindContributions(bind, EncapsulateShortcutsContribution, [
    WorkflowShortcutsContribution,
  ]);
  bind(EncapsulateRenderService).toSelf().inSingletonScope();
});
