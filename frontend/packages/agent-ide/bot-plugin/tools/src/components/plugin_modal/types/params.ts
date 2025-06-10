import { type ReactNode } from 'react';

import {
  type APIParameter,
  type AssistParameterType,
  type ParameterType,
  type PluginAPIInfo,
} from '@coze-arch/bot-api/plugin_develop';

import { type ParameterTypeExtend, type PluginParameterType } from '../config';

export interface APIParameterRecord extends APIParameter {
  deep?: number;
  value?: string;
}

export interface UpdateNodeWithDataFn {
  (params: {
    record: APIParameter;
    key: string | Array<string>;
    value: unknown;
    updateData?: boolean;
    checkDefault?: boolean;
    inherit?: boolean;
  }): void;
}

export interface AddChildNodeFn {
  (params: {
    record: APIParameterRecord;
    isArray?: boolean;
    isObj?: boolean;
    type?: ParameterType;
    recordType?: ParameterType;
  }): void;
}

export interface InputItemProps {
  val?: string;
  max?: number;
  check?: number;
  width?: number | string;
  useCheck?: boolean;
  checkAscii?: boolean;
  isRequired?: boolean;
  placeholder?: string;
  filterSpace?: boolean;
  callback?: (val: string) => void;
  selectCallback?: (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    val: string | number | any[] | Record<string, any> | undefined,
  ) => void;
  targetKey?: string;
  data?: Array<APIParameter>;
  checkSame?: boolean;
  useBlockWrap?: boolean;
  disabled?: boolean;
  record?: APIParameterRecord;
  dynamicWidth?: boolean;
  deep?: number;
  typeOptions?: Array<Record<string, string | number>>;
}

export type CascaderValueType = [PluginParameterType, ParameterTypeExtend?];
export type CascaderOnChangValueType = [
  PluginParameterType,
  AssistParameterType?,
];
export interface RenderEnhancedComponentProps {
  renderDescComponent: (props: {
    onSetDescription: (desc: string) => void;
    originDesc: string | undefined;
    className: string;
    disabled?: boolean;
    plugin_id: string;
    space_id: string;
  }) => ReactNode;
  renderParamsComponent: (props: {
    size?: 'small' | 'default';
    src: 'request' | 'response';
    apiInfo: PluginAPIInfo | undefined;
    originParams: APIParameter[];
    onSetParams: (params: APIParameter[]) => void;
    disabled?: boolean;
    spaceID: string;
    pluginId: string;
  }) => ReactNode;
}
