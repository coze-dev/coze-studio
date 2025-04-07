package permission

import (
	"context"
)

type ResourceType int
type Decision int

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
	CheckPermission(ctx context.Context, req *CheckPermissionRequest) (resp *CheckPermissionResponse, err error)
	CheckSingleAgentOperatePermission(ctx context.Context, botID, spaceID int64) (bool, error)
}
