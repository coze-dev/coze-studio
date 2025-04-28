package openapiauth

import (
	"context"

	"code.byted.org/flow/opencoze/backend/domain/permission/openapiauth/entity"
)

type ApiAuth interface {
	Create(ctx context.Context, req *entity.CreateApiKey) (*entity.ApiKey, error)
	Delete(ctx context.Context, req *entity.DeleteApiKey) error
	Get(ctx context.Context, req *entity.GetApiKey) (*entity.ApiKey, error)
	List(ctx context.Context, req *entity.ListApiKey) (*entity.ListApiKeyResp, error)

	CheckPermission(ctx context.Context, req *entity.CheckPermission) (bool, error)
}
