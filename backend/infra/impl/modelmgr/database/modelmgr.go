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

package database

import (
	"context"
	"encoding/json"
	"fmt"
	"strconv"
	"sync"
	"time"

	"github.com/redis/go-redis/v9"
	"gorm.io/gorm"

	"github.com/coze-dev/coze-studio/backend/domain/model/entity"
	"github.com/coze-dev/coze-studio/backend/infra/contract/chatmodel"
	"github.com/coze-dev/coze-studio/backend/infra/contract/modelmgr"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
)

const (
	modelCachePrefix = "model:cache:"
	modelCacheTTL    = 5 * time.Minute
)

// ModelMgr 数据库模型管理器
type ModelMgr struct {
	db    *gorm.DB
	redis *redis.Client
	mu    sync.RWMutex
}

// NewModelMgr 创建数据库模型管理器实例
func NewModelMgr(db *gorm.DB, redis *redis.Client) (modelmgr.Manager, error) {
	if db == nil {
		return nil, fmt.Errorf("database connection is required")
	}

	mgr := &ModelMgr{
		db:    db,
		redis: redis,
	}

	return mgr, nil
}

// ListModel 查询模型列表
func (m *ModelMgr) ListModel(ctx context.Context, req *modelmgr.ListModelRequest) (*modelmgr.ListModelResponse, error) {
	// 先查询 model_entity
	query := m.db.WithContext(ctx).Model(&entity.ModelEntity{}).
		Where("deleted_at IS NULL")

	// 处理模糊查询
	if req.FuzzyModelName != nil && *req.FuzzyModelName != "" {
		query = query.Where("name LIKE ?", "%"+*req.FuzzyModelName+"%")
	}

	// 处理游标
	if req.Cursor != nil && *req.Cursor != "" {
		cursorID, err := strconv.ParseInt(*req.Cursor, 10, 64)
		if err != nil {
			return nil, fmt.Errorf("invalid cursor: %w", err)
		}
		query = query.Where("id > ?", cursorID)
	}

	// 设置限制和排序
	limit := req.Limit
	if limit <= 0 {
		limit = 20
	}
	query = query.Order("id ASC").Limit(limit + 1)

	// 执行查询
	var entities []entity.ModelEntity
	if err := query.Find(&entities).Error; err != nil {
		return nil, fmt.Errorf("failed to query model entities: %w", err)
	}

	if len(entities) == 0 {
		return &modelmgr.ListModelResponse{
			ModelList:  []*modelmgr.Model{},
			HasMore:    false,
			NextCursor: nil,
		}, nil
	}

	// 收集 meta_id
	metaIDs := make([]uint64, 0, len(entities))
	for _, e := range entities {
		metaIDs = append(metaIDs, e.MetaID)
	}

	// 查询 model_meta
	var metas []entity.ModelMeta
	metaQuery := m.db.WithContext(ctx).Model(&entity.ModelMeta{}).
		Where("id IN ?", metaIDs).
		Where("deleted_at IS NULL")

	// 处理状态过滤
	if len(req.Status) > 0 {
		statusValues := make([]int, len(req.Status))
		for i, s := range req.Status {
			statusValues[i] = int(s)
		}
		metaQuery = metaQuery.Where("status IN ?", statusValues)
	} else {
		// 默认查询 default 和 in_use 状态
		metaQuery = metaQuery.Where("status IN ?", []int{int(modelmgr.StatusDefault), int(modelmgr.StatusInUse)})
	}

	if err := metaQuery.Find(&metas).Error; err != nil {
		return nil, fmt.Errorf("failed to query model metas: %w", err)
	}

	// 构建 meta map
	metaMap := make(map[uint64]*entity.ModelMeta)
	for i := range metas {
		metaMap[metas[i].ID] = &metas[i]
	}

	// 转换结果
	models := make([]*modelmgr.Model, 0, len(entities))
	hasMore := false
	var nextCursor *string

	for i, entity := range entities {
		if i >= limit {
			hasMore = true
			break
		}

		meta, ok := metaMap[entity.MetaID]
		if !ok {
			// 如果没有找到对应的 meta，跳过
			continue
		}

		model, err := m.convertToModel(&entity, meta)
		if err != nil {
			logs.Warnf("failed to convert model, id=%d, err=%v", entity.ID, err)
			continue
		}

		models = append(models, model)
		// 使用最后一个模型的ID作为下一个游标
		cursor := strconv.FormatInt(int64(entity.ID), 10)
		nextCursor = &cursor
	}

	return &modelmgr.ListModelResponse{
		ModelList:  models,
		HasMore:    hasMore,
		NextCursor: nextCursor,
	}, nil
}

