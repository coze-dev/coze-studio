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
	"testing"

	"github.com/bytedance/mockey"
	"github.com/stretchr/testify/assert"
	"go.uber.org/mock/gomock"

	crossdatabase "github.com/coze-dev/coze-studio/backend/crossdomain/database"
	"github.com/coze-dev/coze-studio/backend/crossdomain/database/databasemock"
	database "github.com/coze-dev/coze-studio/backend/crossdomain/database/model"
	workflowModel "github.com/coze-dev/coze-studio/backend/crossdomain/workflow/model"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/execute"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/schema"
)

type mockCustomSQLer struct {
	validate func(req *database.CustomSQLRequest)
}

func (m mockCustomSQLer) Execute() func(ctx context.Context, request *database.CustomSQLRequest) (*database.Response, error) {
	return func(ctx context.Context, request *database.CustomSQLRequest) (*database.Response, error) {
		m.validate(request)
		r := &database.Response{
			Objects: []database.Object{
				{
					"v1": "v1_ret",
					"v2": "v2_ret",
				},
			},
		}

		return r, nil
	}
}

func TestCustomSQL_Execute(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockSQLer := mockCustomSQLer{
		validate: func(req *database.CustomSQLRequest) {
			assert.Equal(t, int64(111), req.DatabaseInfoID)
			ps := []database.SQLParam{
				{Value: "v2_value"},
				{Value: "v3_value"},
				{Value: "1"},
			}
			assert.Equal(t, ps, req.Params)
			assert.Equal(t, "select * from v1 where v1 = v1_value and v2 = ? and v3 = ? and v4 = ?", req.SQL)
		},
	}

	defer mockey.Mock(execute.GetExeCtx).Return(&execute.Context{
		RootCtx: execute.RootCtx{
			ExeCfg: workflowModel.ExecuteConfig{
				Mode:     workflowModel.ExecuteModeDebug,
				Operator: 123,
				BizType:  workflowModel.BizTypeWorkflow,
			},
		},
	}).Build().UnPatch()

	mockDatabaseOperator := databasemock.NewMockDatabase(ctrl)
	mockDatabaseOperator.EXPECT().Execute(gomock.Any(), gomock.Any()).DoAndReturn(mockSQLer.Execute()).AnyTimes()
	crossdatabase.SetDefaultSVC(mockDatabaseOperator)

	cfg := &CustomSQLConfig{
		DatabaseInfoID: 111,
		SQLTemplate:    "select * from v1 where v1 = {{v1}} and v2 = '{{v2}}' and v3 = `{{v3}}` and v4 = '{{v4}}'",
	}

	c1, err := cfg.Build(context.Background(), &schema.NodeSchema{
		OutputTypes: map[string]*vo.TypeInfo{
			"outputList": {Type: vo.DataTypeArray, ElemTypeInfo: &vo.TypeInfo{Type: vo.DataTypeObject, Properties: map[string]*vo.TypeInfo{
				"v1": {Type: vo.DataTypeString},
				"v2": {Type: vo.DataTypeString},
			}}},
			"rowNum": {Type: vo.DataTypeInteger},
		},
	})
	assert.NoError(t, err)

	ret, err := c1.(*CustomSQL).Invoke(t.Context(), map[string]any{
		"v1": "v1_value",
		"v2": "v2_value",
		"v3": "v3_value",
		"v4": true,
	})

	assert.Nil(t, err)

	assert.Equal(t, "v1_ret", ret[outputList].([]any)[0].(database.Object)["v1"])
	assert.Equal(t, "v2_ret", ret[outputList].([]any)[0].(database.Object)["v2"])

}
