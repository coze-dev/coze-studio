import * as t from '../src';
import { filterKeys } from './common';

describe('unify-parser', () => {
  describe('thrift service', () => {
    it('should convert service extenstions', () => {
      const fileContent = `
      service Foo {
      } (api.uri_prefix = 'https://example.com')
      `;

      const document = t.parse(
        'index.thrift',
        { cache: false },
        { 'index.thrift': fileContent },
      );
      const { extensionConfig, name } = document
        .statements[0] as t.ServiceDefinition;
      expect(extensionConfig).to.eql({ uri_prefix: 'https://example.com' });
      expect(filterKeys(name, ['value', 'namespaceValue'])).to.eql({
        value: 'Foo',
        namespaceValue: 'root.Foo',
      });
    });
  });

  describe('proto service', () => {
    it('should convert service extenstions', () => {
      const fileContent = `
      syntax = "proto3";
      service Foo {
        option (api.uri_prefix) = "//example.com";
      }
      `;

      const document = t.parse(
        'index.proto',
        { cache: false },
        { 'index.proto': fileContent },
      );
      const { extensionConfig, name } = document
        .statements[0] as t.ServiceDefinition;
      expect(extensionConfig).to.eql({ uri_prefix: '//example.com' });
      expect(filterKeys(name, ['value', 'namespaceValue'])).to.eql({
        value: 'Foo',
        namespaceValue: 'root.Foo',
      });
    });
  });
});
