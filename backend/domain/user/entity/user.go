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

type User struct {
	UserID int64

	Name         string // nickname
	UniqueName   string // unique name
	Email        string // email
	Description  string // user description
	IconURI      string // avatar URI
	IconURL      string // avatar URL
	UserVerified bool   // Is the user authenticated?
	Locale       string
	SessionKey   string // session key

	CreatedAt int64 // creation time
	UpdatedAt int64 // update time
}

// SpaceMember represents a member of a space
type SpaceMember struct {
	UserID      int64
	Name        string
	UniqueName  string
	Email       string
	Description string
	IconURL     string
	RoleType    int32
	JoinedAt    int64
}

// RoleType represents the role type of a space member
type RoleType int32

const (
	RoleTypeViewer RoleType = 1
	RoleTypeMember RoleType = 2
	RoleTypeAdmin  RoleType = 3
)

// CanInvite returns whether the role can invite new members
func (r RoleType) CanInvite() bool {
	return r >= RoleTypeMember
}

// CanManage returns whether the role can manage members
func (r RoleType) CanManage() bool {
	return r == RoleTypeAdmin
}
