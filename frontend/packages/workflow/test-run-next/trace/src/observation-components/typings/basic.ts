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

import { type ReactNode } from 'react';

import { type TagType, type Value } from '../typings/idl';
import { type StatusCode } from '../consts/basic';
import { type ObservationModules } from '../consts';

export interface StatusBasicInfo {
  text: string;
}

export interface I18NInfo {
  title: string;
}

export interface StatusConfigInfo {
  icon: ReactNode;
  color: string;
  backgroundColor: string;
  text?: string;
}

export type StatusBasicInfoMapping = Record<
  number,
  StatusBasicInfo | undefined
>;

export type StatusInfo = StatusBasicInfo & StatusConfigInfo;

export type I18nMapping = Record<ObservationModules, I18NInfo | undefined>;

export interface PresetInfoMappings {
  i18nMapping: I18nMapping;
  statusBasicInfoMapping: StatusBasicInfoMapping;
}

export interface MetaTagsFieldParams {
  tagType: TagType;
  value?: Value;
  canCopy?: boolean;
  statusBasicInfoMapping?: StatusBasicInfoMapping;
}

export type MetaTagsFieldRenderer = (
  params: MetaTagsFieldParams,
) => string | ReactNode | undefined;

export interface BasicExtraRenderParams {
  duration?: number;
  tokens?: number;
  status?: StatusCode;
  placement: 'vertical' | 'horizontal';
  icon?: ReactNode;
  statusBasicInfoMapping: StatusBasicInfoMapping;
}

export type BasicExtraRender = (params: BasicExtraRenderParams) => ReactNode;
