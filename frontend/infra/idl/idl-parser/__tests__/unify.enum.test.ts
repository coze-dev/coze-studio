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

import * as t from '../src';
import { filterKeys } from './common';

describe('unify-parser', () => {
  describe('thrift enum', () => {
    it('should convert enum', () => {
      const content = `
      enum Number {
        ONE = 1,
        TWO,
      }
      `;

      const document = t.parse(
        'index.thrift',
        { cache: false },
        { 'index.thrift': content },
      );
      const { members } = document.statements[0] as t.EnumDefinition;
      return expect(members.length).to.eql(2);
    });

    it('should resolve enum name', () => {
      const content = `
      enum Number {
        ONE = 1,
        TWO,
      }
      `;

      const document = t.parse(
        'index.thrift',
        { cache: false },
        { 'index.thrift': content },
      );
      const { name } = document.statements[0] as t.EnumDefinition;
      expect(filterKeys(name, ['value', 'namespaceValue'])).to.eql({
        value: 'Number',
        namespaceValue: 'root.Number',
      });
    });

    it('should not resolve enum name', () => {
      const content = `
      enum Number {
        ONE = 1,
        TWO,
      }
      `;

      const document = t.parse(
        'index.thrift',
        { namespaceRefer: false, cache: false },
        { 'index.thrift': content },
      );
      const { name } = document.statements[0] as t.EnumDefinition;
      expect(filterKeys(name, ['value', 'namespaceValue'])).to.eql({
        value: 'Number',
        namespaceValue: undefined,
      });
    });

    it('should revise enum comments', () => {
      const content = `
      enum Number {
        // c1
        ONE = 1, // c2
        /* c3 */
        TWO,/* c4 */
        // c5
        /* c6 */
        FOUR = 4; // c7
        /* c8
        c9 */
        FIVE;
        SIX,
      }
      `;

      const expected = [
        ['c1', 'c2'],
        [['c3'], ['c4']],
        ['c5', ['c6'], 'c7'],
        [['c8', ' c9']],
        [],
      ];

      const document = t.parse(
        'index.thrift',
        { cache: false },
        { 'index.thrift': content },
      );
      const { members } = document.statements[0] as t.EnumDefinition;
      const comments = members.map(field =>
        field.comments.map(comment => comment.value),
      );

      return expect(comments).to.eql(expected);
    });

    it('should revise enum comments without dot', () => {
      const content = `
      enum Number {
        // c1
        ONE = 1 // c2
        /* c3 */
        TWO/* c4 */
        // c5
        /* c6 */
        FOUR = 4 // c7
        /* c8
        c9 */
        FIVE
        SIX
      }
      `;

      const expected = [
        ['c1', 'c2'],
        [['c3'], ['c4']],
        ['c5', ['c6'], 'c7'],
        [['c8', ' c9']],
        [],
      ];

      const document = t.parse(
        'index.thrift',
        { cache: false },
        { 'index.thrift': content },
      );
      const { members } = document.statements[0] as t.EnumDefinition;
      const comments = members.map(field =>
        field.comments.map(comment => comment.value),
      );

      return expect(comments).to.eql(expected);
    });
  });

  describe('proto enum', () => {
    it('should convert enum', () => {
      const content = `
      enum Number {
        ONE = 1;
        TWO = 2;
      }
      `;

      const document = t.parse(
        'index.proto',
        { cache: false },
        { 'index.proto': content },
      );
      const { members } = document.statements[0] as t.EnumDefinition;
      return expect(members.length).to.eql(2);
    });
  });
});
