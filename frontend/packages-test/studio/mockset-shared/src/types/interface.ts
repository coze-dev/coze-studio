import { type CSSProperties } from 'react';

import {
  type OptionProps,
  type optionRenderProps,
} from '@coze-arch/bot-semi/Select';
import {
  type BizCtx,
  type MockSet,
  type ComponentSubject,
} from '@coze-arch/bot-api/debugger_api';

export interface BizCtxInfo
  extends Omit<BizCtx, 'connectorID' | 'connectorUID' | 'ext'> {
  ext?: { mockSubjectInfo?: string } & Record<string, string>;
}

export type BindSubjectInfo = ComponentSubject & { detail?: BindSubjectDetail };

export interface BasicMockSetInfo {
  bindSubjectInfo: ComponentSubject;
  bizCtx: BizCtx;
}

export interface BindSubjectDetail {
  name?: string;
}
export interface MockSetSelectProps {
  bindSubjectInfo: BindSubjectInfo;
  bizCtx: BizCtxInfo;
  className?: string;
  style?: CSSProperties;
  readonly?: boolean;
}

export enum MockSetStatus {
  Incompatible = 'Incompatible',
  Normal = 'Normal',
}

export interface MockSelectOptionProps extends OptionProps {
  detail?: MockSet;
}

export interface MockSelectRenderOptionProps extends optionRenderProps {
  detail?: MockSet;
}
