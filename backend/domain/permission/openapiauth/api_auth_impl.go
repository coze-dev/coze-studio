package openapiauth

import (
	"context"
	"time"

	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/domain/permission/openapiauth/dal"
	"code.byted.org/flow/opencoze/backend/domain/permission/openapiauth/entity"
	"code.byted.org/flow/opencoze/backend/domain/permission/openapiauth/internal/model"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
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

	apiKey, err := a.dao.Find(ctx, req.ID)
	if err != nil {
		return nil, err
	}
	if apiKey == nil {
		return nil, nil
	}
	return a.buildPoData2ApiKey([]*model.APIKey{apiKey})[0], nil
}

func (a *apiAuthImpl) buildPoData2ApiKey(apiKey []*model.APIKey) []*entity.ApiKey {
	// build data
	apiKeyData := make([]*entity.ApiKey, 0, len(apiKey))
	for _, v := range apiKey {
		apiKeyData = append(apiKeyData, &entity.ApiKey{
			ID:        v.ID,
			Name:      v.Name,
			ApiKey:    v.Key,
			ExpiredAt: v.ExpiredAt,
			CreatedAt: v.CreatedAt,
		})
	}
	return apiKeyData
}

func (a *apiAuthImpl) List(ctx context.Context, req *entity.ListApiKey) (*entity.ListApiKeyResp, error) {
	resp := &entity.ListApiKeyResp{
		ApiKeys: make([]*entity.ApiKey, 0),
		HasMore: false,
		Cursor:  0,
	}
	apiKey, hasMore, err := a.dao.List(ctx, req.UserID, req.Limit, req.Cursor)
	if err != nil {
		return nil, err
	}
	resp.ApiKeys = a.buildPoData2ApiKey(apiKey)
	resp.HasMore = hasMore
	if len(apiKey) > 0 && hasMore == true {
		resp.Cursor = apiKey[len(apiKey)-1].CreatedAt
	}
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
