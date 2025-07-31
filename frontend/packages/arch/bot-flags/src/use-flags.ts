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

import { useState, useEffect } from 'react';

import { featureFlagStorage } from './utils/storage';
import { type FEATURE_FLAGS } from './types';
import { getFlags } from './get-flags';

export const useFlags = (): [FEATURE_FLAGS] => {
  const plainFlags = getFlags();
  // Listens to the fg store event and triggers the react component to respond to changes
  const [, setTick] = useState<number>(0);

  useEffect(() => {
    const cb = () => {
      setTick(Date.now());
    };
    featureFlagStorage.on('change', cb);
    return () => {
      featureFlagStorage.off('change', cb);
    };
  }, []);

  return [plainFlags];
};
