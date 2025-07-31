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

import { ArrayUtil } from '../src/array';

describe('array', () => {
  it('array2Map', () => {
    const testItem1 = { id: '1', name: 'Alice', age: 20 };
    const testItem2 = { id: '2', name: 'Bob', age: 25 };
    const { array2Map } = ArrayUtil;
    const array1 = [testItem1, testItem2];

    const mapById = array2Map(array1, 'id');
    expect(mapById).toEqual({
      '1': testItem1,
      '2': testItem2,
    });

    const mapByName = array2Map(array1, 'name', 'age');
    expect(mapByName).toEqual({ Alice: 20, Bob: 25 });

    const array = [testItem1, testItem2];
    const mapByIdFunc = array2Map(
      array,
      'id',
      item => `${item.name}-${item.age}`,
    );
    expect(mapByIdFunc).toEqual({ '1': 'Alice-20', '2': 'Bob-25' });
  });

  it('mapAndFilter', () => {
    const { mapAndFilter } = ArrayUtil;
    const array = [
      { id: 1, name: 'Alice', value: 100 },
      { id: 2, name: 'Bob', value: 200 },
    ];

    // filter
    const result1 = mapAndFilter(array, {
      filter: item => item.name === 'Alice',
    });
    expect(result1).toEqual([{ id: 1, name: 'Alice', value: 100 }]);

    // map
    const result2 = mapAndFilter(array, {
      map: item => ({ value: item.value }),
    });
    expect(result2).toEqual([{ value: 100 }, { value: 200 }]);

    // filter & map
    const result3 = mapAndFilter(array, {
      filter: item => item.value > 100,
      map: item => ({ id: item.id, name: item.name }),
    });
    expect(result3).toEqual([{ id: 2, name: 'Bob' }]);
  });
});
