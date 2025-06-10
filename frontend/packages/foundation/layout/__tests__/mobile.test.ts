import './setup-vitest';
import { useSignMobileStore } from '../src/store';

describe('useSignMobileStore', () => {
  it('should init with default state', () => {
    const state = useSignMobileStore.getState();
    expect(state.mobileTips).toEqual(false);
  });

  it('setMobileTips', () => {
    useSignMobileStore.getState().setMobileTips(true);
    expect(useSignMobileStore.getState().mobileTips).toEqual(true);
  });
});
