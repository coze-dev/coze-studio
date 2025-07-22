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
import { type FormModelV2 } from '@flowgram-adapter/free-layout-editor';
import { FlowNodeFormData } from '@flowgram-adapter/free-layout-editor';
import { type FlowNodeEntity } from '@flowgram-adapter/free-layout-editor';
import { WorkflowDocument } from '@flowgram-adapter/free-layout-editor';
import { WorkflowNodeData } from '@coze-workflow/nodes';
import { workflowApi, StandardNodeType, BlockInput } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';
import { type GetApiDetailRequest } from '@coze-arch/bot-api/workflow_api';
import { Modal } from '@coze-arch/coze-design';

import { WorkflowPlaygroundContext } from '@/workflow-playground-context';
import { isNodeV2 } from '@/nodes-v2';
import { type ApiNodeFormData } from '@/node-registries/plugin/types';
import { WorkflowGlobalStateEntity } from '@/entities';

interface NodeWithVersion {
  node: FlowNodeEntity;
  /**
   * 注意 version 可能是不存在的！！！
   * 1. 老数据
   * 2. 项目中的资源被移动到资源库
   */
  /**
   * 1. versionName: 形如 v0.0.1，是 wf 的版本索引，也是外显版本号
   * 2. versionTs: 字符串形式的时间戳，是 plugin 的版本索引，wf 无此概念
   */
  version?: string;
}

type SubWorkflowNodeWithVersion = NodeWithVersion & {
  workflowId: string;
};
type ApiNodeWithVersion = NodeWithVersion & {
  pluginId: string;
  apiName: string;
};

const MY_SUB_WORKFLOW_NODE_VERSION_PATH = '/inputs/workflowVersion';
const MY_SUB_WORKFLOW_NODE_ID_PATH = '/inputs/workflowId';
const MY_API_NODE_PARAMS = '/inputs/apiParam';
const LLM_WORKFLOW_FC_PATH = '/fcParam/workflowFCParam/workflowList';
const LLM_API_FC_PATH = '/fcParam/pluginFCParam/pluginList';

export const isApiNode = (node: FlowNodeEntity) =>
  StandardNodeType.Api === node.flowNodeType;

export const isSubWorkflowNode = (node: FlowNodeEntity) =>
  StandardNodeType.SubWorkflow === node.flowNodeType;

export const isLLMNode = (node: FlowNodeEntity) =>
  node.flowNodeType === StandardNodeType.LLM;

export const getNodeFormModelV2 = (node: FlowNodeEntity) => {
  const nodeFormV2 = node
    .getData<FlowNodeFormData>(FlowNodeFormData)
    .getFormModel<FormModelV2>();

  return nodeFormV2;
};

export const getNodeFormValue = <T>(node: FlowNodeEntity, path: string): T => {
  const nodeForm = node.getData<FlowNodeFormData>(FlowNodeFormData).formModel;
  const nodeFormV2 = getNodeFormModelV2(node);

  if (isNodeV2(node) && nodeFormV2?.getValueIn) {
    return nodeFormV2.getValueIn(path) as T;
  }

  const value = nodeForm.getFormItemValueByPath(path);
  return value;
};

export const getNodeFormModel = (node: FlowNodeEntity, path: string) => {
  const nodeForm = node.getData<FlowNodeFormData>(FlowNodeFormData).formModel;
  const item = nodeForm.getFormItemByPath(path);

  return item;
};

export const getMySubWorkflowNodeVersion = (node: FlowNodeEntity) =>
  getNodeFormValue<string | undefined>(node, MY_SUB_WORKFLOW_NODE_VERSION_PATH);
export const getMySubWorkflowNodeId = (node: FlowNodeEntity) =>
  getNodeFormValue<string>(node, MY_SUB_WORKFLOW_NODE_ID_PATH);

export const getLLMWorkflowFC = (node: FlowNodeEntity) =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getNodeFormValue<any[]>(node, LLM_WORKFLOW_FC_PATH);
export const getLLMApiFC = (node: FlowNodeEntity) =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getNodeFormValue<any[]>(node, LLM_API_FC_PATH);
export const getLLMWorkflowFCById = (
  node: FlowNodeEntity,
  workflowId: string,
) => {
  const workflowList = getLLMWorkflowFC(node) || [];
  const current = workflowList.find(w => w.workflow_id === workflowId);
  return current;
};
export const getLLMApiFCById = (node: FlowNodeEntity, pluginId: string) => {
  const pluginList = getLLMApiFC(node) || [];
  const current = pluginList.find(w => w.plugin_id === pluginId);
  return current;
};

