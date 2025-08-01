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
import { type StandardNodeType } from '@coze-workflow/base/types';
import { WorkflowMode } from '@coze-workflow/base/api';
import {
  EntityManager,
  type PluginContext,
  PlaygroundConfigEntity,
} from '@flowgram-adapter/free-layout-editor';

import { checkEncapsulateGray } from './utils';
import {
  type NodeMeta,
  type GetGlobalStateOption,
  type GetNodeTemplateOption,
} from './types';

@injectable()
export class EncapsulateContext {
  @inject(EntityManager)
  protected readonly entityManager: EntityManager;

  @inject(PlaygroundConfigEntity)
  private playgroundConfigEntity: PlaygroundConfigEntity;

  private pluginContext: PluginContext;

  private getGlobalStateOption: GetGlobalStateOption = () => ({
    spaceId: '',
    flowMode: WorkflowMode.Workflow,
    info: {
      name: '',
    },
  });

  private getNodeMetaTemplateOption: GetNodeTemplateOption = () => () =>
    undefined;

  setGetGlobalState(getGlobalState: GetGlobalStateOption) {
    this.getGlobalStateOption = getGlobalState;
  }

  setGetNodeTemplate(getNodeTemplate: GetNodeTemplateOption) {
    this.getNodeMetaTemplateOption = getNodeTemplate;
  }

  getNodeTemplate(type: StandardNodeType): NodeMeta | undefined {
    return this.getNodeMetaTemplateOption(this.pluginContext)(type);
  }

  setPluginContext(context: PluginContext) {
    this.pluginContext = context;
  }

  private get globalState() {
    return this.getGlobalStateOption(this.pluginContext);
  }

  get spaceId() {
    return this.globalState?.spaceId;
  }

  get flowName() {
    return this.globalState?.info?.name;
  }

  get flowMode() {
    return this.globalState?.flowMode;
  }

  get isChatFlow() {
    return this.globalState?.flowMode === WorkflowMode.ChatFlow;
  }

  get enabled() {
    return checkEncapsulateGray() && !this.playgroundConfigEntity.readonly;
  }

  get projectId() {
    return this.globalState?.projectId;
  }
}
