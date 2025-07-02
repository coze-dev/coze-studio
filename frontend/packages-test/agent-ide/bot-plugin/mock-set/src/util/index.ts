// @ts-expect-error -- linter-disable-autofix
import { isEqual } from 'lodash-es';
import { safeJSONParse } from '@coze-arch/bot-utils';
import {
  type BizCtx,
  TrafficScene,
  type MockSet,
} from '@coze-arch/bot-api/debugger_api';
import { type BasicMockSetInfo } from '@coze-studio/mockset-shared';

import { REAL_DATA_MOCKSET } from '../component/const';
export { safeJSONParse } from './utils';
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