// ListInUseModel 查询使用中的模型
func (m *ModelMgr) ListInUseModel(ctx context.Context, limit int, cursor *string) (*modelmgr.ListModelResponse, error) {
	return m.ListModel(ctx, &modelmgr.ListModelRequest{
		Status: []modelmgr.ModelStatus{modelmgr.StatusDefault, modelmgr.StatusInUse},
		Limit:  limit,
		Cursor: cursor,
	})
}

// MGetModelByID 批量获取模型
func (m *ModelMgr) MGetModelByID(ctx context.Context, req *modelmgr.MGetModelRequest) ([]*modelmgr.Model, error) {
	if len(req.IDs) == 0 {
		return []*modelmgr.Model{}, nil
	}

	// 尝试从缓存获取
	models := make([]*modelmgr.Model, 0, len(req.IDs))
	missedIDs := make([]int64, 0)

	if m.redis != nil {
		for _, id := range req.IDs {
			model, err := m.getModelFromCache(ctx, id)
			if err == nil && model != nil {
				models = append(models, model)
			} else {
				missedIDs = append(missedIDs, id)
			}
		}
	} else {
		missedIDs = req.IDs
	}

	// 从数据库获取缺失的模型
	if len(missedIDs) > 0 {
		// 查询 model_entity
		var entities []entity.ModelEntity
		err := m.db.WithContext(ctx).Model(&entity.ModelEntity{}).
			Where("id IN ?", missedIDs).
			Where("deleted_at IS NULL").
			Find(&entities).Error

		if err != nil {
			return nil, fmt.Errorf("failed to get model entities by ids: %w", err)
		}

		// 收集 meta_id
		metaIDs := make([]uint64, 0, len(entities))
		entityMap := make(map[uint64]*entity.ModelEntity)
		for i := range entities {
			metaIDs = append(metaIDs, entities[i].MetaID)
			entityMap[entities[i].ID] = &entities[i]
		}

		// 查询 model_meta
		var metas []entity.ModelMeta
		err = m.db.WithContext(ctx).Model(&entity.ModelMeta{}).
			Where("id IN ?", metaIDs).
			Where("deleted_at IS NULL").
			Find(&metas).Error

		if err != nil {
			return nil, fmt.Errorf("failed to get model metas by ids: %w", err)
		}

		// 构建 meta map
		metaMap := make(map[uint64]*entity.ModelMeta)
		for i := range metas {
			metaMap[metas[i].ID] = &metas[i]
		}

		// 按照请求的 ID 顺序返回
		for _, id := range missedIDs {
			entity, ok := entityMap[uint64(id)]
			if !ok {
				continue
			}

			meta, ok := metaMap[entity.MetaID]
			if !ok {
				continue
			}

			model, err := m.convertToModel(entity, meta)
			if err != nil {
				logs.Warnf("failed to convert model, id=%d, err=%v", entity.ID, err)
				continue
			}

			models = append(models, model)

			// 缓存模型
			if m.redis != nil {
				_ = m.cacheModel(ctx, model)
			}
		}
	}

	// 按照请求的ID顺序返回
	idToModel := make(map[int64]*modelmgr.Model)
	for _, model := range models {
		idToModel[model.ID] = model
	}

	result := make([]*modelmgr.Model, 0, len(req.IDs))
	for _, id := range req.IDs {
		if model, ok := idToModel[id]; ok {
			result = append(result, model)
		}
	}

	return result, nil
}

