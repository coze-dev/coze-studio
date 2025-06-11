import { type WorkFlowItemType } from '@coze-studio/bot-detail-store';
import { type PluginApi, ToolType } from '@coze-arch/bot-api/playground_api';

import {
  initToolInfoByToolApi,
  initToolInfoByWorkFlow,
  initToolInfoByPlugin,
  MAX_TOOL_PARAMS_COUNT,
} from '../../../../../../src/shortcut-tool/shortcut-edit/action-switch-area/skill-switch/method';

describe('initToolInfoByToolApi', () => {
  it('returns null when no toolApi is provided', () => {
    expect(initToolInfoByToolApi()).toBeNull();
  });

  it('initializes tool info by workflow when workflow_id is present', () => {
    // @ts-expect-error -- workflow_id is not required
    const workflow: WorkFlowItemType = {
      workflow_id: '1',
      name: 'Test Workflow',
      parameters: [],
    };

    const result = initToolInfoByToolApi(workflow);
    expect(result?.tool_type).toBe(ToolType.ToolTypeWorkFlow);
  });

  it('initializes tool info by plugin when workflow_id is not present', () => {
    const plugin: PluginApi = {
      name: 'Test Plugin',
      plugin_name: 'Test Plugin',
      parameters: [],
    };

    const result = initToolInfoByToolApi(plugin);
    expect(result?.tool_type).toBe(ToolType.ToolTypePlugin);
  });

  it('sorts parameters by required field and limits to MAX_TOOL_PARAMS_COUNT', () => {
    const parameters = Array(MAX_TOOL_PARAMS_COUNT + 2)
      .fill(null)
      .map((_, index) => ({
        name: `param${index}`,
        desc: `desc${index}`,
        required: index < MAX_TOOL_PARAMS_COUNT,
        type: 'string',
      }));

    const plugin: PluginApi = {
      name: 'Test Plugin',
      plugin_name: 'Test Plugin',
      parameters,
    };

    const result = initToolInfoByToolApi(plugin);
    expect(result?.tool_params_list.length).toBe(MAX_TOOL_PARAMS_COUNT + 2);
    // 前10个是required=true的参数
    expect(
      result?.tool_params_list
        .slice(0, MAX_TOOL_PARAMS_COUNT)
        .every(param => param.required),
    ).toBeTruthy();
  });
});

describe('initToolInfoByWorkFlow', () => {
  it('initializes tool info from a workflow item', () => {
    // @ts-expect-error -- workflow_id is not required
    const workflow: WorkFlowItemType = {
      workflow_id: '1',
      name: 'Test Workflow',
      parameters: [],
    };

    const result = initToolInfoByWorkFlow(workflow);
    expect(result.tool_type).toBe(ToolType.ToolTypeWorkFlow);
    expect(result.tool_name).toBe(workflow.name);
    expect(result.work_flow_id).toBe(workflow.workflow_id);
  });
});

describe('initToolInfoByPlugin', () => {
  it('initializes tool info from a plugin item', () => {
    const plugin: PluginApi = {
      name: 'Test Plugin',
      plugin_name: 'Test Plugin',
      parameters: [],
    };

    const result = initToolInfoByPlugin(plugin);
    expect(result.tool_type).toBe(ToolType.ToolTypePlugin);
    expect(result.tool_name).toBe(plugin.plugin_name);
    expect(result.plugin_api_name).toBe(plugin.name);
  });
});
