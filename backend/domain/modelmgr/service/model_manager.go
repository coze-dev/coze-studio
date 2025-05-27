package service

import (
	"context"
	"fmt"
	"time"

	"gorm.io/gorm"

	iconEntity "code.byted.org/flow/opencoze/backend/domain/icon/entity"
	"code.byted.org/flow/opencoze/backend/domain/modelmgr"
	"code.byted.org/flow/opencoze/backend/domain/modelmgr/entity"
	"code.byted.org/flow/opencoze/backend/domain/modelmgr/internal/dal/dao"
	dmodel "code.byted.org/flow/opencoze/backend/domain/modelmgr/internal/dal/model"
	modelcontract "code.byted.org/flow/opencoze/backend/infra/contract/chatmodel"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
	"code.byted.org/flow/opencoze/backend/infra/contract/storage"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
	"code.byted.org/flow/opencoze/backend/pkg/lang/slices"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
)

func NewModelManager(db *gorm.DB, idgen idgen.IDGenerator, oss storage.Storage) modelmgr.Manager {
	return &modelManager{
		idgen:           idgen,
		oss:             oss,
		modelMetaRepo:   dao.NewModelMetaDAO(db),
		modelEntityRepo: dao.NewModelEntityDAO(db),
	}
}

type modelManager struct {
	idgen idgen.IDGenerator
	oss   storage.Storage

	modelMetaRepo   dao.ModelMetaRepo
	modelEntityRepo dao.ModelEntityRepo
}

func (m *modelManager) CreateModelMeta(ctx context.Context, meta *entity.ModelMeta) (*entity.ModelMeta, error) {
	if err := m.alignProtocol(meta); err != nil {
		return nil, err
	}

	id, err := m.idgen.GenID(ctx)
	if err != nil {
		return nil, err
	}

	now := time.Now().UnixMilli()
	if err = m.modelMetaRepo.Create(ctx, &dmodel.ModelMeta{
		ID:          id,
		ModelName:   meta.Name,
		Protocol:    string(meta.Protocol),
		Capability:  meta.Capability,
		ConnConfig:  meta.ConnConfig,
		Status:      meta.Status,
		Description: meta.Description,
		CreatedAt:   now,
		UpdatedAt:   now,
	}); err != nil {
		return nil, err
	}

	return &entity.ModelMeta{
		ID:          id,
		Name:        meta.Name,
		Description: meta.Description,
		CreatedAtMs: now,
		UpdatedAtMs: now,

		Protocol:   meta.Protocol,
		Capability: meta.Capability,
		ConnConfig: meta.ConnConfig,
		Status:     meta.Status,
	}, nil
}

func (m *modelManager) UpdateModelMetaStatus(ctx context.Context, id int64, status entity.ModelMetaStatus) error {
	return m.modelMetaRepo.UpdateStatus(ctx, id, status)
}

func (m *modelManager) DeleteModelMeta(ctx context.Context, id int64) error {
	return m.modelMetaRepo.Delete(ctx, id)
}

func (m *modelManager) ListModelMeta(ctx context.Context, req *modelmgr.ListModelMetaRequest) (*modelmgr.ListModelMetaResponse, error) {
	status := req.Status
	if len(status) == 0 {
		status = []entity.ModelMetaStatus{entity.StatusInUse}
	}

	pos, next, hasMore, err := m.modelMetaRepo.List(ctx, req.FuzzyModelName, status, req.Limit, req.Cursor)
	if err != nil {
		return nil, err
	}

	uris := slices.ToMap(pos, func(meta *dmodel.ModelMeta) (string, string) {
		if meta.IconURI == "" {
			meta.IconURI = iconEntity.ModelIconURI
		}
		return meta.IconURI, ""
	})

	for uri := range uris {
		url, err := m.oss.GetObjectUrl(ctx, uri)
		if err != nil {
			return nil, err
		}

		uris[uri] = url
	}

	dos := slices.Transform(pos, func(a *dmodel.ModelMeta) *entity.ModelMeta {
		return fromModelMetaPO(a, uris)
	})

	return &modelmgr.ListModelMetaResponse{
		ModelMetaList: dos,
		HasMore:       hasMore,
		NextCursor:    next,
	}, nil
}

func (m *modelManager) MGetModelMetaByID(ctx context.Context, req *modelmgr.MGetModelMetaRequest) ([]*entity.ModelMeta, error) {
	if len(req.IDs) == 0 {
		return nil, nil
	}

	pos, err := m.modelMetaRepo.MGetByID(ctx, req.IDs)
	if err != nil {
		return nil, err
	}

	uris := slices.ToMap(pos, func(meta *dmodel.ModelMeta) (string, string) {
		if meta.IconURI == "" {
			meta.IconURI = iconEntity.ModelIconURI
		}
		return meta.IconURI, ""
	})

	for uri := range uris {
		url, err := m.oss.GetObjectUrl(ctx, uri)
		if err != nil {
			return nil, err
		}
		uris[uri] = url
	}

	logs.CtxInfof(ctx, "model uris: %v", uris)

	dos := slices.Transform(pos, func(a *dmodel.ModelMeta) *entity.ModelMeta {
		return fromModelMetaPO(a, uris)
	})

	return dos, nil
}

