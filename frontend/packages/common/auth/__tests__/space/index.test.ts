import { SpaceRoleType } from '@coze-arch/idl/developer_api';

import { ESpacePermisson } from '../../src/space/constants';
import { calcPermission } from '../../src/space/calc-permission';

describe('calcPermission', () => {
  it('should return true for Owner role with UpdateSpace permission', () => {
    expect(
      calcPermission(ESpacePermisson.UpdateSpace, [SpaceRoleType.Owner]),
    ).toBe(true);
  });

  it('should return true for Admin role with RemoveSpaceMember permission', () => {
    expect(
      calcPermission(ESpacePermisson.RemoveSpaceMember, [SpaceRoleType.Admin]),
    ).toBe(true);
  });

  it('should return true for Member role with ExitSpace permission', () => {
    expect(
      calcPermission(ESpacePermisson.ExitSpace, [SpaceRoleType.Member]),
    ).toBe(true);
  });

  it('should return false for Member role with UpdateSpace permission', () => {
    expect(
      calcPermission(ESpacePermisson.UpdateSpace, [SpaceRoleType.Member]),
    ).toBe(false);
  });

  it('should return true for multiple roles with overlapping permissions', () => {
    expect(
      calcPermission(ESpacePermisson.ExitSpace, [
        SpaceRoleType.Admin,
        SpaceRoleType.Member,
      ]),
    ).toBe(true);
  });

  it('should return false for unknown role', () => {
    expect(
      calcPermission(ESpacePermisson.UpdateSpace, [
        'UnknownRole' as unknown as SpaceRoleType,
      ]),
    ).toBe(false);
  });

  it('should return false for no roles', () => {
    expect(calcPermission(ESpacePermisson.UpdateSpace, [])).toBe(false);
  });
});
