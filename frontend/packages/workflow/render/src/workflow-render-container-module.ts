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
import { FlowRendererContribution } from '@flowgram-adapter/free-layout-editor';
import { PlaygroundContribution } from '@flowgram-adapter/free-layout-editor';
import { bindContributions } from '@flowgram-adapter/common';

import { WorkflowShortcutsRegistry } from './workflow-shorcuts-contribution';
import { WorkflowRenderContribution } from './workflow-render-contribution';

export const WorkflowRenderContainerModule = new ContainerModule(bind => {
  bindContributions(bind, WorkflowRenderContribution, [
    PlaygroundContribution,
    FlowRendererContribution,
  ]);
  bind(WorkflowShortcutsRegistry).toSelf().inSingletonScope();
});
