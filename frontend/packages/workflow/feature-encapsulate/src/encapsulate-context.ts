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
