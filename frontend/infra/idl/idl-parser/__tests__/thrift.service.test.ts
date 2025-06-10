import * as t from '../src/thrift';

describe('ferry-parser', () => {
  describe('thrift service', () => {
    it('should convert service extenstions', () => {
      const idl = `
      service Foo {
      } (api.uri_prefix = 'https://example.com')
      `;

      const expected = { uri_prefix: 'https://example.com' };
      const document = t.parse(idl);
      const { extensionConfig } = document.body[0] as t.ServiceDefinition;
      return expect(extensionConfig).to.eql(expected);
    });
  });
});
