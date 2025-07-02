import { describe, it, expect } from 'vitest';

import { URI } from './uri';

describe('uri', () => {
  it('toString', () => {
    const uris = [
      'https://www.abc.com/',
      'file:///root/abc',
      'file:///root/abc?query=1',
      'file:///root/abc?query=1#fragment',
      'abc:///root/abc',
      'abc:///project/:projectId/job/:jobId',
    ];
    for (const uriStr of uris) {
      expect(new URI(uriStr).toString()).toEqual(uriStr);
    }
  });
});
