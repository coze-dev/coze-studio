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
 
/* eslint-disable @stylistic/ts/comma-dangle */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-invalid-void-type */
import { type InitOptions } from 'i18next';

/**
 * 初始化 Intl 实例配置参数
 */
export interface IIntlInitOptions
  extends Omit<InitOptions, 'missingInterpolationHandler'> {
  /**
   * t 方法是否开启第三个参数兜底
   * @default true
   */
  thirdParamFallback?: boolean;

  /**
   * 忽略所有控制台输出，不建议设置为 true
   * @default false
   */
  ignoreWarning?: boolean;
}

export enum IntlModuleType {
  intl3rdParty = 'intl3rdParty',
  backend = 'backend',
  logger = 'logger',
  languageDetector = 'languageDetector',
  postProcessor = 'postProcessor',
  i18nFormat = 'i18nFormat',
  '3rdParty' = '3rdParty'
}

export interface IntlModule<T extends keyof typeof IntlModuleType = keyof typeof IntlModuleType> {
  type: T
  name?: string
  init?: (i18n: any) => void | Promise<any>
}

export type TFunctionKeys = string | TemplateStringsArray;

export type TFunctionResult = string | object | Array<string | object> | undefined | null;

export interface StringMap { [key: string]: any }
