import { expect, describe, test } from 'vitest';

import { isValidUrl, completeUrl } from '../src/url';

describe('url utils', () => {
  test('isValidUrl', () => {
    expect(isValidUrl('')).toBeFalsy();
    expect(isValidUrl('test.com')).toBeFalsy();
    expect(isValidUrl('http:test.2333.com')).toBeFalsy();
    expect(isValidUrl('https:test.2333.com')).toBeFalsy();
    expect(isValidUrl('http://test.2333.com')).toBeTruthy();
    expect(isValidUrl('https://test.2333.com')).toBeTruthy();
    expect(isValidUrl('https://test.c')).toBeFalsy();
    expect(isValidUrl('https://test.com')).toBeTruthy();
    expect(isValidUrl('https://test.com/')).toBeTruthy();
    expect(isValidUrl('https://test.club')).toBeTruthy();
    expect(
      isValidUrl(
        'https://mock.apifox.com/m1/793747-0-default/get_student_infos?apifoxApiId=159058215',
      ),
    ).toBeTruthy();
  });
  test('completeUrl', () => {
    expect(completeUrl('')).toBe('http://');
    expect(completeUrl('test.com')).toBe('http://test.com');
  });
});
