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
  describe('thrift const', () => {
    it('should parse string const', () => {
      const content = `
      const string a = '1';
      `;

      const document = t.parse(
        'index.thrift',
        { cache: false },
        { 'index.thrift': content },
      );
      const { fieldType, initializer } = document
        .statements[0] as t.ConstDefinition;
      expect((fieldType as t.BaseType).type).to.eql(t.SyntaxType.StringKeyword);
      expect((initializer as t.StringLiteral).value).to.equal('1');
    });

    it('should parse list const', () => {
      const content = `
      const list<i32> b = [1]
      `;

      const document = t.parse(
        'index.thrift',
        { cache: false },
        { 'index.thrift': content },
      );
      const { fieldType, initializer } = document
        .statements[0] as t.ConstDefinition;
      expect(((fieldType as t.ListType).valueType as t.BaseType).type).to.eql(
        t.SyntaxType.I32Keyword,
      );
      expect(
        ((initializer as t.ConstList).elements[0] as t.IntConstant).value.value,
      ).to.equal('1');
    });

    it('should parse map const', () => {
      const content = `
      const map<string, i32> c = {'m': 1}
      `;

      const document = t.parse(
        'index.thrift',
        { cache: false },
        { 'index.thrift': content },
      );
      const { fieldType, initializer } = document
        .statements[0] as t.ConstDefinition;
      expect(((fieldType as t.MapType).valueType as t.BaseType).type).to.eql(
        t.SyntaxType.I32Keyword,
      );
      expect(
        ((initializer as t.ConstMap).properties[0].initializer as t.IntConstant)
          .value.value,
      ).to.equal('1');
    });

    it('should not resolve const name', () => {
      const content = `
      const string a = '1';
      `;

      const document = t.parse(
        'index.thrift',
        { cache: false, namespaceRefer: false },
        {
          'index.thrift': content,
        },
      );

      const { name } = document.statements[0] as t.ConstDefinition;
      return expect(filterKeys(name, ['value', 'namespaceValue'])).to.eql({
        value: 'a',
        namespaceValue: undefined,
      });
    });
  });

  describe('thrift typedef', () => {
    it('should resolve typedef', () => {
      const baseContent = `
      namespace go unify_base
      `;
      const indexContent = `
      include 'base.thrift'
      typedef base.Foo MyFoo
      typedef Bar MyBar
      `;

      const document = t.parse(
        'index.thrift',
        { cache: false },
        {
          'index.thrift': indexContent,
          'base.thrift': baseContent,
        },
      );

      const { name: name0, definitionType: definitionType0 } = document
        .statements[0] as t.TypedefDefinition;
      const { definitionType: definitionType1 } = document
        .statements[1] as t.TypedefDefinition;
      expect(filterKeys(name0, ['value', 'namespaceValue'])).to.eql({
        value: 'MyFoo',
        namespaceValue: 'root.MyFoo',
      });

      expect(filterKeys(definitionType0, ['value', 'namespaceValue'])).to.eql({
        value: 'base.Foo',
        namespaceValue: 'unify_base.Foo',
      });

      expect(filterKeys(definitionType1, ['value', 'namespaceValue'])).to.eql({
        value: 'Bar',
        namespaceValue: 'root.Bar',
      });
    });
  });
});