export const getMyApiNodeParams = (node: FlowNodeEntity) =>
  getNodeFormValue<BlockInput[]>(node, MY_API_NODE_PARAMS);
export const getMyApiNodeParam = (node: FlowNodeEntity, name: string) => {
  const params = getMyApiNodeParams(node);
  const block = params?.find(i => i.name === name);
  if (!block) {
    return;
  }
  return BlockInput.toLiteral<string>(block);
};
export const getMyApiNodeId = (node: FlowNodeEntity) =>
  getMyApiNodeParam(node, 'pluginID');
export const getMyApiNodeVersion = (node: FlowNodeEntity) =>
  getMyApiNodeParam(node, 'pluginVersion');
export const getMyApiNodeName = (node: FlowNodeEntity) =>
  getMyApiNodeParam(node, 'apiName');

/**
 * 设置子流程节点的版本号
 */
export const setSubWorkflowNodeVersion = (
  node: FlowNodeEntity,
  version: string,
) => {
  const formModelV2 = getNodeFormModelV2(node);

  if (isNodeV2(node) && formModelV2?.getValueIn) {
    const value = formModelV2.getValueIn<Record<string, unknown>>('/inputs');
    formModelV2.setValueIn('/inputs', {
      ...value,
      workflowVersion: version,
    });
    return;
  }

  const inputsModel = getNodeFormModel(node, '/inputs');
  if (inputsModel) {
    inputsModel.value = {
      ...inputsModel.value,
      workflowVersion: version,
    };
  }
};

export const setApiNodeVersion = (node: FlowNodeEntity, version: string) => {
  const formModelV2 = getNodeFormModelV2(node);

  if (isNodeV2(node) && formModelV2?.getValueIn) {
    const value = formModelV2.getValueIn<ApiNodeFormData['inputs']>('/inputs');
    formModelV2.setValueIn('/inputs', {
      ...value,
      apiParam: value?.apiParam.map(i => {
        if (i.name === 'pluginVersion') {
          return BlockInput.create('pluginVersion', version);
        }
        return i;
      }),
    });
    return;
  }

  const inputsModel = getNodeFormModel(node, '/inputs');
  if (inputsModel) {
    inputsModel.value = {
      ...inputsModel.value,
      apiParam: inputsModel.value.apiParam.map(i => {
        if (i.name === 'pluginVersion') {
          return BlockInput.create('pluginVersion', version);
        }
        return i;
      }),
    };
  }
};

const setLLMWorkflowFCVersion = (
  node: FlowNodeEntity,
  workflowId: string,
  version: string,
) => {
  const form = getNodeFormModelV2(node);
  const value = form.getValueIn(LLM_WORKFLOW_FC_PATH);
  if (Array.isArray(value)) {
    const idx = value.findIndex(i => i.workflow_id === workflowId);
    if (idx > -1) {
      value[idx].workflow_version = version;
      form.setValueIn(LLM_WORKFLOW_FC_PATH, [...value]);
    }
  }
};

const setLLMApiFCVersion = (
  node: FlowNodeEntity,
  pluginId: string,
  version: string,
) => {
  const form = getNodeFormModelV2(node);
  const value = form.getValueIn(LLM_API_FC_PATH);
  if (Array.isArray(value)) {
    const idx = value.findIndex(i => i.plugin_id === pluginId);
    if (idx > -1) {
      value[idx].plugin_version = version;
      form.setValueIn(LLM_API_FC_PATH, [...value]);
    }
  }
};

/**
 * 获取插件节点的版本信息
 */
export const getApiNodeVersion = (node: FlowNodeEntity) => {
  const nodeDataEntity = node.getData<WorkflowNodeData>(WorkflowNodeData);
  // 这里用了子流程的 type，实际上 api 也是相同
  const nodeData = nodeDataEntity.getNodeData<StandardNodeType.Api>();
  return {
    latestVersionTs: nodeData.latestVersionTs,
    latestVersionName: nodeData.latestVersionName,
    versionName: nodeData.versionName,
  };
};

/**
 * 获取子流程节点信息
 */
