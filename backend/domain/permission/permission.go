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

package permission

import (
	"context"
)

type (
	ResourceType int
	Decision     int
)

type ResourceIdentifier struct {
	Type ResourceType
	ID   string
}

type ActionAndResource struct {
	Action             string
	ResourceIdentifier ResourceIdentifier
}

type CheckPermissionRequest struct {
	IdentityTicket     string
	ActionAndResources []ActionAndResource
}

type CheckPermissionResponse struct {
	Decision Decision
}

type Permission interface {
	CheckPermission(ctx context.Context, req *CheckPermissionRequest) (*CheckPermissionResponse, error)
	CheckSingleAgentOperatePermission(ctx context.Context, botID, spaceID int64) (bool, error)
	CheckSpaceOperatePermission(ctx context.Context, spaceID int64, path, ticket string) (bool, error)
	UserSpaceCheck(ctx context.Context, spaceId, userId int64) (bool, error)
}
