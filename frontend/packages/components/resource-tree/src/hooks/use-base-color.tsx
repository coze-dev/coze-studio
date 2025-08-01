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
  ConstantKeys,
  FlowDocumentOptions,
  useService,
} from '@flowgram-adapter/fixed-layout-editor';

export const BASE_DEFAULT_COLOR = '#BBBFC4';
export const BASE_DEFAULT_ACTIVATED_COLOR = '#5147ff';

export function useBaseColor(): {
  baseColor: string;
  baseActivatedColor: string;
} {
  const options = useService<FlowDocumentOptions>(FlowDocumentOptions);
  return {
    baseColor:
      options.constants?.[ConstantKeys.BASE_COLOR] || BASE_DEFAULT_COLOR,
    baseActivatedColor:
      options.constants?.[ConstantKeys.BASE_ACTIVATED_COLOR] ||
      BASE_DEFAULT_ACTIVATED_COLOR,
  };
}

export const DEFAULT_LINE_ATTRS: React.SVGProps<SVGPathElement> = {
  stroke: BASE_DEFAULT_COLOR,
  fill: 'transparent',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};