// convertToModel 将数据库实体转换为模型
func (m *ModelMgr) convertToModel(entity *entity.ModelEntity, meta *entity.ModelMeta) (*modelmgr.Model, error) {
	model := &modelmgr.Model{
		ID:      int64(entity.ID),
		Name:    entity.Name,
		IconURI: meta.IconURI,
		IconURL: meta.IconURL,
		Meta: modelmgr.ModelMeta{
			Name:     meta.ModelName,
			Protocol: chatmodel.Protocol(meta.Protocol),
			Status:   modelmgr.ModelStatus(meta.Status),
		},
	}

	// 解析描述
	if entity.Description != nil && *entity.Description != "" {
		var desc modelmgr.MultilingualText
		if err := json.Unmarshal([]byte(*entity.Description), &desc); err != nil {
			// 如果不是JSON格式，作为中文描述处理
			desc.ZH = *entity.Description
		}
		model.Description = &desc
	}

	// 解析默认参数
	if entity.DefaultParams != "" {
		var params []*modelmgr.Parameter
		if err := json.Unmarshal([]byte(entity.DefaultParams), &params); err != nil {
			return nil, fmt.Errorf("failed to unmarshal default params: %w", err)
		}
		model.DefaultParameters = params
	}

	// 解析能力
	if meta.Capability != nil && *meta.Capability != "" {
		var cap modelmgr.Capability
		if err := json.Unmarshal([]byte(*meta.Capability), &cap); err != nil {
			return nil, fmt.Errorf("failed to unmarshal capability: %w", err)
		}
		model.Meta.Capability = &cap
	}

	// 解析连接配置
	if meta.ConnConfig != nil && *meta.ConnConfig != "" {
		// 先尝试解析为 map 以处理特殊字段
		var configMap map[string]interface{}
		if err := json.Unmarshal([]byte(*meta.ConnConfig), &configMap); err != nil {
			logs.Warnf("failed to unmarshal conn config as map, id=%d, err=%v", entity.ID, err)
		} else {
			// 处理 timeout 字段
			if timeout, ok := configMap["timeout"]; ok {
				switch v := timeout.(type) {
				case string:
					// 如果是字符串，尝试解析为 duration
					if d, err := time.ParseDuration(v); err == nil {
						configMap["timeout"] = int64(d)
					} else {
						// 如果解析失败，删除该字段
						delete(configMap, "timeout")
					}
				case float64:
					// 如果是数字，假设是秒数，转换为纳秒
					configMap["timeout"] = int64(v * float64(time.Second))
				}
			}

			// 重新序列化并解析
			fixedJSON, err := json.Marshal(configMap)
			if err != nil {
				logs.Warnf("failed to marshal fixed config map, id=%d, err=%v", entity.ID, err)
			} else {
				var config chatmodel.Config
				if err := json.Unmarshal(fixedJSON, &config); err != nil {
					logs.Warnf("failed to unmarshal conn config, id=%d, err=%v", entity.ID, err)
				} else {
					model.Meta.ConnConfig = &config
				}
			}
		}
	}

	return model, nil
}

// getModelFromCache 从缓存获取模型
func (m *ModelMgr) getModelFromCache(ctx context.Context, id int64) (*modelmgr.Model, error) {
	key := fmt.Sprintf("%s%d", modelCachePrefix, id)
	data, err := m.redis.Get(ctx, key).Bytes()
	if err != nil {
		return nil, err
	}

	var model modelmgr.Model
	if err := json.Unmarshal(data, &model); err != nil {
		return nil, err
	}

	return &model, nil
}

// cacheModel 缓存模型
func (m *ModelMgr) cacheModel(ctx context.Context, model *modelmgr.Model) error {
	key := fmt.Sprintf("%s%d", modelCachePrefix, model.ID)
	data, err := json.Marshal(model)
	if err != nil {
		return err
	}

	return m.redis.Set(ctx, key, data, modelCacheTTL).Err()
}

// RefreshCache 刷新缓存（用于管理端更新模型后）
func (m *ModelMgr) RefreshCache(ctx context.Context, modelID int64) error {
	if m.redis == nil {
		return nil
	}

	key := fmt.Sprintf("%s%d", modelCachePrefix, modelID)
	return m.redis.Del(ctx, key).Err()
}

// RefreshAllCache 刷新所有缓存
func (m *ModelMgr) RefreshAllCache(ctx context.Context) error {
	if m.redis == nil {
		return nil
	}

	pattern := fmt.Sprintf("%s*", modelCachePrefix)
	iter := m.redis.Scan(ctx, 0, pattern, 0).Iterator()

	var keys []string
	for iter.Next(ctx) {
		keys = append(keys, iter.Val())
	}

	if err := iter.Err(); err != nil {
		return err
	}

	if len(keys) > 0 {
		return m.redis.Del(ctx, keys...).Err()
	}

	return nil
}
