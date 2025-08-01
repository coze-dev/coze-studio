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

import { getImageDisplayAttribute } from '../../src/utils/image/get-image-display-attribute';

// Test Suite
describe('getImageDisplayAttribute', () => {
  // Test case: Long horizontal graph
  it('should return cover attributes for a wide image', () => {
    const contentWidth = 500;
    const result = getImageDisplayAttribute(600, 100, contentWidth);
    expect(result).toEqual({
      displayHeight: 120,
      displayWidth: contentWidth,
      isCover: true,
    });
  });

  // Test Case: Long Vertical Diagram
  it('should return cover attributes for a tall image', () => {
    const contentWidth = 500;
    const result = getImageDisplayAttribute(100, 600, contentWidth);
    expect(result).toEqual({
      displayHeight: 240,
      displayWidth: 120,
      isCover: true,
    });
  });

  // Test Case: Symmetric Display Diagram
  it('should return proportional attributes for an image', () => {
    const contentWidth = 500;
    const result = getImageDisplayAttribute(240, 240, contentWidth);
    expect(result).toEqual({
      displayHeight: 240,
      displayWidth: 240,
      isCover: false,
    });
  });

  // Test Case: Medium and Long Horizontal Graphs
  it('should return proportional attributes for a medium-wide image', () => {
    const contentWidth = 500;
    const result = getImageDisplayAttribute(500, 250, contentWidth);
    expect(result).toEqual({
      displayWidth: 480,
      displayHeight: 240,
      isCover: false,
    });
  });

  // Test Case: Small Size Diagram
  it('should return actual dimensions for a small image', () => {
    const contentWidth = 500;
    const result = getImageDisplayAttribute(200, 150, contentWidth);
    expect(result).toEqual({
      displayHeight: 150,
      displayWidth: 200,
      isCover: false,
    });
  });

  // ... More test cases
});
