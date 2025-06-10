import { SpaceRoleType, SpaceType } from '@coze-arch/idl/developer_api';

import {
  EProjectPermission,
  ProjectRoleType,
} from '../../src/project/constants';
import { calcPermission } from '../../src/project/calc-permission';

describe('calcPermission', () => {
  it('should return true for personal space with valid permission', () => {
    const result = calcPermission(EProjectPermission.View, {
      projectRoles: [],
      spaceRoles: [],
      spaceType: SpaceType.Personal,
    });
    expect(result).toBe(true);
  });

  it('should return false for personal space with invalid permission', () => {
    const result = calcPermission(EProjectPermission.ADD_COLLABORATOR, {
      projectRoles: [],
      spaceRoles: [],
      spaceType: SpaceType.Personal,
    });
    expect(result).toBe(false);
  });

  it('should return true for team space with project role permission', () => {
    const result = calcPermission(EProjectPermission.DELETE, {
      projectRoles: [ProjectRoleType.Owner],
      spaceRoles: [],
      spaceType: SpaceType.Team,
    });
    expect(result).toBe(true);
  });

  it('should return false for team space with invalid project role permission', () => {
    const result = calcPermission(EProjectPermission.DELETE, {
      projectRoles: [ProjectRoleType.Editor],
      spaceRoles: [],
      spaceType: SpaceType.Team,
    });
    expect(result).toBe(false);
  });

  it('should return true for team space with space role permission', () => {
    const result = calcPermission(EProjectPermission.COPY, {
      projectRoles: [],
      spaceRoles: [SpaceRoleType.Member],
      spaceType: SpaceType.Team,
    });
    expect(result).toBe(true);
  });

  it('should return false for team space with invalid space role permission', () => {
    const result = calcPermission(EProjectPermission.DELETE, {
      projectRoles: [],
      spaceRoles: [SpaceRoleType.Member],
      spaceType: SpaceType.Team,
    });
    expect(result).toBe(false);
  });

  it('should return true for team space with both project and space role permissions', () => {
    const result = calcPermission(EProjectPermission.PUBLISH, {
      projectRoles: [ProjectRoleType.Editor],
      spaceRoles: [SpaceRoleType.Member],
      spaceType: SpaceType.Team,
    });
    expect(result).toBe(false);
  });

  it('should return false for team space with no valid permissions', () => {
    const result = calcPermission(EProjectPermission.DELETE, {
      projectRoles: [ProjectRoleType.Editor],
      spaceRoles: [SpaceRoleType.Default],
      spaceType: SpaceType.Team,
    });
    expect(result).toBe(false);
  });
});
