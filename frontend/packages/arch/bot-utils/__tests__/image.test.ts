import { loadImage } from '../src/image';

describe('image', () => {
  test('loadImage with success', async () => {
    vi.stubGlobal(
      'Image',
      class Image {
        onload!: () => void;
        set src(url: string) {
          this.onload();
        }
      },
    );
    await expect(loadImage('test')).resolves.toBeUndefined();
    vi.clearAllMocks();
  });

  test('loadImage with fail', async () => {
    vi.stubGlobal(
      'Image',
      class Image {
        onerror!: () => void;
        set src(url: string) {
          this.onerror();
        }
      },
    );
    await expect(loadImage('test')).rejects.toBeUndefined();
    vi.clearAllMocks();
  });
});
