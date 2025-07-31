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

import { type TreeNodeCustomData } from '@/components/variable-tree/type';

export const ParamChannel = (props: { value: TreeNodeCustomData }) => {
  const { value } = props;
  return value.effectiveChannelList?.length ? (
    <div className="coz-stroke-primary text-[14px] font-[500] leading-[20px]">
      {value.effectiveChannelList?.join(',') ?? '--'}
    </div>
  ) : null;
};
