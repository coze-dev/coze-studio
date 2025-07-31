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

import { renderHook } from '@testing-library/react-hooks';
import {
  type BizCtx,
  ComponentType,
  TrafficScene,
} from '@coze-arch/bot-api/debugger_api';

import { type BasicMockSetInfo } from '../../src/component/interface';
import { useInitialGetEnabledMockSet } from '../../src/component/hooks/use-get-mockset';

vi.mock('@coze-arch/bot-utils', () => ({
  safeJSONParse: JSON.parse,
}));

vi.mock('../const', () => ({
  IS_OVERSEA: true,
  REAL_DATA_MOCKSET: {
    id: '0',
  },
}));

vi.mock('@coze-arch/logger', () => ({
  logger: {
    createLoggerWith: vi.fn(),
  },
  reporter: {
    createReporterWithPreset: vi.fn(),
  },
}));

vi.mock('@coze-arch/bot-api', () => ({
  debuggerApi: {
    MGetMockSetBinding: vi.fn().mockResolvedValue({
      code: 0,
      msg: '',
      mockSetBindings: [
        {
          mockSetID: '1',
          mockSubject: {
            componentID: 'tool1',
            componentType: ComponentType.CozeTool,
            parentComponentID: 'plugin1',
            parentComponentType: ComponentType.CozePlugin,
          },
          bizCtx: {
            bizSpaceID: '1',
            trafficCallerID: '1',
            trafficScene: TrafficScene.CozeSingleAgentDebug,
            connectorID: '1',
            connectorUID: '2',
          },
        },
      ],
      mockSetDetails: {
        '1': {
          id: '1',
          name: 'test-detail',
          mockSubject: {
            componentID: 'tool1',
            componentType: ComponentType.CozeTool,
            parentComponentID: 'plugin1',
            parentComponentType: ComponentType.CozePlugin,
          },
        },
      },
    }),
  },
}));

describe('mock-set-hooks', () => {
  it('fetch-mock-list', async () => {
    const TEST_COMMON_BIZ = {
      connectorID: '1',
      connectorUID: '2',
    };

    const TEST_BIZ_CTX1: BizCtx = {
      bizSpaceID: '1',
      trafficCallerID: '1',
      trafficScene: TrafficScene.CozeSingleAgentDebug,
    };

    const TEST_MOCK_SUBJECT = {
      componentID: 'tool1',
      componentType: ComponentType.CozeTool,
      parentComponentID: 'plugin1',
      parentComponentType: ComponentType.CozePlugin,
    };

    const singleAgentToolItem: BasicMockSetInfo = {
      bindSubjectInfo: TEST_MOCK_SUBJECT,
      bizCtx: {
        ...TEST_COMMON_BIZ,
        ...TEST_BIZ_CTX1,
      },
    };
    const { result } = renderHook(() =>
      useInitialGetEnabledMockSet({
        bizCtx: singleAgentToolItem.bizCtx,
        pollingInterval: 0,
      }),
    );

    const { start } = result.current;

    await start();
    const { data } = result.current;
    expect(data[0]?.mockSetBinding.mockSetID).toEqual('1');
    expect(data[0]?.mockSetDetail?.id).toEqual('1');
  });
});
