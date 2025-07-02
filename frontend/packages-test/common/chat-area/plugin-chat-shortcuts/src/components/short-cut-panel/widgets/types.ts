import { type PropsWithChildren, type FC } from 'react';

import { type RuleItem } from '@coze-arch/bot-semi/Form';
import { type InputType } from '@coze-arch/bot-api/playground_api';

import { type DSL } from '../../../types';

export interface FileValue {
  fileInstance?: File;
  url?: string;
  width?: number;
  height?: number;
}

export type TValue = string | FileValue | undefined;

export type TCustomUpload = (uploadParams: {
  file: File;
  onProgress?: (percent: number) => void;
  onSuccess?: (url: string, width?: number, height?: number) => void;
  onError?: (e: { status?: number }) => void;
}) => void;

export interface DSLContext {
  dsl: DSL;
  uploadFile?: TCustomUpload;
  onChange?: (value: Record<string, TValue>) => void; // 需要兼容 file
  onSubmit?: (value: Record<string, TValue>) => void;
  readonly?: boolean; // 支持搭建时的预览模式
}

export interface DSLFormFieldCommonProps {
  name: string;
  description?: string;
  rules: RuleItem[];
  defaultValue?: {
    type: InputType;
    value: string;
  };
}

export type DSLComponent<TProps = unknown> = FC<
  PropsWithChildren<{ context: DSLContext; props: TProps }>
>;
