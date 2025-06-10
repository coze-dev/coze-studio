import { userStoreService } from '../src/index';

describe('userStoreService', () => {
  it('should be defined', () => {
    expect(userStoreService).toBeDefined();
  });
  it('provide api', () => {
    expect(Object.keys(userStoreService)).toEqual([
      'getIsSettled',
      'getIsLogined',
      'getUserInfo',
      'getUserAuthInfos',
      'useIsSettled',
      'useIsLogined',
      'useUserInfo',
      'useUserAuthInfo',
      'useUserLabel',
      'subscribeUserAuthInfos',
    ]);
  });
});
