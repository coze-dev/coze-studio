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

import { getUIModeByBizScene } from '../../src/utils/get-ui-mode-by-biz-scene';

describe('ItemType', () => {
  it('returns UIMode correctly', () => {
    const res1 = getUIModeByBizScene({
      bizScene: 'agentApp',
      showBackground: false,
    });

    const res2 = getUIModeByBizScene({
      bizScene: 'home',
      showBackground: false,
    });

    const res3 = getUIModeByBizScene({
      bizScene: 'agentApp',
      showBackground: false,
    });

    expect(res1).toBe('grey');
    expect(res2).toBe('white');
    expect(res3).toBe('grey');
  });
});
