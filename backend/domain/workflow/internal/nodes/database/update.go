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
	"errors"
	"fmt"

	"github.com/coze-dev/coze-studio/backend/domain/workflow/crossdomain/database"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
)

type UpdateConfig struct {
	DatabaseInfoID int64
	ClauseGroup    *database.ClauseGroup
	OutputConfig   map[string]*vo.TypeInfo
	Updater        database.DatabaseOperator
}

type Update struct {
	config *UpdateConfig
}
type UpdateInventory struct {
	ConditionGroup *database.ConditionGroup
	Fields         map[string]any
}

func NewUpdate(_ context.Context, cfg *UpdateConfig) (*Update, error) {
	if cfg == nil {
		return nil, errors.New("config is required")
	}
	if cfg.DatabaseInfoID == 0 {
		return nil, errors.New("database info id is required and greater than 0")
	}

	if cfg.ClauseGroup == nil {
		return nil, errors.New("clause group is required and greater than 0")
	}

	if cfg.Updater == nil {
		return nil, errors.New("updater is required")
	}

	return &Update{config: cfg}, nil
}

func (u *Update) Update(ctx context.Context, in map[string]any) (map[string]any, error) {
	inventory, err := convertClauseGroupToUpdateInventory(ctx, u.config.ClauseGroup, in)
	if err != nil {
		return nil, err
	}

	fields := make(map[string]any)

	for key, value := range inventory.Fields {
		fields[key] = value
	}

	req := &database.UpdateRequest{
		DatabaseInfoID: u.config.DatabaseInfoID,
		ConditionGroup: inventory.ConditionGroup,
		Fields:         fields,
		IsDebugRun:     isDebugExecute(ctx),
		UserID:         getExecUserID(ctx),
	}

	response, err := u.config.Updater.Update(ctx, req)

	if err != nil {
		return nil, err
	}

	ret, err := responseFormatted(u.config.OutputConfig, response)
	if err != nil {
		return nil, err
	}

	return ret, nil
}

func (u *Update) ToCallbackInput(_ context.Context, in map[string]any) (map[string]any, error) {
	inventory, err := convertClauseGroupToUpdateInventory(context.Background(), u.config.ClauseGroup, in)
	if err != nil {
		return nil, err
	}
	return u.toDatabaseUpdateCallbackInput(inventory)
}

func (u *Update) toDatabaseUpdateCallbackInput(inventory *UpdateInventory) (map[string]any, error) {
	databaseID := u.config.DatabaseInfoID
	result := make(map[string]any)
	result["databaseInfoList"] = []string{fmt.Sprintf("%d", databaseID)}
	result["updateParam"] = map[string]any{}

	condition, err := convertToCondition(inventory.ConditionGroup)
	if err != nil {
		return nil, err
	}
	type FieldInfo struct {
		fieldID    string
		fieldValue any
	}

	fieldInfo := make([]FieldInfo, 0)
	for k, v := range inventory.Fields {
		fieldInfo = append(fieldInfo, FieldInfo{
			fieldID:    k,
			fieldValue: v,
		})
	}

	result["updateParam"] = map[string]any{
		"condition": condition,
		"fieldInfo": fieldInfo,
	}
	return result, nil

}
