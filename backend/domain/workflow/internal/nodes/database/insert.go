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

type InsertConfig struct {
	DatabaseInfoID int64
	OutputConfig   map[string]*vo.TypeInfo
	Inserter       database.DatabaseOperator
}

type Insert struct {
	config *InsertConfig
}

func NewInsert(_ context.Context, cfg *InsertConfig) (*Insert, error) {
	if cfg == nil {
		return nil, errors.New("config is required")
	}
	if cfg.DatabaseInfoID == 0 {
		return nil, errors.New("database info id is required and greater than 0")
	}

	if cfg.Inserter == nil {
		return nil, errors.New("inserter is required")
	}
	return &Insert{
		config: cfg,
	}, nil

}

func (is *Insert) Insert(ctx context.Context, input map[string]any) (map[string]any, error) {

	fields := parseToInput(input)
	req := &database.InsertRequest{
		DatabaseInfoID: is.config.DatabaseInfoID,
		Fields:         fields,
		IsDebugRun:     isDebugExecute(ctx),
		UserID:         getExecUserID(ctx),
	}

	response, err := is.config.Inserter.Insert(ctx, req)
	if err != nil {
		return nil, err
	}

	ret, err := responseFormatted(is.config.OutputConfig, response)
	if err != nil {
		return nil, err
	}

	return ret, nil
}

func (is *Insert) ToCallbackInput(_ context.Context, input map[string]any) (map[string]any, error) {
	databaseID := is.config.DatabaseInfoID
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

	return result, nil

}
