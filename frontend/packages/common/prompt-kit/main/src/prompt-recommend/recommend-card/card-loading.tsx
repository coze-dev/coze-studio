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

import { Skeleton } from '@coze-arch/coze-design';
export const RecommendCardLoading = () => (
  <div className="flex flex-col flex-shrink-0 flex-nowrap px-3 py-2 aspect-[180/120] rounded-lg border coz-stroke-primary coz-bg-max">
    <Skeleton
      placeholder={<Skeleton.Title />}
      className="mb-3 w-2/3"
    ></Skeleton>
    <Skeleton
      placeholder={<Skeleton.Paragraph rows={3} />}
      className="w-full"
    ></Skeleton>
  </div>
);
