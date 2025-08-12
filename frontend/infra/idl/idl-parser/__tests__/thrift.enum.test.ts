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

import * as t from '../src/thrift';

describe('ferry-parser', () => {
  describe('thrift enum', () => {
    it('should convert enum member comments', () => {
      const idl = `
      enum Bar {
        // c1
        ONE = 1, // c2
        /* c3 */
        TWO = 2, /* c4 */
        // c5
        /* c6 */
        THTEE = 3, // c7
        /* c8
        c9 */
        FOUR = 4
        // c10
        FIVE = 5; /* c11 */
      }
      `;

      const expected = [
        ['c1', 'c2'],
        [['c3'], ['c4']],
        ['c5', ['c6'], 'c7'],
        [['c8', ' c9']],
        ['c10', ['c11']],
      ];

      const document = t.parse(idl);
      const { members } = document.body[0] as t.EnumDefinition;
      const comments = members.map(member =>
        member.comments.map(comment => comment.value),
      );
      return expect(comments).to.eql(expected);
    });
  });
});
