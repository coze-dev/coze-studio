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

import FaviconBase from './favicon-base.png';
import FaviconAddon from './favicon-addon.png';

export const Favicon = () => (
  <div className="relative flex items-center">
    <img
      src={FaviconBase}
      className="w-[100px] h-[100px] rounded-[21px] border border-solid coz-stroke-plus"
    />
    <img
      src={FaviconAddon}
      className="absolute left-1/2 translate-x-[34px] top-[40px] w-[51px]"
    />
  </div>
);
