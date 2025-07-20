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

package modelmgr

import (
	"context"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"

	"gopkg.in/yaml.v3"
	"gorm.io/gorm"

	crossmodelmgr "github.com/coze-dev/coze-studio/backend/api/model/crossdomain/modelmgr"
	"github.com/coze-dev/coze-studio/backend/domain/modelmgr"
	"github.com/coze-dev/coze-studio/backend/domain/modelmgr/entity"
	"github.com/coze-dev/coze-studio/backend/domain/modelmgr/service"
	"github.com/coze-dev/coze-studio/backend/infra/contract/storage"
	"github.com/coze-dev/coze-studio/backend/infra/impl/idgen"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
)

func InitService(db *gorm.DB, idgen idgen.IDGenerator, oss storage.Storage) (*ModelmgrApplicationService, error) {
	svc := service.NewModelManager(db, idgen, oss)
	if err := loadStaticModelConfig(svc, oss); err != nil {
		return nil, err
	}
	ModelmgrApplicationSVC.DomainSVC = svc

	return ModelmgrApplicationSVC, nil
}

func loadStaticModelConfig(svc modelmgr.Manager, oss storage.Storage) error {
	ctx := context.Background()

	id2Meta := make(map[int64]*entity.ModelMeta)
	var cursor *string
	for {
		req := &modelmgr.ListModelMetaRequest{
			Status: []entity.ModelMetaStatus{
				crossmodelmgr.StatusInUse,
				crossmodelmgr.StatusPending,
				crossmodelmgr.StatusDeleted,
			},
			Limit:  100,
			Cursor: cursor,
		}
		listMetaResp, err := svc.ListModelMeta(ctx, req)
		if err != nil {
			return err
		}
		for _, item := range listMetaResp.ModelMetaList {
			cpItem := item
			id2Meta[cpItem.ID] = cpItem
		}
		if !listMetaResp.HasMore {
			break
		}
		cursor = listMetaResp.NextCursor
	}

	root, err := os.Getwd()
	if err != nil {
		return err
	}

	envModelMeta, envModelEntity, err := initModelByEnv(root, "resources/conf/model/template")
	if err != nil {
		return err
	}

	filePath := filepath.Join(root, "resources/conf/model/meta")
	staticModelMeta, err := readDirYaml[crossmodelmgr.ModelMeta](filePath)
	if err != nil {
		return err
	}
	staticModelMeta = append(staticModelMeta, envModelMeta...)
	for _, modelMeta := range staticModelMeta {
		if _, found := id2Meta[modelMeta.ID]; !found {
			if modelMeta.IconURI == "" && modelMeta.IconURL == "" {
				return fmt.Errorf("missing icon URI or icon URL, id=%d", modelMeta.ID)
			} else if modelMeta.IconURL != "" {
				// do nothing
			} else if modelMeta.IconURI != "" {
				// try local path
				base := filepath.Base(modelMeta.IconURI)
				iconPath := filepath.Join("resources/conf/model/icon", base)
				if _, err = os.Stat(iconPath); err == nil {
					// try upload icon
					icon, err := os.ReadFile(iconPath)
					if err != nil {
						return err
					}
					key := fmt.Sprintf("icon_%s_%d", base, time.Now().Second())
					if err := oss.PutObject(ctx, key, icon); err != nil {
						return err
					}
					modelMeta.IconURI = key
				} else if errors.Is(err, os.ErrNotExist) {
					// try to get object from uri
					if _, err := oss.GetObject(ctx, modelMeta.IconURI); err != nil {
						return err
					}
				} else {
					return err
				}
			}
			newMeta, err := svc.CreateModelMeta(ctx, modelMeta)
			if err != nil {
				if errors.Is(err, gorm.ErrDuplicatedKey) {
					logs.Infof("[loadStaticModelConfig] model meta conflict for id=%d, skip", newMeta.ID)
				}
				return err
			} else {
				logs.Infof("[loadStaticModelConfig] model meta create success, id=%d", newMeta.ID)
			}
			id2Meta[newMeta.ID] = newMeta
		} else {
			logs.Infof("[loadStaticModelConfig] model meta founded, skip create, id=%d", modelMeta.ID)

		}
	}

	filePath = filepath.Join(root, "resources/conf/model/entity")
	staticModel, err := readDirYaml[crossmodelmgr.Model](filePath)
	if err != nil {
		return err
	}
	staticModel = append(staticModel, envModelEntity...)
	for _, modelEntity := range staticModel {
		curModelEntities, err := svc.MGetModelByID(ctx, &modelmgr.MGetModelRequest{IDs: []int64{modelEntity.ID}})
		if err != nil {
			return err
		}
		if len(curModelEntities) > 0 {
			logs.Infof("[loadStaticModelConfig] model entity founded, skip create, id=%d", modelEntity.ID)
			continue
		}
		meta, found := id2Meta[modelEntity.Meta.ID]
		if !found {
			return fmt.Errorf("model meta not found for id=%d, model_id=%d", modelEntity.Meta.ID, modelEntity.ID)
		}
		modelEntity.Meta = *meta
		if _, err = svc.CreateModel(ctx, &entity.Model{Model: modelEntity}); err != nil {
			if errors.Is(err, gorm.ErrDuplicatedKey) {
				logs.Infof("[loadStaticModelConfig] model entity conflict for id=%d, skip", modelEntity.ID)
			}
			return err
		} else {
			logs.Infof("[loadStaticModelConfig] model entity create success, id=%d", modelEntity.ID)
		}
	}

	return nil
}

func readDirYaml[T any](dir string) ([]*T, error) {
	des, err := os.ReadDir(dir)
	if err != nil {
		return nil, err
	}
	resp := make([]*T, 0, len(des))
	for _, file := range des {
		if file.IsDir() {
			continue
		}
		if strings.HasSuffix(file.Name(), ".yaml") || strings.HasSuffix(file.Name(), ".yml") {
			filePath := filepath.Join(dir, file.Name())
			data, err := os.ReadFile(filePath)
			if err != nil {
				return nil, err
			}
			var content T
			if err := yaml.Unmarshal(data, &content); err != nil {
				return nil, err
			}
			resp = append(resp, &content)
		}
	}
	return resp, nil
}
