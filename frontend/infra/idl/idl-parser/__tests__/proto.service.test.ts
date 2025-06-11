import * as t from '../src/proto';

describe('ferry-parser', () => {
  describe('proto service', () => {
    it('should convert service extenstions', () => {
      const idl = `
      syntax = "proto3";
      service Foo {
        option (api.uri_prefix) = "//example.com";
      }
      `;

      const expected = { uri_prefix: '//example.com' };
      const document = t.parse(idl);
      const Foo = (document.root.nested || {}).Foo as t.ServiceDefinition;
      return expect(Foo.extensionConfig).to.eql(expected);
    });

    it('should convert service extenstions with package', () => {
      const idl = `
      syntax = "proto3";
      package example;
      service Foo {
        option (api.uri_prefix) = "//example.com";
      }
      `;

      const expected = { uri_prefix: '//example.com' };
      const document = t.parse(idl);
      const Foo = ((document.root.nested || {}).example.nested || {})
        .Foo as t.ServiceDefinition;
      return expect(Foo.extensionConfig).to.eql(expected);
    });
  });
});
