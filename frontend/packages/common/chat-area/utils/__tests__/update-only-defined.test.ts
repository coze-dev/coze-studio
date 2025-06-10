import { expect, it, vi } from 'vitest';

import { updateOnlyDefined } from '../src/update-only-defined';

it('update only defined', () => {
  const updater = vi.fn();
  updateOnlyDefined(updater, {
    a: undefined,
    b: 1,
  });
  expect(updater.mock.calls[0][0]).toMatchObject({
    b: 1,
  });
});

it('do not run updater if item value is only undefined', () => {
  const updater = vi.fn();
  updateOnlyDefined(updater, {
    a: undefined,
    b: undefined,
  });
  expect(updater.mock.calls.length).toBe(0);
});
