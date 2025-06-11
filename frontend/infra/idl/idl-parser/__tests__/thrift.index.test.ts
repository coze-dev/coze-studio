import * as path from 'path';

import * as t from '../src/thrift';

describe('ferry-parser', () => {
  describe('thrift index', () => {
    it('should convert the file content', () => {
      const idl = path.resolve(__dirname, 'idl/index.thrift');
      const expected = { uri_prefix: 'https://example.com' };

      const document = t.parse(idl);
      const { extensionConfig } = document.body[0] as t.ServiceDefinition;
      return expect(extensionConfig).to.eql(expected);
    });

    it('should throw an error due to invalid file path', () => {
      const idl = path.resolve(__dirname, 'idl/indexx.thrift');

      try {
        t.parse(idl);
      } catch (err) {
        const { message } = err;
        return expect(message).to.includes('no such file:');
      }

      return expect(true).to.equal(false);
    });

    it('should throw an syntax error', () => {
      const idl = `
      struct Foo {
        1: string k1,,
      }
  `;

      const expected = 'FieldType expected but found: CommaToken(source:3:';

      try {
        t.parse(idl);
      } catch (err) {
        const { message } = err;
        return expect(message).to.include(expected);
      }

      return expect(true).to.equal(false);
    });

    it('should throw an syntax error in the file content', () => {
      const idl = path.resolve(__dirname, 'idl/error.thrift');

      const expected = '__tests__/idl/error.thrift:2:16)';

      try {
        t.parse(idl);
      } catch (err) {
        const { message } = err;
        return expect(message).includes(expected);
      }

      return expect(true).equal(false);
    });
  });
});
