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

	crossmodelmgr "code.byted.org/flow/opencoze/backend/api/model/crossdomain/modelmgr"
	"code.byted.org/flow/opencoze/backend/domain/modelmgr"
	"code.byted.org/flow/opencoze/backend/domain/modelmgr/entity"
	"code.byted.org/flow/opencoze/backend/domain/modelmgr/service"
	"code.byted.org/flow/opencoze/backend/infra/contract/storage"
	"code.byted.org/flow/opencoze/backend/infra/impl/idgen"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
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

	root := os.Getenv("PWD")
	filePath := filepath.Join(root, "resources/conf/model/meta")
	staticModelMeta, err := readDirYaml[crossmodelmgr.ModelMeta](filePath)
	if err != nil {
		return err
	}
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
				return err
			}
			logs.Infof("[loadStaticModelConfig] model meta create success, id=%d", newMeta.ID)
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
			return err
		}
		logs.Infof("[loadStaticModelConfig] model entity create success, id=%d", modelEntity.ID)
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