export const getSubWorkflowNode = (node: FlowNodeEntity) => {
  const nodeDataEntity = node.getData<WorkflowNodeData>(WorkflowNodeData);
  const nodeData = nodeDataEntity.getNodeData<StandardNodeType.SubWorkflow>();
  return nodeData;
};

export const recreateNodeForm = async (
  node: FlowNodeEntity,
  context: WorkflowPlaygroundContext,
) => {
  const formData = node.getData<FlowNodeFormData>(FlowNodeFormData);

  const nodeRegistry = node.getNodeRegistry();

  // 修改版本后，需要重新请求相应数据，因为相关数据的 key 都是带版本的，会取不到
  await nodeRegistry?.onInit?.({ data: formData.toJSON() }, context);

  await formData.recreateForm(
    node.getNodeRegister().formMeta,
    formData.toJSON(),
  );
};

const fetchApiNodeVersionName = async (params: GetApiDetailRequest) => {
  try {
    const { data } = await workflowApi.GetApiDetail(params);
    return {
      latestVersionName: data?.latest_version_name,
      versionName: data?.version_name,
    };
  } catch {
    return {};
  }
};

const forceUpdateModel = (oldVersion?: string, newVersion?: string) =>
  new Promise<boolean>(resolve =>
    Modal.confirm({
      title: I18n.t('workflow_version_update_model_title'),
      content: I18n.t('workflow_version_add_model_content', {
        oldVersion,
        newVersion,
      }),
      okText: I18n.t('confirm'),
      cancelText: I18n.t('cancel'),
      onOk: () => resolve(true),
      onCancel: () => resolve(false),
    }),
  );

@injectable()
export class NodeVersionService {
  @inject(WorkflowDocument) document: WorkflowDocument;

  @inject(WorkflowGlobalStateEntity) globalState: WorkflowGlobalStateEntity;
  @inject(WorkflowPlaygroundContext) context: WorkflowPlaygroundContext;

  /**
   * 遍历流程，获取流程中所有指定 workflowId 的子流程和对应的版本
   */
  getSubWorkflowNodesWithVersion(workflowId: string) {
    const allNodes = this.document.getAllNodes();
    const nodesWithVersion: SubWorkflowNodeWithVersion[] = [];
    allNodes.forEach(node => {
      // 存在对应的子流程节点
      if (
        isSubWorkflowNode(node) &&
        getMySubWorkflowNodeId(node) === workflowId
      ) {
        nodesWithVersion.push({
          node,
          workflowId,
          version: getMySubWorkflowNodeVersion(node),
        });
        return;
      }
      // llm 节点需要下钻到技能中查看是否有引用对应的子流程
      if (isLLMNode(node)) {
        const wf = getLLMWorkflowFCById(node, workflowId);
        if (wf) {
          nodesWithVersion.push({
            node,
            workflowId,
            version: wf.workflow_version,
          });
        }
      }
    });
    return nodesWithVersion;
  }

  /**
   * 遍历流程，获取流程中所有指定 pluginId 的节点和对应的版本
   */
  getPluginNodesWithVersion(pluginId: string) {
    const allNodes = this.document.getAllNodes();
    const nodesWithVersion: ApiNodeWithVersion[] = [];
    allNodes.forEach(node => {
      if (isApiNode(node) && getMyApiNodeId(node) === pluginId) {
        nodesWithVersion.push({
          node,
          pluginId,
          apiName: getMyApiNodeName(node) || '',
          version: getMyApiNodeVersion(node),
        });
        return;
      }
      if (isLLMNode(node)) {
        const p = getLLMApiFCById(node, pluginId);
        if (p) {
          nodesWithVersion.push({
            node,
            pluginId,
            apiName: p.api_name,
            version: p.plugin_version,
          });
        }
      }
    });
    return nodesWithVersion;
  }

  async setSubWorkflowNodesVersion(
    nodes: SubWorkflowNodeWithVersion[],
    version: string,
  ) {
    nodes.forEach(({ node, workflowId }) => {
      if (isSubWorkflowNode(node)) {
        setSubWorkflowNodeVersion(node, version);
        return;
      }
      if (isLLMNode(node)) {
        setLLMWorkflowFCVersion(node, workflowId, version);
        return;
      }
    });
    await Promise.all(
      nodes.map(({ node }) => recreateNodeForm(node, this.context)),
    );
  }

