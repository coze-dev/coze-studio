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

/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ExternalStore } from './external-store';
import type { FeatureRegistry } from '.';

class FeatureRegistryManager extends ExternalStore<
  Set<FeatureRegistry<any, any, any>>
> {
  protected _state = new Set<FeatureRegistry<any, any, any>>();

  add(featureRegistry: FeatureRegistry<any, any, any>) {
    this._produce(draft => {
      draft.add(featureRegistry);
    });
  }

  delete(featureRegistry: FeatureRegistry<any, any, any>) {
    this._produce(draft => {
      draft.delete(featureRegistry);
    });
  }
}

/**
 * FeatureRegistryManager instance for registering and unregistering FeatureRegistry. It will be written to this instance when FeatureRegistry is initialized during development, which is convenient for debugging.
 */
export const featureRegistryManager = new FeatureRegistryManager();
