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

package dal

import (
	"context"
	"errors"
	"time"

	"gorm.io/gorm"

	"github.com/coze-dev/coze-studio/backend/domain/shortcutcmd/entity"
	"github.com/coze-dev/coze-studio/backend/domain/shortcutcmd/internal/dal/model"
	"github.com/coze-dev/coze-studio/backend/domain/shortcutcmd/internal/dal/query"
	"github.com/coze-dev/coze-studio/backend/infra/idgen"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/conv"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/slices"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
)

type ShortCutCmdDAO struct {
	db    *gorm.DB
	query *query.Query
	idgen idgen.IDGenerator
}

func NewShortCutCmdDAO(db *gorm.DB, idgen idgen.IDGenerator) *ShortCutCmdDAO {
	return &ShortCutCmdDAO{
		db:    db,
		query: query.Use(db),
		idgen: idgen,
	}
}
func (dao *ShortCutCmdDAO) Create(ctx context.Context, shortcut *entity.ShortcutCmd) (*entity.ShortcutCmd, error) {
	createPO, err := dao.buildCreatePO(ctx, shortcut)
	if err != nil {
		return nil, err
	}
	createErr := dao.query.ShortcutCommand.WithContext(ctx).Debug().Create(createPO)
	logs.CtxInfof(ctx, "ShortcutCommand %v, err:%v", conv.DebugJsonToStr(createPO), err)
	if createErr != nil {
		return nil, createErr
	}
	return createPO, nil
}

func (dao *ShortCutCmdDAO) buildCreatePO(ctx context.Context, shortcut *entity.ShortcutCmd) (*model.ShortcutCommand, error) {
	cmdID, err := dao.idgen.GenID(ctx)

	if err != nil {
		return nil, err
	}

	po := &model.ShortcutCommand{
		ObjectID:        shortcut.ObjectID,
		CommandID:       cmdID,
		CommandName:     shortcut.CommandName,
		ShortcutCommand: shortcut.ShortcutCommand,
		Description:     shortcut.Description,
		SendType:        shortcut.SendType,
		ToolType:        shortcut.ToolType,
		WorkFlowID:      shortcut.WorkFlowID,
		PluginID:        shortcut.PluginID,
		PluginToolName:  shortcut.PluginToolName,
		TemplateQuery:   shortcut.TemplateQuery,
		Components:      shortcut.Components,
		CardSchema:      shortcut.CardSchema,
		ToolInfo:        shortcut.ToolInfo,
		Status:          1,
		CreatorID:       shortcut.CreatorID,
		CreatedAt:       time.Now().UnixMilli(),
		UpdatedAt:       time.Now().UnixMilli(),
		AgentID:         shortcut.AgentID,
		ShortcutIcon:    shortcut.ShortcutIcon,
		PluginToolID:    shortcut.PluginToolID,
		Source:          shortcut.Source,
	}
	return po, nil
}

func (dao *ShortCutCmdDAO) Update(ctx context.Context, shortcut *entity.ShortcutCmd) (*entity.ShortcutCmd, error) {
	updatePO := dao.buildUpdatePO(ctx, shortcut)
	_, updateErr := dao.query.ShortcutCommand.WithContext(ctx).Debug().Where(dao.query.ShortcutCommand.CommandID.Eq(shortcut.CommandID)).Updates(updatePO)

	if updateErr != nil {
		return nil, updateErr
	}
	return updatePO, nil
}

func (dao *ShortCutCmdDAO) buildUpdatePO(ctx context.Context, shortcut *entity.ShortcutCmd) *model.ShortcutCommand {

	po := shortcut
	po.UpdatedAt = time.Now().UnixMilli()

	return po
}

func (dao *ShortCutCmdDAO) List(ctx context.Context, lm *entity.ListMeta) ([]*entity.ShortcutCmd, error) {
	if len(lm.CommandIDs) == 0 {
		return nil, nil
	}

	do := dao.query.ShortcutCommand.WithContext(ctx).Where(dao.query.ShortcutCommand.ObjectID.Eq(lm.ObjectID)).Debug().
		Where(dao.query.ShortcutCommand.CommandID.In(lm.CommandIDs...)).
		Where(dao.query.ShortcutCommand.IsOnline.Eq(lm.IsOnline))

	poList, err := do.Find()

	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}
	return slices.Transform(poList, func(po *model.ShortcutCommand) *entity.ShortcutCmd {
		return po
	}), nil
}

func (dao *ShortCutCmdDAO) GetByCmdID(ctx context.Context, cmdID int64, isOnline int32) (*entity.ShortcutCmd, error) {

	po, err := dao.query.ShortcutCommand.WithContext(ctx).Where(dao.query.ShortcutCommand.CommandID.Eq(cmdID)).
		Where(dao.query.ShortcutCommand.IsOnline.Eq(isOnline)).Debug().
		First()
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}
	return po, nil
}

func (dao *ShortCutCmdDAO) PublishCMDs(ctx context.Context, objID int64, cmdIDs []int64) error {
	if len(cmdIDs) == 0 {
		return nil
	}
	draftCmds, err := dao.query.ShortcutCommand.WithContext(ctx).Debug().
		Where(dao.query.ShortcutCommand.ObjectID.Eq(objID)).
		Where(dao.query.ShortcutCommand.CommandID.In(cmdIDs...)).
		Where(dao.query.ShortcutCommand.IsOnline.Eq(0)).
		Find()
	if err != nil {
		return err
	}

	tx := dao.query.Begin()
	defer func() {
		if tx.Error != nil {
			rbErr := tx.Rollback()
			if rbErr != nil {
				logs.CtxErrorf(ctx, "rollback failed, err:%v", rbErr)
			}
		}
		cErr := tx.Commit()
		if cErr != nil {
			logs.CtxErrorf(ctx, "commit failed, err:%v", cErr)
		}
	}()

	onlineCmds, err := dao.query.ShortcutCommand.WithContext(ctx).Debug().
		Where(dao.query.ShortcutCommand.ObjectID.Eq(objID)).
		Where(dao.query.ShortcutCommand.CommandID.In(cmdIDs...)).
		Where(dao.query.ShortcutCommand.IsOnline.Eq(1)).Find()

	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return err
	}
	onelineCmdMap := make(map[int64]*model.ShortcutCommand)
	for _, one := range onlineCmds {
		onelineCmdMap[one.CommandID] = one
	}

	for _, item := range draftCmds {
		item.IsOnline = 1
		item.UpdatedAt = time.Now().UnixMilli()
		item.ID = 0
		var opErr error
		if _, ok := onelineCmdMap[item.CommandID]; !ok {
			opErr = tx.ShortcutCommand.WithContext(ctx).Debug().Create(item)
		} else {
			opErr = tx.ShortcutCommand.WithContext(ctx).Debug().
				Where(dao.query.ShortcutCommand.ObjectID.Eq(item.ObjectID)).
				Where(dao.query.ShortcutCommand.CommandID.Eq(item.CommandID)).
				Where(dao.query.ShortcutCommand.IsOnline.Eq(item.IsOnline)).
				Save(item)
		}

		logs.CtxInfof(ctx, "publish cmd %v, err:%v", conv.DebugJsonToStr(item), opErr)
		if opErr != nil {
			return opErr
		}
	}

	return nil
}