  async setApiNodesVersion(nodes: ApiNodeWithVersion[], version: string) {
    nodes.forEach(({ node, pluginId }) => {
      if (isApiNode(node)) {
        setApiNodeVersion(node, version);
        return;
      }
      if (isLLMNode(node)) {
        setLLMApiFCVersion(node, pluginId, version);
        return;
      }
    });
    await Promise.all(
      nodes.map(({ node }) => recreateNodeForm(node, this.context)),
    );
  }

  async updateSubWorkflowNodesVersion(workflowId: string, version: string) {
    const nodes = this.getSubWorkflowNodesWithVersion(workflowId);
    await this.setSubWorkflowNodesVersion(nodes, version);
  }
  async updateApiNodesVersion(pluginId: string, version: string) {
    const nodes = this.getPluginNodesWithVersion(pluginId);
    await this.setApiNodesVersion(nodes, version);
  }

  async updateNodesVersion(node: FlowNodeEntity, version: string) {
    if (isSubWorkflowNode(node)) {
      await this.updateSubWorkflowNodesVersion(
        getMySubWorkflowNodeId(node),
        version,
      );
      return;
    }
    if (isApiNode(node)) {
      await this.updateApiNodesVersion(getMyApiNodeId(node) || '', version);
      return;
    }
  }

  nodesCheck<T extends NodeWithVersion>(nodes: T[], targetVersion: string) {
    /**
     * 需要更新版本的节点有两种：
     * 1. 无版本号的节点
     * 2. 有版本号，但版本不一致的
     */
    const needUpdateNodes = nodes.filter(
      ({ version }) => version !== targetVersion,
    );
    /**
     * 有版本号的节点更新版本属于有损的强制更新，需要统计出来提示用户。无版本号的节点是无损更新
     */
    const needForceNodes = needUpdateNodes.filter(({ version }) => !!version);
    const needUpdate = !!needUpdateNodes.length;
    const needForce = !!needForceNodes.length;
    return {
      needForce,
      needUpdate,
      needUpdateNodes,
      needForceNodes,
    };
  }

  async addSubWorkflowCheck(workflowId?: string, targetVersion?: string) {
    // 要添加的流程没有版本号，则跳过版本统一步骤
    if (!targetVersion || !workflowId) {
      return true;
    }
    const sameNodesWithVersion =
      this.getSubWorkflowNodesWithVersion(workflowId);
    // 无同一个流程的节点
    if (!sameNodesWithVersion.length) {
      return true;
    }
    const { needForce, needUpdate, needForceNodes, needUpdateNodes } =
      this.nodesCheck(sameNodesWithVersion, targetVersion);
    if (needForce) {
      const oldVersion = needForceNodes[0].version as string;
      const confirm = await forceUpdateModel(oldVersion, targetVersion);
      if (!confirm) {
        return false;
      }
    }
    if (needUpdate) {
      await this.setSubWorkflowNodesVersion(needUpdateNodes, targetVersion);
    }
    return true;
  }

  async addApiCheck(pluginId?: string, targetVersionTs?: string) {
    /**
     * 1. 版本号不存在，表示引用最新版本，直接跳过验证
     * 2. '0' 也视为最新版本，语意上等同于为空，也直接跳过验证
     */
    if (!pluginId || !targetVersionTs || targetVersionTs === '0') {
      return true;
    }
    const sameNodesWithVersion = this.getPluginNodesWithVersion(pluginId);
    if (!sameNodesWithVersion.length) {
      return true;
    }
    const { needForce, needUpdate, needForceNodes, needUpdateNodes } =
      this.nodesCheck(sameNodesWithVersion, targetVersionTs);
    if (needForce) {
      const oldNode = needForceNodes[0];
      const { latestVersionName: targetVersion, versionName: oldVersion } =
        await fetchApiNodeVersionName({
          pluginID: pluginId,
          apiName: oldNode.apiName,
          plugin_version: oldNode.version,
          space_id: this.globalState.spaceId,
        });
      const confirm = await forceUpdateModel(
        oldVersion || oldNode.version,
        targetVersion || targetVersionTs,
      );
      if (!confirm) {
        return false;
      }
    }
    if (needUpdate) {
      await this.setApiNodesVersion(needUpdateNodes, targetVersionTs);
    }
    return true;
  }
}
