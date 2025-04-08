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
