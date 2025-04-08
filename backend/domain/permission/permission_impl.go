package permission

import (
	"context"
)

type permissionImpl struct{}

func NewService() Permission {
	return &permissionImpl{}
}

func (p *permissionImpl) CheckPermission(ctx context.Context, req *CheckPermissionRequest) (*CheckPermissionResponse, error) {
	return &CheckPermissionResponse{Decision: 0}, nil
}

func (p *permissionImpl) CheckSingleAgentOperatePermission(ctx context.Context, botID, spaceID int64) (bool, error) {
	return true, nil
}

func (p *permissionImpl) CheckSpaceOperatePermission(ctx context.Context, spaceID int64, path, ticket string) (bool, error) {
	return true, nil
}

func (p *permissionImpl) UserSpaceCheck(ctx context.Context, spaceId, userId int64) (bool, error) {
	return true, nil
}
