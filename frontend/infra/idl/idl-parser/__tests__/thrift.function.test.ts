import * as t from '../src/thrift';

describe('ferry-parser', () => {
  describe('thrift function', () => {
    it('should convert function extenstions', () => {
      const idl = `
      service Foo {
        BizResponse Biz1(1: BizRequest req) (api.uri = '/api/biz1')
        BizResponse Biz2(1: BizRequest req) (
          api.uri = '/api/biz2',
          api.serializer = 'json',
          api.method = 'POST',
          api.group="user"
        )
        BizResponse Biz3(1: BizRequest req) (api.get = '/api/biz3', api.serializer='form')
        BizResponse Biz4(1: BizRequest req) (api.post = '/api/biz4', api.serializer='urlencoded')
        BizResponse Biz5(1: BizRequest req) (api.put = '/api/biz5', api.method = 'post')
        BizResponse Biz6(1: BizRequest req) (api.delete = '/api/biz6', api.serializer='wow')
        BizResponse Biz7(1: BizRequest req)
      }
      `;

      const expected = [
        { uri: '/api/biz1' },
        {
          uri: '/api/biz2',
          serializer: 'json',
          method: 'POST',
          group: 'user',
        },
        { method: 'GET', uri: '/api/biz3', serializer: 'form' },
        { method: 'POST', uri: '/api/biz4', serializer: 'urlencoded' },
        { method: 'PUT', uri: '/api/biz5' },
        { method: 'DELETE', uri: '/api/biz6' },
        undefined,
      ];

      const document = t.parse(idl);
      const { functions } = document.body[0] as t.ServiceDefinition;
      const extensionConfigs = functions.map(func => func.extensionConfig);
      return expect(extensionConfigs).to.eql(expected);
    });

    it('should convert function extenstions using agw specification', () => {
      const idl = `
      service Foo {
        BizResponse Biz1(1: BizRequest req) (agw.uri = '/api/biz1')
        BizResponse Biz2(1: BizRequest req) (
          agw.uri = '/api/biz2',
          agw.method = 'POST',
        )
      }
      `;

      const expected = [
        { uri: '/api/biz1' },
        { uri: '/api/biz2', method: 'POST' },
      ];

      const document = t.parse(idl, { reviseTailComment: false });
      const { functions } = document.body[0] as t.ServiceDefinition;
      const extensionConfigs = functions.map(func => func.extensionConfig);
      return expect(extensionConfigs).to.eql(expected);
    });

    it('should revise function comments', () => {
      const idl = `
      service Foo {
        // c1
        BizResponse Biz1(1: BizRequest req) // c2
        /* c3 */
        BizResponse Biz2(1: BizRequest req) /* c4 */
        // c5
        /* c6 */
        BizResponse Biz3(1: BizRequest req) // c7
        /* c8
        c9 */
        BizResponse Biz4(1: BizRequest req)
        // c10
        BizResponse Biz5(1: BizRequest req); /* c11 */
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
      const { functions } = document.body[0] as t.ServiceDefinition;
      const comments = functions.map(func =>
        func.comments.map(comment => comment.value),
      );
      return expect(comments).to.eql(expected);
    });
  });
});
