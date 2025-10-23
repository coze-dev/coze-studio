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
	"strconv"

	crossdatabase "github.com/coze-dev/coze-studio/backend/crossdomain/database"
	database "github.com/coze-dev/coze-studio/backend/crossdomain/database/model"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/canvas/convert"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/nodes"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/schema"
)

type UpdateConfig struct {
	DatabaseInfoID int64
	ClauseGroup    *database.ClauseGroup
}

func (u *UpdateConfig) Adapt(_ context.Context, n *vo.Node, _ ...nodes.AdaptOption) (*schema.NodeSchema, error) {
	ns := &schema.NodeSchema{
		Key:     vo.NodeKey(n.ID),
		Type:    entity.NodeTypeDatabaseUpdate,
		Name:    n.Data.Meta.Title,
		Configs: u,
	}

	dsList := n.Data.Inputs.DatabaseInfoList
	if len(dsList) == 0 {
		return nil, fmt.Errorf("database info is requird")
	}
	databaseInfo := dsList[0]

	dsID, err := strconv.ParseInt(databaseInfo.DatabaseInfoID, 10, 64)
	if err != nil {
		return nil, err
	}
	u.DatabaseInfoID = dsID

	updateParam := n.Data.Inputs.UpdateParam
	if updateParam == nil {
		return nil, fmt.Errorf("update param is requird")
	}
	clauseGroup, err := buildClauseGroupFromCondition(&updateParam.Condition)
	if err != nil {
		return nil, err
	}
	u.ClauseGroup = clauseGroup

	if err = setDatabaseInputsForNodeSchema(n, ns); err != nil {
		return nil, err
	}

	if err = convert.SetOutputTypesForNodeSchema(n, ns); err != nil {
		return nil, err
	}

	return ns, nil
}

func (u *UpdateConfig) Build(_ context.Context, ns *schema.NodeSchema, _ ...schema.BuildOption) (any, error) {
	if u.DatabaseInfoID == 0 {
		return nil, errors.New("database info id is required and greater than 0")
	}

	if u.ClauseGroup == nil {
		return nil, errors.New("clause group is required and greater than 0")
	}

	return &Update{
		databaseInfoID: u.DatabaseInfoID,
		clauseGroup:    u.ClauseGroup,
		outputTypes:    ns.OutputTypes,
	}, nil
}

type Update struct {
	databaseInfoID int64
	clauseGroup    *database.ClauseGroup
	outputTypes    map[string]*vo.TypeInfo
}

type updateInventory struct {
	ConditionGroup *database.ConditionGroup
	Fields         map[string]any
}

func (u *Update) Invoke(ctx context.Context, in map[string]any) (map[string]any, error) {
	inventory, err := convertClauseGroupToUpdateInventory(ctx, u.clauseGroup, in)
	if err != nil {
		return nil, err
	}

	fields := make(map[string]any)

	for key, value := range inventory.Fields {
		fields[key] = value
	}

	req := &database.UpdateRequest{
		DatabaseInfoID: u.databaseInfoID,
		ConditionGroup: inventory.ConditionGroup,
		Fields:         fields,
		IsDebugRun:     isDebugExecute(ctx),
		UserID:         getExecUserID(ctx),
		ConnectorID:    getConnectorID(ctx),
	}

	response, err := crossdatabase.DefaultSVC().Update(ctx, req)

	if err != nil {
		return nil, err
	}

	ret, err := responseFormatted(u.outputTypes, response)
	if err != nil {
		return nil, err
	}

	return ret, nil
}

func (u *Update) ToCallbackInput(_ context.Context, in map[string]any) (
	*nodes.StructuredCallbackInput, error) {
	inventory, err := convertClauseGroupToUpdateInventory(context.Background(), u.clauseGroup, in)
	if err != nil {
		return nil, err
	}
	return u.toDatabaseUpdateCallbackInput(inventory)
}

func (u *Update) toDatabaseUpdateCallbackInput(inventory *updateInventory) (
	*nodes.StructuredCallbackInput, error) {
	databaseID := u.databaseInfoID
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

	return &nodes.StructuredCallbackInput{
		Input: result,
	}, nil
}
