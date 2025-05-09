package openapiauth

import (
	"context"
	"time"

	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/domain/permission/openapiauth/dal"
	"code.byted.org/flow/opencoze/backend/domain/permission/openapiauth/entity"
	"code.byted.org/flow/opencoze/backend/domain/permission/openapiauth/internal/model"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
	"code.byted.org/flow/opencoze/backend/pkg/lang/slices"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
)

type apiAuthImpl struct {
	IDGen idgen.IDGenerator
	DB    *gorm.DB
	dao   *dal.ApiKeyDAO
}

type Components struct {
	IDGen idgen.IDGenerator
	DB    *gorm.DB
}

func NewService(c *Components) ApiAuth {
	return &apiAuthImpl{
		IDGen: c.IDGen,
		DB:    c.DB,
		dao:   dal.NewApiKeyDAO(c.IDGen, c.DB),
	}
}

func (a *apiAuthImpl) Create(ctx context.Context, req *entity.CreateApiKey) (*entity.ApiKey, error) {

	apiData, err := a.buildApiKey2PoData(ctx, req)
	if err != nil {
		return nil, err
	}
	apiModel, err := a.dao.Create(ctx, apiData)
	if err != nil {
		return nil, err
	}
	return a.buildPoData2ApiKey([]*model.APIKey{apiModel})[0], nil
}

func (a *apiAuthImpl) buildApiKey2PoData(ctx context.Context, req *entity.CreateApiKey) (*model.APIKey, error) {

	apiKey := &model.APIKey{
		Name:      req.Name,
		ExpiredAt: req.Expire,
		UserID:    req.UserID,
		CreatedAt: time.Now().Unix(),
	}
	return apiKey, nil
}

func (a *apiAuthImpl) Delete(ctx context.Context, req *entity.DeleteApiKey) error {

	return a.dao.Delete(ctx, req.ID, req.UserID)

}
func (a *apiAuthImpl) Get(ctx context.Context, req *entity.GetApiKey) (*entity.ApiKey, error) {

	apiKey, err := a.dao.Get(ctx, req.ID)
	logs.CtxInfof(ctx, "apiKey=%v, err:%v", apiKey, err)
	if err != nil {
		return nil, err
	}
	if apiKey == nil {
		return nil, nil
	}
	return a.buildPoData2ApiKey([]*model.APIKey{apiKey})[0], nil
}

func (a *apiAuthImpl) buildPoData2ApiKey(apiKey []*model.APIKey) []*entity.ApiKey {

	apiKeyData := slices.Transform(apiKey, func(a *model.APIKey) *entity.ApiKey {
		return &entity.ApiKey{
			ID:        a.ID,
			Name:      a.Name,
			ApiKey:    a.Key,
			UserID:    a.UserID,
			ExpiredAt: a.ExpiredAt,
			CreatedAt: a.CreatedAt,
		}
	})

	return apiKeyData
}

func (a *apiAuthImpl) List(ctx context.Context, req *entity.ListApiKey) (*entity.ListApiKeyResp, error) {
	resp := &entity.ListApiKeyResp{
		ApiKeys: make([]*entity.ApiKey, 0),
		HasMore: false,
	}
	apiKey, hasMore, err := a.dao.List(ctx, req.UserID, int(req.Limit), int(req.Page))
	if err != nil {
		return nil, err
	}
	resp.ApiKeys = a.buildPoData2ApiKey(apiKey)
	resp.HasMore = hasMore

	return resp, nil
}
func (a *apiAuthImpl) CheckPermission(ctx context.Context, req *entity.CheckPermission) (bool, error) {

	apiKey, err := a.dao.FindByKey(ctx, req.ApiKey)
	if err != nil {
		return false, err
	}
	if apiKey.Key != req.ApiKey {
		return false, nil
	}
	return true, nil
}

func (a *apiAuthImpl) Save(ctx context.Context, sm *entity.SaveMeta) error {

	updateColumn := make(map[string]any)
	updateColumn["name"] = sm.Name
	updateColumn["updated_at"] = time.Now().Unix()
	err := a.dao.Update(ctx, sm.ID, sm.UserID, updateColumn)

	return err
}