func (m *modelManager) CreateModel(ctx context.Context, model *entity.Model) (*entity.Model, error) {
	// check if meta id exists
	metaPO, err := m.modelMetaRepo.GetByID(ctx, model.Meta.ID)
	if err != nil {
		return nil, err
	}
	if metaPO == nil {
		return nil, fmt.Errorf("[CreateModel] mode meta not found, model_meta id=%d", model.Meta.ID)
	}

	id, err := m.idgen.GenID(ctx)
	if err != nil {
		return nil, err
	}

	now := time.Now().UnixMilli()
	if err = m.modelEntityRepo.Create(ctx, &dmodel.ModelEntity{
		ID:        id,
		MetaID:    model.Meta.ID,
		Name:      model.Name,
		Scenario:  model.Scenario,
		CreatedAt: now,
		UpdatedAt: now,
	}); err != nil {
		return nil, err
	}

	resp := &entity.Model{
		ID:          id,
		Name:        model.Name,
		CreatedAtMs: now,
		UpdatedAtMs: now,

		Meta:     model.Meta,
		Scenario: model.Scenario,
	}

	return resp, nil
}

func (m *modelManager) DeleteModel(ctx context.Context, id int64) error {
	return m.modelEntityRepo.Delete(ctx, id)
}

func (m *modelManager) ListModel(ctx context.Context, req *modelmgr.ListModelRequest) (*modelmgr.ListModelResponse, error) {
	var sc *int64
	if req.Scenario != nil {
		sc = ptr.Of(int64(*req.Scenario))
	}

	status := req.Status
	if len(status) == 0 {
		status = []entity.ModelEntityStatus{entity.ModelEntityStatusDefault, entity.ModelEntityStatusInUse}
	}

	pos, next, hasMore, err := m.modelEntityRepo.List(ctx, req.FuzzyModelName, sc, status, req.Limit, req.Cursor)
	if err != nil {
		return nil, err
	}

	pos = moveDefaultModelToFirst(pos)
	resp, err := m.fromModelPOs(ctx, pos)
	if err != nil {
		return nil, err
	}

	return &modelmgr.ListModelResponse{
		ModelList:  resp,
		HasMore:    hasMore,
		NextCursor: next,
	}, nil
}

func (m *modelManager) MGetModelByID(ctx context.Context, req *modelmgr.MGetModelRequest) ([]*entity.Model, error) {
	if len(req.IDs) == 0 {
		return nil, nil
	}

	pos, err := m.modelEntityRepo.MGet(ctx, req.IDs)
	if err != nil {
		return nil, err
	}

	resp, err := m.fromModelPOs(ctx, pos)
	if err != nil {
		return nil, err
	}

	return resp, nil
}

func (m *modelManager) alignProtocol(meta *entity.ModelMeta) error {
	if meta.Protocol == "" {
		return fmt.Errorf("protocol not provided")
	}

	config := meta.ConnConfig
	if config == nil {
		return fmt.Errorf("ConnConfig not provided, protocol=%s", meta.Protocol)
	}

	return nil
}

func fromModelMetaPO(po *dmodel.ModelMeta, uris map[string]string) *entity.ModelMeta {
	if po == nil {
		return nil
	}

	return &entity.ModelMeta{
		ID:      po.ID,
		Name:    po.ModelName,
		IconURI: po.IconURI,
		IconURL: uris[po.IconURI],

		Description: po.Description,
		CreatedAtMs: po.CreatedAt,
		UpdatedAtMs: po.UpdatedAt,
		DeletedAtMs: po.DeletedAt.Time.UnixMilli(),

		Protocol:   modelcontract.Protocol(po.Protocol),
		Capability: po.Capability,
		ConnConfig: po.ConnConfig,
		Status:     po.Status,
	}
}

func (m *modelManager) fromModelPOs(ctx context.Context, pos []*dmodel.ModelEntity) ([]*entity.Model, error) {
	if len(pos) == 0 {
		return nil, nil
	}

	resp := make([]*entity.Model, 0, len(pos))
	metaIDSet := make(map[int64]struct{})
	for _, po := range pos {
		resp = append(resp, &entity.Model{
			ID:                po.ID,
			Name:              po.Name,
			Description:       po.Description,
			DefaultParameters: po.DefaultParams,
			CreatedAtMs:       po.CreatedAt,
			UpdatedAtMs:       po.UpdatedAt,

			Meta: entity.ModelMeta{
				ID: po.MetaID,
			},
			Scenario: po.Scenario,
		})
		metaIDSet[po.MetaID] = struct{}{}
	}

	metaIDSlice := make([]int64, 0, len(metaIDSet))
	for id := range metaIDSet {
		metaIDSlice = append(metaIDSlice, id)
	}

	modelMetaSlice, err := m.MGetModelMetaByID(ctx, &modelmgr.MGetModelMetaRequest{IDs: metaIDSlice})
	if err != nil {
		return nil, err
	}

	metaID2Meta := make(map[int64]*entity.ModelMeta)
	for i := range modelMetaSlice {
		item := modelMetaSlice[i]
		metaID2Meta[item.ID] = item
	}

	for _, r := range resp {
		meta, found := metaID2Meta[r.Meta.ID]
		if !found {
			return nil, fmt.Errorf("[ListModel] model meta not found, model_entity id=%v, model_meta id=%v", r.ID, r.Meta.ID)
		}
		r.Meta = *meta
	}

	return resp, nil
}

func moveDefaultModelToFirst(ms []*dmodel.ModelEntity) []*dmodel.ModelEntity {
	orders := make([]*dmodel.ModelEntity, len(ms))
	copy(orders, ms)

	for i, m := range orders {
		if i != 0 && m.Status == entity.ModelEntityStatusDefault {
			orders[0], orders[i] = orders[i], orders[0]
			break
		}
	}
	return orders
}
