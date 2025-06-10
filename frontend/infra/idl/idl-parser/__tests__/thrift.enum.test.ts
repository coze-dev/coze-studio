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
