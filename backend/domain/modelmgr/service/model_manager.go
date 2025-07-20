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

package service

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"gorm.io/gorm"

	modelmgrModel "github.com/coze-dev/coze-studio/backend/api/model/crossdomain/modelmgr"
	"github.com/coze-dev/coze-studio/backend/domain/modelmgr"
	"github.com/coze-dev/coze-studio/backend/domain/modelmgr/entity"
	"github.com/coze-dev/coze-studio/backend/domain/modelmgr/internal/dal/dao"
	dmodel "github.com/coze-dev/coze-studio/backend/domain/modelmgr/internal/dal/model"
	uploadEntity "github.com/coze-dev/coze-studio/backend/domain/upload/entity"
	modelcontract "github.com/coze-dev/coze-studio/backend/infra/contract/chatmodel"
	"github.com/coze-dev/coze-studio/backend/infra/contract/idgen"
	"github.com/coze-dev/coze-studio/backend/infra/contract/storage"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/slices"
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

func (m *modelManager) CreateModelMeta(ctx context.Context, meta *entity.ModelMeta) (resp *entity.ModelMeta, err error) {
	if err = m.alignProtocol(meta); err != nil {
		return nil, err
	}

	id := meta.ID
	if id == 0 {
		id, err = m.idgen.GenID(ctx)
		if err != nil {
			return nil, err
		}
	}

	desc, err := json.Marshal(meta.Description)
	if err != nil {
		return nil, err
	}

	now := time.Now().UnixMilli()
	if err = m.modelMetaRepo.Create(ctx, &dmodel.ModelMeta{
		ID:          id,
		ModelName:   meta.Name,
		Protocol:    string(meta.Protocol),
		IconURI:     meta.IconURI,
		IconURL:     meta.IconURL,
		Capability:  meta.Capability,
		ConnConfig:  meta.ConnConfig,
		Status:      meta.Status,
		Description: string(desc),
		CreatedAt:   now,
		UpdatedAt:   now,
		DeletedAt:   gorm.DeletedAt{},
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
		status = []entity.ModelMetaStatus{modelmgrModel.StatusInUse}
	}

	pos, next, hasMore, err := m.modelMetaRepo.List(ctx, req.FuzzyModelName, status, req.Limit, req.Cursor)
	if err != nil {
		return nil, err
	}

	dos, err := m.fromModelMetaPOs(ctx, pos)
	if err != nil {
		return nil, err
	}

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

	dos, err := m.fromModelMetaPOs(ctx, pos)
	if err != nil {
		return nil, err
	}

	return dos, nil
}

func (m *modelManager) CreateModel(ctx context.Context, e *entity.Model) (*entity.Model, error) {
	// check if meta id exists
	metaPO, err := m.modelMetaRepo.GetByID(ctx, e.Meta.ID)
	if err != nil {
		return nil, err
	}
	if metaPO == nil {
		return nil, fmt.Errorf("[CreateModel] mode meta not found, model_meta id=%d", e.Meta.ID)
	}
	id := e.ID
	if id == 0 {
		id, err = m.idgen.GenID(ctx)
		if err != nil {
			return nil, err
		}
	}

	now := time.Now().UnixMilli()
	// TODO(@fanlv) : do -> po 放到 dal 里面去
	if err = m.modelEntityRepo.Create(ctx, &dmodel.ModelEntity{
		ID:            id,
		MetaID:        e.Meta.ID,
		Name:          e.Name,
		Description:   e.Description,
		DefaultParams: e.DefaultParameters,
		Status:        modelmgrModel.ModelEntityStatusInUse,
		CreatedAt:     now,
		UpdatedAt:     now,
	}); err != nil {
		return nil, err
	}

	resp := &entity.Model{
		Model: &modelmgrModel.Model{
			ID:          id,
			Name:        e.Name,
			CreatedAtMs: now,
			UpdatedAtMs: now,
			Meta:        e.Meta,
		},
	}

	return resp, nil
}

func (m *modelManager) DeleteModel(ctx context.Context, id int64) error {
	return m.modelEntityRepo.Delete(ctx, id)
}

func (m *modelManager) ListModel(ctx context.Context, req *modelmgr.ListModelRequest) (*modelmgr.ListModelResponse, error) {
	var sc *int64

	status := req.Status
	if len(status) == 0 {
		status = []modelmgrModel.ModelEntityStatus{modelmgrModel.ModelEntityStatusDefault, modelmgrModel.ModelEntityStatusInUse}
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

func (m *modelManager) fromModelMetaPOs(ctx context.Context, pos []*dmodel.ModelMeta) ([]*entity.ModelMeta, error) {
	uris := make(map[string]string)

	for _, po := range pos {
		if po == nil || po.IconURL != "" {
			continue
		}
		if po.IconURI == "" {
			po.IconURI = uploadEntity.ModelIconURI
		}
		uris[po.IconURI] = ""
	}

	for uri := range uris {
		url, err := m.oss.GetObjectUrl(ctx, uri)
		if err != nil {
			return nil, err
		}
		uris[uri] = url
	}

	dos, err := slices.TransformWithErrorCheck(pos, func(po *dmodel.ModelMeta) (*entity.ModelMeta, error) {
		if po == nil {
			return nil, nil
		}
		url := po.IconURL
		if url == "" {
			url = uris[po.IconURI]
		}

		desc := &modelmgrModel.MultilingualText{}
		if unmarshalErr := json.Unmarshal([]byte(po.Description), desc); unmarshalErr != nil {
			return nil, unmarshalErr
		}

		return &entity.ModelMeta{
			ID:      po.ID,
			Name:    po.ModelName,
			IconURI: po.IconURI,
			IconURL: url,

			Description: desc,
			CreatedAtMs: po.CreatedAt,
			UpdatedAtMs: po.UpdatedAt,
			DeletedAtMs: po.DeletedAt.Time.UnixMilli(),

			Protocol:   modelcontract.Protocol(po.Protocol),
			Capability: po.Capability,
			ConnConfig: po.ConnConfig,
			Status:     po.Status,
		}, nil
	})
	if err != nil {
		return nil, err
	}

	return dos, nil
}

func (m *modelManager) fromModelPOs(ctx context.Context, pos []*dmodel.ModelEntity) ([]*entity.Model, error) {
	if len(pos) == 0 {
		return nil, nil
	}

	resp := make([]*entity.Model, 0, len(pos))
	metaIDSet := make(map[int64]struct{})
	for _, po := range pos {
		resp = append(resp, &entity.Model{
			Model: &modelmgrModel.Model{
				ID:                po.ID,
				Name:              po.Name,
				Description:       po.Description,
				DefaultParameters: po.DefaultParams,
				CreatedAtMs:       po.CreatedAt,
				UpdatedAtMs:       po.UpdatedAt,
				Meta: entity.ModelMeta{
					ID: po.MetaID,
				},
			},
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
		if item.IconURL == "" {
			url, err := m.oss.GetObjectUrl(ctx, item.IconURI)
			if err != nil {
				return nil, err
			}
			item.IconURL = url
		}
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
		if i != 0 && m.Status == modelmgrModel.ModelEntityStatusDefault {
			orders[0], orders[i] = orders[i], orders[0]
			break
		}
	}
	return orders
}
