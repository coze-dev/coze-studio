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

import {
  type BizCtx,
  ComponentType,
  TrafficScene,
} from '@coze-arch/bot-api/debugger_api';

import {
  isRealData,
  isCurrent,
  isSameWorkflowTool,
  isSameScene,
  getPluginInfo,
  getMockSubjectInfo,
  getUsedScene,
} from '@/utils';
import { type BasicMockSetInfo } from '@/interface';

vi.mock('@coze-arch/bot-utils', () => ({
  safeJSONParse: JSON.parse,
}));

vi.mock('@/const', () => ({
  IS_OVERSEA: true,
  REAL_DATA_MOCKSET: {
    id: '0',
  },
}));

vi.mock('@coze-arch/logger', () => ({
  logger: {
    createLoggerWith: vi.fn(),
  },
}));

const TEST_COMMON_BIZ = {
  connectorID: '1',
  connectorUID: '2',
};

const TEST_BIZ_CTX1: BizCtx = {
  bizSpaceID: '1',
  trafficCallerID: '1',
  trafficScene: TrafficScene.CozeSingleAgentDebug,
};

const TEST_BIZ_CTX2: BizCtx = {
  bizSpaceID: '1',
  trafficCallerID: '2',
  trafficScene: TrafficScene.CozeSingleAgentDebug,
};

const TEST_BIZ_CTX3: BizCtx = {
  bizSpaceID: '1',
  trafficCallerID: '1',
  trafficScene: TrafficScene.CozeWorkflowDebug,
};

const TEST_BIZ_CTX4: BizCtx = {
  bizSpaceID: '2',
  trafficCallerID: '1',
  trafficScene: TrafficScene.CozeWorkflowDebug,
};

const TEST_MOCK_SUBJECT1 = {
  componentID: 'tool1',
  componentType: ComponentType.CozeTool,
  parentComponentID: 'plugin1',
  parentComponentType: ComponentType.CozePlugin,
};

const TEST_MOCK_SUBJECT2 = {
  componentID: 'tool2',
  componentType: ComponentType.CozeTool,
  parentComponentID: 'plugin1',
  parentComponentType: ComponentType.CozePlugin,
};

const TEST_MOCK_WORKFLOW_NODE1 = {
  componentID: 'node1',
  componentType: ComponentType.CozeToolNode,
  parentComponentID: 'workflow1',
  parentComponentType: ComponentType.CozeWorkflow,
};

const TEST_MOCK_WORKFLOW_NODE2 = {
  componentID: 'node2',
  componentType: ComponentType.CozeToolNode,
  parentComponentID: 'workflow1',
  parentComponentType: ComponentType.CozeWorkflow,
};

const singleAgentToolItem1: BasicMockSetInfo = {
  bindSubjectInfo: TEST_MOCK_SUBJECT1,
  bizCtx: {
    ...TEST_COMMON_BIZ,
    ...TEST_BIZ_CTX1,
  },
};
const singleAgentToolItem2: BasicMockSetInfo = {
  bindSubjectInfo: TEST_MOCK_SUBJECT2,
  bizCtx: {
    ...TEST_COMMON_BIZ,
    ...TEST_BIZ_CTX2,
  },
};

const multiAgentToolItem: BasicMockSetInfo = {
  bindSubjectInfo: TEST_MOCK_SUBJECT1,
  bizCtx: {
    ...TEST_COMMON_BIZ,
    ...TEST_BIZ_CTX1,
    trafficScene: TrafficScene.CozeMultiAgentDebug,
  },
};

const workflowToolItem1: BasicMockSetInfo = {
  bindSubjectInfo: TEST_MOCK_WORKFLOW_NODE1,
  bizCtx: {
    ...TEST_COMMON_BIZ,
    ...TEST_BIZ_CTX3,
    ext: { mockSubjectInfo: JSON.stringify(TEST_MOCK_SUBJECT1) },
  },
};
const workflowToolItem2: BasicMockSetInfo = {
  bindSubjectInfo: TEST_MOCK_WORKFLOW_NODE1,
  bizCtx: {
    ...TEST_COMMON_BIZ,
    ...TEST_BIZ_CTX3,
    ext: { mockSubjectInfo: JSON.stringify(TEST_MOCK_SUBJECT2) },
  },
};
const workflowToolItem3: BasicMockSetInfo = {
  bindSubjectInfo: TEST_MOCK_WORKFLOW_NODE2,
  bizCtx: {
    ...TEST_COMMON_BIZ,
    ...TEST_BIZ_CTX3,
    ext: { mockSubjectInfo: JSON.stringify(TEST_MOCK_SUBJECT1) },
  },
};

describe('mock-set-utils-isRealData', () => {
  it('real data', () => {
    const res = isRealData({ id: '0' });

    expect(res).toEqual(true);
  });
  it('not real data', () => {
    const res = isRealData({ id: '123' });

    expect(res).toEqual(false);
  });
});

