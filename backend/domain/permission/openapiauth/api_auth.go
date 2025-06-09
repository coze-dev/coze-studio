package openapiauth

import (
	"context"

	"code.byted.org/flow/opencoze/backend/domain/permission/openapiauth/entity"
)

type APIAuth interface {
	Create(ctx context.Context, req *entity.CreateApiKey) (*entity.ApiKey, error)
	Delete(ctx context.Context, req *entity.DeleteApiKey) error
	Get(ctx context.Context, req *entity.GetApiKey) (*entity.ApiKey, error)
	List(ctx context.Context, req *entity.ListApiKey) (*entity.ListApiKeyResp, error)
	Save(ctx context.Context, req *entity.SaveMeta) error

	CheckPermission(ctx context.Context, req *entity.CheckPermission) (*entity.ApiKey, error)
}
