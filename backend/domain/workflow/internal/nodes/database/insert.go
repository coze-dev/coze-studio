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

type InsertConfig struct {
	DatabaseInfoID int64
}

func (i *InsertConfig) Adapt(_ context.Context, n *vo.Node, _ ...nodes.AdaptOption) (*schema.NodeSchema, error) {
	ns := &schema.NodeSchema{
		Key:     vo.NodeKey(n.ID),
		Type:    entity.NodeTypeDatabaseInsert,
		Name:    n.Data.Meta.Title,
		Configs: i,
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
	i.DatabaseInfoID = dsID

	if err = setDatabaseInputsForNodeSchema(n, ns); err != nil {
		return nil, err
	}

	if err = convert.SetOutputTypesForNodeSchema(n, ns); err != nil {
		return nil, err
	}

	return ns, nil
}

func (i *InsertConfig) Build(_ context.Context, ns *schema.NodeSchema, _ ...schema.BuildOption) (any, error) {
	if i.DatabaseInfoID == 0 {
		return nil, errors.New("database info id is required and greater than 0")
	}

	return &Insert{
		databaseInfoID: i.DatabaseInfoID,
		outputTypes:    ns.OutputTypes,
	}, nil
}

type Insert struct {
	databaseInfoID int64
	outputTypes    map[string]*vo.TypeInfo
}

func (is *Insert) Invoke(ctx context.Context, input map[string]any) (map[string]any, error) {
	fields := parseToInput(input)
	req := &database.InsertRequest{
		DatabaseInfoID: is.databaseInfoID,
		Fields:         fields,
		IsDebugRun:     isDebugExecute(ctx),
		UserID:         getExecUserID(ctx),
		ConnectorID:    getConnectorID(ctx),
	}

	response, err := crossdatabase.DefaultSVC().Insert(ctx, req)
	if err != nil {
		return nil, err
	}

	ret, err := responseFormatted(is.outputTypes, response)
	if err != nil {
		return nil, err
	}

	return ret, nil
}

func (is *Insert) ToCallbackInput(_ context.Context, input map[string]any) (
	*nodes.StructuredCallbackInput, error) {
	databaseID := is.databaseInfoID
	fs := parseToInput(input)
	result := make(map[string]any)
	result["databaseInfoList"] = []string{fmt.Sprintf("%d", databaseID)}

	type FieldInfo struct {
		FieldID    string `json:"fieldId"`
		FieldValue any    `json:"fieldValue"`
	}

	fieldInfo := make([]*FieldInfo, 0)
	for k, v := range fs {
		fieldInfo = append(fieldInfo, &FieldInfo{
			FieldID:    k,
			FieldValue: v,
		})
	}
	result["insertParam"] = map[string]any{
		"fieldInfo": fieldInfo,
	}

	return &nodes.StructuredCallbackInput{
		Input: result,
	}, nil

}
