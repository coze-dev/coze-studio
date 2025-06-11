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