describe('mock-set-utils-isCurrent', () => {
  it('same single agent mock tool', () => {
    const res = isCurrent(singleAgentToolItem1, singleAgentToolItem1);

    expect(res).toEqual(true);
  });

  it('same agent different mock tool', () => {
    const res = isCurrent(singleAgentToolItem1, singleAgentToolItem2);

    expect(res).toEqual(false);
  });

  it('different single multi agent mock tool', () => {
    const res = isCurrent(singleAgentToolItem1, multiAgentToolItem);

    expect(res).toEqual(false);
  });

  it('different single agent workflow mock tool', () => {
    const res = isCurrent(singleAgentToolItem1, workflowToolItem1);

    expect(res).toEqual(false);
  });

  it('same workflow mock tool', () => {
    const res = isCurrent(workflowToolItem1, workflowToolItem1);

    expect(res).toEqual(true);
  });

  it('different workflow mock tool', () => {
    const res = isCurrent(workflowToolItem1, workflowToolItem2);

    expect(res).toEqual(false);
  });
  it('different workflow mock tool', () => {
    const res = isCurrent(workflowToolItem1, workflowToolItem2);

    expect(res).toEqual(false);
  });
  it('different workflow mock node', () => {
    const res = isCurrent(workflowToolItem1, workflowToolItem3);

    expect(res).toEqual(false);
  });
});

describe('mock-set-utils-isSameWorkflowTool', () => {
  it('workflow same mock subject', () => {
    const res = isSameWorkflowTool(
      workflowToolItem1.bizCtx.ext?.mockSubjectInfo || '',
      workflowToolItem1.bizCtx.ext?.mockSubjectInfo || '',
    );

    expect(res).toEqual(true);
  });

  it('different mock subject', () => {
    const res = isSameWorkflowTool(
      workflowToolItem1.bizCtx.ext?.mockSubjectInfo || '',
      workflowToolItem2.bizCtx.ext?.mockSubjectInfo || '',
    );

    expect(res).toEqual(false);
  });
});

describe('mock-set-utils-isSameScene', () => {
  it('isSameScene', () => {
    const res = isSameScene(TEST_BIZ_CTX1, TEST_BIZ_CTX1);

    expect(res).toEqual(true);
  });
  it('different caller id', () => {
    const res = isSameScene(TEST_BIZ_CTX1, TEST_BIZ_CTX2);

    expect(res).toEqual(false);
  });
  it('different used scene', () => {
    const res = isSameScene(TEST_BIZ_CTX1, TEST_BIZ_CTX3);

    expect(res).toEqual(false);
  });
  it('different space id', () => {
    const res = isSameScene(TEST_BIZ_CTX1, TEST_BIZ_CTX4);

    expect(res).toEqual(false);
  });
});

describe('mock-set-utils-getPluginInfo', () => {
  it('get agent tool info', () => {
    const res = getPluginInfo(TEST_BIZ_CTX1, TEST_MOCK_SUBJECT1);

    expect(res.pluginID).toEqual(TEST_MOCK_SUBJECT1.parentComponentID);
    expect(res.toolID).toEqual(TEST_MOCK_SUBJECT1.componentID);
    expect(res.spaceID).toEqual(TEST_BIZ_CTX1.bizSpaceID);
  });

  it('get workflow tool info', () => {
    const res = getPluginInfo(
      workflowToolItem1.bizCtx,
      workflowToolItem1.bindSubjectInfo,
    );

    expect(res.pluginID).toEqual(TEST_MOCK_SUBJECT1.parentComponentID);
    expect(res.toolID).toEqual(TEST_MOCK_SUBJECT1.componentID);
    expect(res.spaceID).toEqual(TEST_BIZ_CTX3.bizSpaceID);
  });
});

describe('mock-set-utils-getMockSubjectInfo', () => {
  it('get workflow mock subject info', () => {
    const res = getMockSubjectInfo(
      workflowToolItem1.bizCtx,
      workflowToolItem1.bindSubjectInfo,
    );

    expect(res.componentID).toEqual(TEST_MOCK_SUBJECT1.componentID);
    expect(res.componentType).toEqual(TEST_MOCK_SUBJECT1.componentType);
    expect(res.parentComponentID).toEqual(TEST_MOCK_SUBJECT1.parentComponentID);
    expect(res.parentComponentType).toEqual(
      TEST_MOCK_SUBJECT1.parentComponentType,
    );
  });

  it('get agent subject info', () => {
    const res = getMockSubjectInfo(
      singleAgentToolItem1.bizCtx,
      singleAgentToolItem1.bindSubjectInfo,
    );

    expect(res.componentID).toEqual(TEST_MOCK_SUBJECT1.componentID);
    expect(res.componentType).toEqual(TEST_MOCK_SUBJECT1.componentType);
    expect(res.parentComponentID).toEqual(TEST_MOCK_SUBJECT1.parentComponentID);
    expect(res.parentComponentType).toEqual(
      TEST_MOCK_SUBJECT1.parentComponentType,
    );
  });
});

describe('mock-set-utils-getMockSubjectInfo', () => {
  it('get single agent', () => {
    const res = getUsedScene(TrafficScene.CozeSingleAgentDebug);

    expect(res).toEqual('bot');
  });

  it('get multi agent', () => {
    const res = getUsedScene(TrafficScene.CozeMultiAgentDebug);

    expect(res).toEqual('agent');
  });

  it('get workflow', () => {
    const res = getUsedScene(TrafficScene.CozeWorkflowDebug);

    expect(res).toEqual('flow');
  });
});
