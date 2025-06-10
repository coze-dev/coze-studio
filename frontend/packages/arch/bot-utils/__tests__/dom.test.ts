import { openNewWindow } from '../src/dom';

it('openNewWindow', async () => {
  const testUrl = 'test_url';
  const testOrigin = 'test_origin';

  const newWindow = {
    close: vi.fn(),
    location: '',
  };
  vi.stubGlobal('window', {
    open: vi.fn(() => newWindow),
  });
  vi.stubGlobal('location', {
    origin: testOrigin,
  });

  const cb = vi.fn(() => Promise.resolve(testUrl));
  const cbWithError = vi.fn(() => Promise.reject(new Error()));
  await openNewWindow(cb);
  expect(newWindow.close).not.toHaveBeenCalled();
  expect(newWindow.location).equal(testUrl);

  await openNewWindow(cbWithError);
  expect(newWindow.close).toHaveBeenCalled();
  expect(newWindow.location).equal(`${testOrigin}/404`);

  vi.clearAllMocks();
});
