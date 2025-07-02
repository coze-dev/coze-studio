import { parseHashOrQuery } from '../parse-hash-or-query';

const baseQuery = 'keyA=123&keyB=false&keyC=test&%3F!a=%3F!a';
const expectResult = {
  keyA: '123',
  keyB: 'false',
  keyC: 'test',
  '?!a': '?!a',
};

// 老版本 parseHashOrQuery 实现，验证一下输出一致
const parseHashOrQueryOld = (hashFragmentOrQueryString: string) => {
  const targetString =
    hashFragmentOrQueryString.startsWith('#') ||
    hashFragmentOrQueryString.startsWith('?')
      ? hashFragmentOrQueryString.slice(1)
      : hashFragmentOrQueryString;

  const params: Record<string, string> = {};

  const regex = /([^&=]+)=([^&]*)/g;

  let matchResult: RegExpExecArray | null = null;

  // eslint-disable-next-line no-cond-assign
  while ((matchResult = regex.exec(targetString))) {
    const [, key, value] = matchResult;
    params[decodeURIComponent(key)] = decodeURIComponent(value);
  }

  return params;
};

describe('parseHashOrQuery', () => {
  it('parse query string starts with `?`', () => {
    const query = `?${baseQuery}`;
    const newRes = parseHashOrQuery(query);
    expect(newRes).toEqual(expectResult);
    expect(parseHashOrQueryOld(query)).toEqual(newRes);
  });

  it('parse hash starts with `#`', () => {
    const query = `#${baseQuery}`;
    const newRes = parseHashOrQuery(query);
    expect(newRes).toEqual(expectResult);
    expect(parseHashOrQueryOld(query)).toEqual(newRes);
  });

  it('parse plain string', () => {
    const newRes = parseHashOrQuery(baseQuery);
    expect(newRes).toEqual(expectResult);
    expect(parseHashOrQueryOld(baseQuery)).toEqual(newRes);
  });
});
