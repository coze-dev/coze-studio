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

package entity

type SpaceType int32

const (
	SpaceTypePersonal SpaceType = 1
	SpaceTypeTeam     SpaceType = 2
)

type Space struct {
	ID          int64
	Name        string
	Description string
	IconURL     string
	SpaceType   SpaceType
	OwnerID     int64
	CreatorID   int64
	CreatedAt   int64
	UpdatedAt   int64
}

// RoleType 空间成员角色类型
type RoleType int32

const (
	RoleTypeOwner  RoleType = 1 // 所有者
	RoleTypeAdmin  RoleType = 2 // 管理员
	RoleTypeMember RoleType = 3 // 普通成员
)

// SpaceMember 空间成员
type SpaceMember struct {
	ID        int64
	SpaceID   int64
	UserID    int64
	User      *User
	RoleType  RoleType
	CreatedAt int64
	UpdatedAt int64
}

// GetRoleName 获取角色名称
func (r RoleType) GetRoleName() string {
	switch r {
	case RoleTypeOwner:
		return "所有者"
	case RoleTypeAdmin:
		return "管理员"
	case RoleTypeMember:
		return "成员"
	default:
		return "未知"
	}
}

// CanInvite 是否可以邀请成员
func (r RoleType) CanInvite() bool {
	return r == RoleTypeOwner || r == RoleTypeAdmin
}

// CanManage 是否可以管理成员
func (r RoleType) CanManage() bool {
	return r == RoleTypeOwner
}
