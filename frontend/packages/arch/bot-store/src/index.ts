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

export {
  /** @Deprecated This usage method is deprecated, please use the method exported by @code-arch/foundation-sdk in the future*/
  useSpaceStore,
  /** @Deprecated This usage method is deprecated, please use the method exported by @code-arch/foundation-sdk in the future*/
  useSpace,
  /** @Deprecated This usage method is deprecated, please use the method exported by @code-arch/foundation-sdk in the future*/
  useSpaceList,
} from '@coze-foundation/space-store';

export { useAuthStore } from './auth';

/** @Deprecated - problem with persistence scheme, deprecated */
export { clearStorage } from './utils/get-storage';

export { useSpaceGrayStore, TccKey } from './space-gray';
