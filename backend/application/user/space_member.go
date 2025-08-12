/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package user

import (
	"context"
	"strconv"

	"github.com/coze-dev/coze-studio/backend/api/model/space"
	"github.com/coze-dev/coze-studio/backend/api/model/space_member"
	"github.com/coze-dev/coze-studio/backend/application/base/ctxutil"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

// GetSpaceMembers 获取空间成员列表
func (u *UserApplicationService) GetSpaceMembers(ctx context.Context, req *space_member.GetSpaceMembersRequest) (
	resp *space_member.GetSpaceMembersResponse, err error,
) {
	operatorID := ctxutil.MustGetUIDFromCtx(ctx)

	// 检查操作者权限
	isMember, _, _, _, err := u.DomainSVC.CheckMemberPermission(ctx, req.SpaceID, operatorID)
	if err != nil {
		return nil, errorx.WrapByCode(err, errno.ErrUserInvalidParamCode, errorx.KV("msg", "check permission failed"))
	}
	if !isMember {
		return nil, errorx.New(errno.ErrUserPermissionCode, errorx.KV("msg", "not a member of this space"))
	}

	// 设置默认分页参数
	page := int32(1)
	pageSize := int32(20)
	if req.Page != nil && *req.Page > 0 {
		page = *req.Page
	}
	if req.PageSize != nil && *req.PageSize > 0 && *req.PageSize <= 100 {
		pageSize = *req.PageSize
	}

	// 获取成员列表
	members, total, err := u.DomainSVC.GetSpaceMembers(ctx, req.SpaceID, page, pageSize, req.RoleType)
	if err != nil {
		return nil, errorx.WrapByCode(err, errno.ErrUserInvalidParamCode, errorx.KV("msg", "get space members failed"))
	}

	// 转换为响应格式
	spaceMemberList := make([]*space_member.SpaceMember, len(members))
	for i, member := range members {
		spaceMemberList[i] = &space_member.SpaceMember{
			ID:      member.ID,
			SpaceID: member.SpaceID,
			UserID:  member.UserID,
			UserInfo: &space_member.UserInfo{
				UserID:     member.User.UserID,
				Name:       member.User.Name,
				UniqueName: member.User.UniqueName,
				Email:      member.User.Email,
				AvatarURL:  &member.User.IconURL,
				CreatedAt:  member.User.CreatedAt,
			},
			RoleType:  int32(member.RoleType),
			RoleName:  member.RoleType.GetRoleName(),
			CreatedAt: member.CreatedAt,
			UpdatedAt: member.UpdatedAt,
		}
	}

	return &space_member.GetSpaceMembersResponse{
		Code:     0,
		Msg:      "success",
		Data:     spaceMemberList,
		Total:    int32(total),
		Page:     page,
		PageSize: pageSize,
	}, nil
}

// SearchUsers 搜索用户
func (u *UserApplicationService) SearchUsers(ctx context.Context, req *space_member.SearchUsersRequest) (
	resp *space_member.SearchUsersResponse, err error,
) {
	operatorID := ctxutil.MustGetUIDFromCtx(ctx)

	// 检查操作者权限
	isMember, _, canInvite, _, err := u.DomainSVC.CheckMemberPermission(ctx, req.SpaceID, operatorID)
	if err != nil {
		return nil, errorx.WrapByCode(err, errno.ErrUserInvalidParamCode, errorx.KV("msg", "check permission failed"))
	}
	if !isMember || !canInvite {
		return nil, errorx.New(errno.ErrUserPermissionCode, errorx.KV("msg", "no permission to invite members"))
	}

	// 设置默认限制
	limit := int32(10)
	if req.Limit != nil && *req.Limit > 0 && *req.Limit <= 50 {
		limit = *req.Limit
	}

	// 搜索用户
	users, err := u.DomainSVC.SearchUsers(ctx, req.Keyword, req.SpaceID, limit)
	if err != nil {
		return nil, errorx.WrapByCode(err, errno.ErrUserInvalidParamCode, errorx.KV("msg", "search users failed"))
	}

	// 转换为响应格式
	userInfoList := make([]*space_member.UserInfo, len(users))
	for i, user := range users {
		userInfoList[i] = &space_member.UserInfo{
			UserID:     user.UserID,
			Name:       user.Name,
			UniqueName: user.UniqueName,
			Email:      user.Email,
			AvatarURL:  &user.IconURL,
			CreatedAt:  user.CreatedAt,
		}
	}

	return &space_member.SearchUsersResponse{
		Code: 0,
		Msg:  "success",
		Data: userInfoList,
	}, nil
}

// InviteMember 邀请成员
func (u *UserApplicationService) InviteMember(ctx context.Context, req *space_member.InviteMemberRequest) (
	resp *space_member.InviteMemberResponse, err error,
) {
	operatorID := ctxutil.MustGetUIDFromCtx(ctx)

	// 设置默认角色
	roleType := int32(3) // 默认为成员
	if req.RoleType != nil && (*req.RoleType == 2 || *req.RoleType == 3) {
		roleType = *req.RoleType
	}

	// 邀请成员
	member, err := u.DomainSVC.InviteMember(ctx, operatorID, req.SpaceID, req.UserID, roleType)
	if err != nil {
		return nil, errorx.WrapByCode(err, errno.ErrUserInvalidParamCode, errorx.KV("msg", "invite member failed"))
	}

	return &space_member.InviteMemberResponse{
		Code: 0,
		Msg:  "success",
		Data: &space_member.SpaceMember{
			ID:      member.ID,
			SpaceID: member.SpaceID,
			UserID:  member.UserID,
			UserInfo: &space_member.UserInfo{
				UserID:     member.User.UserID,
				Name:       member.User.Name,
				UniqueName: member.User.UniqueName,
				Email:      member.User.Email,
				AvatarURL:  &member.User.IconURL,
				CreatedAt:  member.User.CreatedAt,
			},
			RoleType:  int32(member.RoleType),
			RoleName:  member.RoleType.GetRoleName(),
			CreatedAt: member.CreatedAt,
			UpdatedAt: member.UpdatedAt,
		},
	}, nil
}

// UpdateMemberRole 更新成员角色
func (u *UserApplicationService) UpdateMemberRole(ctx context.Context, req *space_member.UpdateMemberRoleRequest) (
	resp *space_member.UpdateMemberRoleResponse, err error,
) {
	operatorID := ctxutil.MustGetUIDFromCtx(ctx)

	// 更新成员角色
	member, err := u.DomainSVC.UpdateMemberRole(ctx, operatorID, req.SpaceID, req.UserID, req.RoleType)
	if err != nil {
		return nil, errorx.WrapByCode(err, errno.ErrUserInvalidParamCode, errorx.KV("msg", "update member role failed"))
	}

	return &space_member.UpdateMemberRoleResponse{
		Code: 0,
		Msg:  "success",
		Data: &space_member.SpaceMember{
			ID:      member.ID,
			SpaceID: member.SpaceID,
			UserID:  member.UserID,
			UserInfo: &space_member.UserInfo{
				UserID:     member.User.UserID,
				Name:       member.User.Name,
				UniqueName: member.User.UniqueName,
				Email:      member.User.Email,
				AvatarURL:  &member.User.IconURL,
				CreatedAt:  member.User.CreatedAt,
			},
			RoleType:  int32(member.RoleType),
			RoleName:  member.RoleType.GetRoleName(),
			CreatedAt: member.CreatedAt,
			UpdatedAt: member.UpdatedAt,
		},
	}, nil
}

// RemoveMember 移除成员
func (u *UserApplicationService) RemoveMember(ctx context.Context, req *space_member.RemoveMemberRequest) (
	resp *space_member.RemoveMemberResponse, err error,
) {
	operatorID := ctxutil.MustGetUIDFromCtx(ctx)

	// 移除成员
	err = u.DomainSVC.RemoveMember(ctx, operatorID, req.SpaceID, req.UserID)
	if err != nil {
		return nil, errorx.WrapByCode(err, errno.ErrUserInvalidParamCode, errorx.KV("msg", "remove member failed"))
	}

	return &space_member.RemoveMemberResponse{
		Code: 0,
		Msg:  "success",
	}, nil
}

// CheckMemberPermission 检查成员权限
func (u *UserApplicationService) CheckMemberPermission(ctx context.Context, req *space_member.CheckMemberPermissionRequest) (
	resp *space_member.CheckMemberPermissionResponse, err error,
) {
	userID := req.UserID
	if userID == 0 {
		userID = ctxutil.MustGetUIDFromCtx(ctx)
	}

	// 检查权限
	isMember, roleType, canInvite, canManage, err := u.DomainSVC.CheckMemberPermission(ctx, req.SpaceID, userID)
	if err != nil {
		return nil, errorx.WrapByCode(err, errno.ErrUserInvalidParamCode, errorx.KV("msg", "check member permission failed"))
	}

	return &space_member.CheckMemberPermissionResponse{
		Code:      0,
		Msg:       "success",
		IsMember:  isMember,
		RoleType:  roleType,
		CanInvite: canInvite,
		CanManage: canManage,
	}, nil
}

// === Space Model Methods ===

// GetSpaceMembers 获取空间成员列表 (Space Model)
func (u *UserApplicationService) GetSpaceMembersForSpace(ctx context.Context, req *space.GetSpaceMembersRequest) (
	resp *space.GetSpaceMembersResponse, err error,
) {
	operatorID := ctxutil.MustGetUIDFromCtx(ctx)

	// 检查权限
	isMember, _, _, _, err := u.DomainSVC.CheckMemberPermission(ctx, req.SpaceID, operatorID)
	if err != nil {
		return nil, errorx.WrapByCode(err, errno.ErrUserInvalidParamCode, errorx.KV("msg", "check member permission failed"))
	}

	if !isMember {
		return nil, errorx.WrapByCode(err, errno.ErrUserInvalidParamCode, errorx.KV("msg", "not space member"))
	}

	// 设置默认值
	page := int32(1)
	if req.Page != nil {
		page = *req.Page
	}
	pageSize := int32(20)
	if req.PageSize != nil {
		pageSize = *req.PageSize
	}
	var roleType *int32
	if req.Role != nil {
		roleInt := int32(*req.Role)
		roleType = &roleInt
	}

	// 获取成员列表
	members, total, err := u.DomainSVC.GetSpaceMembers(ctx, req.SpaceID, page, pageSize, roleType)
	if err != nil {
		return nil, errorx.WrapByCode(err, errno.ErrUserInvalidParamCode, errorx.KV("msg", "get space members failed"))
	}

	// 转换数据结构
	memberInfos := make([]*space.SpaceMemberInfo, 0, len(members))
	for _, member := range members {
		memberInfos = append(memberInfos, &space.SpaceMemberInfo{
			UserID:       member.UserID,
			Username:     member.User.Name,
			Nickname:     &member.User.UniqueName,
			AvatarURL:    &member.User.IconURL,
			Role:         space.MemberRoleType(member.RoleType),
			JoinedAt:     member.CreatedAt,
			LastActiveAt: &member.UpdatedAt,
		})
	}

	return &space.GetSpaceMembersResponse{
		Code:     0,
		Msg:      "success",
		Data:     memberInfos,
		Total:    int32(total),
		Page:     page,
		PageSize: pageSize,
	}, nil
}

// InviteMember 邀请成员 (Space Model)
func (u *UserApplicationService) InviteMemberForSpace(ctx context.Context, req *space.InviteMemberRequest) (
	resp *space.InviteMemberResponse, err error,
) {
	operatorID := ctxutil.MustGetUIDFromCtx(ctx)

	// 转换字符串用户ID为int64
	userIDs := make([]int64, 0, len(req.UserIds))
	for _, userIDStr := range req.UserIds {
		userID, err := strconv.ParseInt(userIDStr, 10, 64)
		if err != nil {
			return nil, errorx.WrapByCode(err, errno.ErrUserInvalidParamCode, errorx.KV("msg", "invalid user ID format"))
		}
		userIDs = append(userIDs, userID)
	}

	// 邀请多个成员
	memberInfos := make([]*space.SpaceMemberInfo, 0, len(userIDs))
	for _, userID := range userIDs {
		member, err := u.DomainSVC.InviteMember(ctx, operatorID, req.SpaceID, userID, int32(req.Role))
		if err != nil {
			return nil, errorx.WrapByCode(err, errno.ErrUserInvalidParamCode, errorx.KV("msg", "invite member failed"))
		}

		memberInfos = append(memberInfos, &space.SpaceMemberInfo{
			UserID:       member.UserID,
			Username:     member.User.Name,
			Nickname:     &member.User.UniqueName,
			AvatarURL:    &member.User.IconURL,
			Role:         space.MemberRoleType(member.RoleType),
			JoinedAt:     member.CreatedAt,
			LastActiveAt: &member.UpdatedAt,
		})
	}

	return &space.InviteMemberResponse{
		Code: 0,
		Msg:  "success",
		Data: memberInfos,
	}, nil
}

// UpdateMemberRole 更新成员角色 (Space Model)
func (u *UserApplicationService) UpdateMemberRoleForSpace(ctx context.Context, req *space.UpdateMemberRoleRequest) (
	resp *space.UpdateMemberRoleResponse, err error,
) {
	operatorID := ctxutil.MustGetUIDFromCtx(ctx)

	// 更新角色
	member, err := u.DomainSVC.UpdateMemberRole(ctx, operatorID, req.SpaceID, req.UserID, int32(req.Role))
	if err != nil {
		return nil, errorx.WrapByCode(err, errno.ErrUserInvalidParamCode, errorx.KV("msg", "update member role failed"))
	}

	return &space.UpdateMemberRoleResponse{
		Code: 0,
		Msg:  "success",
		Data: &space.SpaceMemberInfo{
			UserID:       member.UserID,
			Username:     member.User.Name,
			Nickname:     &member.User.UniqueName,
			AvatarURL:    &member.User.IconURL,
			Role:         space.MemberRoleType(member.RoleType),
			JoinedAt:     member.CreatedAt,
			LastActiveAt: &member.UpdatedAt,
		},
	}, nil
}

// RemoveMember 移除成员 (Space Model)
func (u *UserApplicationService) RemoveMemberForSpace(ctx context.Context, req *space.RemoveMemberRequest) (
	resp *space.RemoveMemberResponse, err error,
) {
	operatorID := ctxutil.MustGetUIDFromCtx(ctx)

	// 移除成员
	err = u.DomainSVC.RemoveMember(ctx, operatorID, req.SpaceID, req.UserID)
	if err != nil {
		return nil, errorx.WrapByCode(err, errno.ErrUserInvalidParamCode, errorx.KV("msg", "remove member failed"))
	}

	return &space.RemoveMemberResponse{
		Code: 0,
		Msg:  "success",
	}, nil
}

// SearchUsers 搜索用户 (Space Model)
func (u *UserApplicationService) SearchUsersForSpace(ctx context.Context, req *space.SearchUsersRequest) (
	resp *space.SearchUsersResponse, err error,
) {
	limit := req.Limit
	if limit == nil || *limit <= 0 {
		defaultLimit := int32(10)
		limit = &defaultLimit
	}

	excludeSpaceID := req.ExcludeSpaceID
	if excludeSpaceID == nil {
		defaultSpaceID := int64(0)
		excludeSpaceID = &defaultSpaceID
	}

	// 搜索用户
	users, err := u.DomainSVC.SearchUsers(ctx, req.Keyword, *excludeSpaceID, *limit)
	if err != nil {
		return nil, errorx.WrapByCode(err, errno.ErrUserInvalidParamCode, errorx.KV("msg", "search users failed"))
	}

	// 转换数据结构
	userInfos := make([]*space.UserInfo, 0, len(users))
	for _, user := range users {
		userInfos = append(userInfos, &space.UserInfo{
			UserID:     user.UserID,
			Name:       user.Name,
			UniqueName: user.UniqueName,
			Email:      &user.Email,
			AvatarURL:  &user.IconURL,
			CreatedAt:  user.CreatedAt,
		})
	}

	return &space.SearchUsersResponse{
		Code: 0,
		Msg:  "success",
		Data: userInfos,
	}, nil
}

// CheckMemberPermission 检查成员权限 (Space Model)
func (u *UserApplicationService) CheckMemberPermissionForSpace(ctx context.Context, req *space.CheckMemberPermissionRequest) (
	resp *space.CheckMemberPermissionResponse, err error,
) {
	userID := ctxutil.MustGetUIDFromCtx(ctx)

	// 检查权限
	isMember, roleType, canInvite, canManage, err := u.DomainSVC.CheckMemberPermission(ctx, req.SpaceID, userID)
	if err != nil {
		return nil, errorx.WrapByCode(err, errno.ErrUserInvalidParamCode, errorx.KV("msg", "check member permission failed"))
	}

	if !isMember {
		return &space.CheckMemberPermissionResponse{
			Code: 0,
			Msg:  "success",
			Data: &space.MemberPermission{
				CanInvite: false,
				CanManage: false,
				RoleType:  space.MemberRoleType(3), // 默认为成员
			},
		}, nil
	}

	return &space.CheckMemberPermissionResponse{
		Code: 0,
		Msg:  "success",
		Data: &space.MemberPermission{
			CanInvite: canInvite,
			CanManage: canManage,
			RoleType:  space.MemberRoleType(roleType),
		},
	}, nil
}