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

import { findNearestAnchor } from '../src/utils/helper/find-nearest-link-node';

describe('findNearestAnchor', () => {
  // Setting up the DOM environment
  document.body.innerHTML = `
    <div>
      <a id="anchor1" href="#">
        <span id="spanInsideAnchor">Text inside anchor</span>
      </a>
    </div>
    <div>
      <span id="spanOutsideAnchor">Text outside anchor</span>
    </div>
    <a id="anchor2" href="#">Another anchor</a>
  `;

  const spanInsideAnchor = document.getElementById('spanInsideAnchor') as Node;
  const spanOutsideAnchor = document.getElementById(
    'spanOutsideAnchor',
  ) as Node;
  const anchor1 = document.getElementById('anchor1') as Node;
  const anchor2 = document.getElementById('anchor2') as Node;

  it('should return the nearest anchor node when called from a descendant node', () => {
    const result = findNearestAnchor(spanInsideAnchor);
    expect(result).toBe(anchor1);
  });

  it('should return the node itself if it is an anchor', () => {
    const result = findNearestAnchor(anchor2);
    expect(result).toBe(anchor2);
  });

  it('should return null if there is no anchor ancestor', () => {
    const result = findNearestAnchor(spanOutsideAnchor);
    expect(result).toBeNull();
  });
});
