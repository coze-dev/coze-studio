import { isEqual } from 'lodash-es';
import { safeJSONParse } from '@coze-arch/bot-utils';
import {
  type BizCtx,
  type ComponentSubject,
  TrafficScene,
  type MockSet,
} from '@coze-arch/bot-api/debugger_api';

import { type BasicMockSetInfo, type BizCtxInfo } from '../interface';
import { REAL_DATA_MOCKSET } from '../const';

export function isRealData(mockSet: MockSet) {
  return mockSet.id === REAL_DATA_MOCKSET.id;
}

export function isCurrent(sItem: BasicMockSetInfo, tItem: BasicMockSetInfo) {
  const { bindSubjectInfo: mockSubject, bizCtx } = sItem;
  const { bindSubjectInfo: compSubject, bizCtx: compBizCtx } = tItem;
  const isCurrentComponent = isEqual(mockSubject, compSubject);
  const { ext, ...baseBizCtx } = bizCtx || {};
  const { ext: compExt, ...baseCompBizCxt } = compBizCtx || {};
  const isCurrentScene = isSameScene(baseBizCtx, baseCompBizCxt);
  const isWorkflowExt =
    bizCtx?.trafficScene !== TrafficScene.CozeWorkflowDebug ||
    isSameWorkflowTool(
      ext?.mockSubjectInfo || '',
      compExt?.mockSubjectInfo || '',
    );
  return isCurrentComponent && isCurrentScene && isWorkflowExt;
}

export function isSameWorkflowTool(
  sMockSubjectInfo: string,
  tMockSubjectInfo: string,
) {
  const sMockInfo = safeJSONParse(sMockSubjectInfo || '{}');
  const tMockInfo = safeJSONParse(tMockSubjectInfo || '{}');
  return isEqual(sMockInfo, tMockInfo);
}
export function isSameScene(sBizCtx: BizCtx, tBizCtx: BizCtx) {
  return (
    sBizCtx.bizSpaceID === tBizCtx.bizSpaceID &&
    sBizCtx.trafficScene === tBizCtx.trafficScene &&
    sBizCtx.trafficCallerID === tBizCtx.trafficCallerID
  );
}

export function getPluginInfo(
  bizCtx: BizCtxInfo,
  mockSubjectInfo: ComponentSubject,
): { spaceID?: string; pluginID?: string; toolID?: string } {
  const { bizSpaceID, ext, trafficScene } = bizCtx || {};
  const extMockSubjectInfo = safeJSONParse(ext?.mockSubjectInfo || '{}');
  const { componentID, parentComponentID } = mockSubjectInfo;
  switch (trafficScene) {
    case TrafficScene.CozeWorkflowDebug:
      return {
        spaceID: bizSpaceID,
        toolID: extMockSubjectInfo?.componentID,
        pluginID: extMockSubjectInfo?.parentComponentID,
      };
    case TrafficScene.CozeSingleAgentDebug:
    case TrafficScene.CozeMultiAgentDebug:
    case TrafficScene.CozeToolDebug:
    default:
      return {
        spaceID: bizSpaceID,
        toolID: componentID,
        pluginID: parentComponentID,
      };
  }
}

export function getMockSubjectInfo(
  bizCtx: BizCtxInfo,
  mockSubjectInfo: ComponentSubject,
) {
  const { ext, trafficScene } = bizCtx || {};
  const extMockSubjectInfo = safeJSONParse(ext?.mockSubjectInfo || '{}');
  switch (trafficScene) {
    case TrafficScene.CozeWorkflowDebug:
      return extMockSubjectInfo;
    case TrafficScene.CozeSingleAgentDebug:
    case TrafficScene.CozeMultiAgentDebug:
    case TrafficScene.CozeToolDebug:
    default:
      return mockSubjectInfo;
  }
}

export function getEnvironment() {
  if (!IS_PROD) {
    return 'cn-boe';
  }
  const regionPart = IS_OVERSEA ? 'oversea' : 'cn';
  const inhousePart = IS_RELEASE_VERSION ? 'release' : 'inhouse';

  return [regionPart, inhousePart].join('-');
}

export function getUsedScene(scene?: TrafficScene): 'bot' | 'agent' | 'flow' {
  switch (scene) {
    case TrafficScene.CozeSingleAgentDebug:
      return 'bot';
    case TrafficScene.CozeMultiAgentDebug:
      return 'agent';
    case TrafficScene.CozeWorkflowDebug:
      return 'flow';
    case TrafficScene.CozeToolDebug:
      return 'bot';
    default:
      return 'bot';
  }
}
