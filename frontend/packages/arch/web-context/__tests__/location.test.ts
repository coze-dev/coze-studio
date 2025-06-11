import { redirect } from '../src/location';

const viHrefSetter = vi.fn();
vi.stubGlobal('location', {
  _href: '',
  set href(v: string) {
    viHrefSetter(v);
    (this as any)._href = v;
  },
  get href() {
    return (this as any)._href;
  },
});

describe('location', () => {
  test('redirect', () => {
    redirect('test');
    expect(viHrefSetter).toHaveBeenCalledWith('test');
    expect(location.href).equal('test');
  });
});
