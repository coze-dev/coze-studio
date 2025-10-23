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

type DeleteConfig struct {
	DatabaseInfoID int64
	ClauseGroup    *database.ClauseGroup
}

func (d *DeleteConfig) Adapt(_ context.Context, n *vo.Node, _ ...nodes.AdaptOption) (*schema.NodeSchema, error) {
	ns := &schema.NodeSchema{
		Key:     vo.NodeKey(n.ID),
		Type:    entity.NodeTypeDatabaseDelete,
		Name:    n.Data.Meta.Title,
		Configs: d,
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
	d.DatabaseInfoID = dsID

	deleteParam := n.Data.Inputs.DeleteParam

	clauseGroup, err := buildClauseGroupFromCondition(&deleteParam.Condition)
	if err != nil {
		return nil, err
	}
	d.ClauseGroup = clauseGroup

	if err = setDatabaseInputsForNodeSchema(n, ns); err != nil {
		return nil, err
	}

	if err = convert.SetOutputTypesForNodeSchema(n, ns); err != nil {
		return nil, err
	}

	return ns, nil
}

func (d *DeleteConfig) Build(_ context.Context, ns *schema.NodeSchema, _ ...schema.BuildOption) (any, error) {
	if d.DatabaseInfoID == 0 {
		return nil, errors.New("database info id is required and greater than 0")
	}

	if d.ClauseGroup == nil {
		return nil, errors.New("clauseGroup is required")
	}

	return &Delete{
		databaseInfoID: d.DatabaseInfoID,
		clauseGroup:    d.ClauseGroup,
		outputTypes:    ns.OutputTypes,
	}, nil
}

type Delete struct {
	databaseInfoID int64
	clauseGroup    *database.ClauseGroup
	outputTypes    map[string]*vo.TypeInfo
}

func (d *Delete) Invoke(ctx context.Context, in map[string]any) (map[string]any, error) {
	conditionGroup, err := convertClauseGroupToConditionGroup(ctx, d.clauseGroup, in)
	if err != nil {
		return nil, err
	}
	request := &database.DeleteRequest{
		DatabaseInfoID: d.databaseInfoID,
		ConditionGroup: conditionGroup,
		IsDebugRun:     isDebugExecute(ctx),
		UserID:         getExecUserID(ctx),
		ConnectorID:    getConnectorID(ctx),
	}

	response, err := crossdatabase.DefaultSVC().Delete(ctx, request)
	if err != nil {
		return nil, err
	}

	ret, err := responseFormatted(d.outputTypes, response)
	if err != nil {
		return nil, err
	}
	return ret, nil
}

func (d *Delete) ToCallbackInput(_ context.Context, in map[string]any) (*nodes.StructuredCallbackInput, error) {
	conditionGroup, err := convertClauseGroupToConditionGroup(context.Background(), d.clauseGroup, in)
	if err != nil {
		return nil, err
	}
	return d.toDatabaseDeleteCallbackInput(conditionGroup)
}

func (d *Delete) toDatabaseDeleteCallbackInput(conditionGroup *database.ConditionGroup) (
	*nodes.StructuredCallbackInput, error) {
	databaseID := d.databaseInfoID
	result := make(map[string]any)

	result["databaseInfoList"] = []string{fmt.Sprintf("%d", databaseID)}
	result["deleteParam"] = map[string]any{}

	condition, err := convertToCondition(conditionGroup)
	if err != nil {
		return nil, err
	}
	type Field struct {
		FieldID    string `json:"fieldId"`
		IsDistinct bool   `json:"isDistinct"`
	}
	result["deleteParam"] = map[string]any{
		"condition": condition}

	return &nodes.StructuredCallbackInput{
		Input: result,
	}, nil
}
