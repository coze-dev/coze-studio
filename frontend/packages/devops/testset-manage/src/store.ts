import { create } from 'zustand';
import {
  type BizCtx,
  type ComponentSubject,
} from '@coze-arch/bot-api/debugger_api';

import { type NodeFormItem, type FormItemSchemaType } from './types';
import { type TestsetManageEventName } from './events';

export interface TestsetManageState {
  bizCtx?: BizCtx;
  bizComponentSubject?: ComponentSubject;
  /** 编辑权限 */
  editable?: boolean;
  /** 表单渲染组件 */
  formRenders?: Partial<Record<FormItemSchemaType, NodeFormItem>>;
  /** 埋点事件上报 */
  reportEvent?: (
    name: TestsetManageEventName,
    params?: Record<string, unknown>,
  ) => void;
}

export interface TestsetManageAction {
  /** 更新状态 */
  patch: (s: Partial<TestsetManageState>) => void;
}

export type TestsetManageProps = TestsetManageState & TestsetManageAction;

export function createTestsetManageStore(
  initState: Partial<TestsetManageState>,
) {
  return create<TestsetManageProps>((set, get) => ({
    ...initState,
    patch: s => {
      set(prev => ({ ...prev, ...s }));
    },
  }));
}

interface InnerState {
  generating: boolean;
}

interface InnerAction {
  patch: (s: Partial<InnerState>) => void;
}

export const useInnerStore = create<InnerState & InnerAction>((set, get) => ({
  generating: false,
  patch: s => {
    set({ ...s });
  },
}));
