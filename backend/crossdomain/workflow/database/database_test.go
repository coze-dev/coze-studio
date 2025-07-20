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

	"github.com/spf13/cast"
	"github.com/stretchr/testify/assert"
	"go.uber.org/mock/gomock"

	"github.com/coze-dev/coze-studio/backend/api/model/crossdomain/database"
	"github.com/coze-dev/coze-studio/backend/domain/memory/database/service"
	nodedatabase "github.com/coze-dev/coze-studio/backend/domain/workflow/crossdomain/database"
	mockDatabase "github.com/coze-dev/coze-studio/backend/internal/mock/domain/memory/database"
)

func mockExecuteSQL(t *testing.T) func(ctx context.Context, request *service.ExecuteSQLRequest) (*service.ExecuteSQLResponse, error) {
	return func(ctx context.Context, request *service.ExecuteSQLRequest) (*service.ExecuteSQLResponse, error) {
		if request.OperateType == database.OperateType_Custom {
			assert.Equal(t, *request.SQL, "select * from table where v1=? and v2=?")
			rs := make([]string, 0)
			for idx := range request.SQLParams {
				rs = append(rs, *request.SQLParams[idx].Value)
			}
			assert.Equal(t, rs, []string{"1", "2"})
			return &service.ExecuteSQLResponse{
				Records: []map[string]any{
					{"v1": "1", "v2": "2"},
				},
			}, nil
		}
		if request.OperateType == database.OperateType_Select {
			sFields := []string{"v1", "v2", "v3", "v4"}
			assert.Equal(t, request.SelectFieldList.FieldID, sFields)
			cond := request.Condition.Conditions[1] // in
			assert.Equal(t, "(?,?)", cond.Right)
			assert.Equal(t, database.Operation_IN, cond.Operation)
			assert.Equal(t, "v2_1", *request.SQLParams[1].Value)
			assert.Equal(t, "v2_2", *request.SQLParams[2].Value)
			assert.Equal(t, "%sv4%s", *request.SQLParams[3].Value)
			rowsAffected := int64(10)
			return &service.ExecuteSQLResponse{
				Records: []map[string]any{
					{"v1": "1", "v2": "2", "v3": "3", "v4": "4"},
				},
				RowsAffected: &rowsAffected,
			}, nil

		}
		if request.OperateType == database.OperateType_Delete {
			cond := request.Condition.Conditions[1] // in
			assert.Equal(t, "(?,?)", cond.Right)
			assert.Equal(t, database.Operation_NOT_IN, cond.Operation)
			assert.Equal(t, "v2_1", *request.SQLParams[1].Value)
			assert.Equal(t, "v2_2", *request.SQLParams[2].Value)
			assert.Equal(t, "%sv4%s", *request.SQLParams[3].Value)
			rowsAffected := int64(10)
			return &service.ExecuteSQLResponse{
				Records: []map[string]any{
					{"v1": "1", "v2": "2", "v3": "3", "v4": "4"},
				},
				RowsAffected: &rowsAffected,
			}, nil
		}
		if request.OperateType == database.OperateType_Insert {
			records := request.UpsertRows[0].Records
			ret := map[string]interface{}{
				"v1": "1",
				"v2": 2,
				"v3": 33,
				"v4": "44aacc",
			}
			for idx := range records {
				assert.Equal(t, *request.SQLParams[idx].Value, cast.ToString(ret[records[idx].FieldId]))
			}

		}

		if request.OperateType == database.OperateType_Update {

			records := request.UpsertRows[0].Records
			ret := map[string]interface{}{
				"v1": "1",
				"v2": 2,
				"v3": 33,
				"v4": "aabbcc",
			}
			for idx := range records {
				assert.Equal(t, *request.SQLParams[idx].Value, cast.ToString(ret[records[idx].FieldId]))
			}

			request.SQLParams = request.SQLParams[len(records):]
			cond := request.Condition.Conditions[1] // in
			assert.Equal(t, "(?,?)", cond.Right)
			assert.Equal(t, database.Operation_IN, cond.Operation)
			assert.Equal(t, "v2_1", *request.SQLParams[1].Value)
			assert.Equal(t, "v2_2", *request.SQLParams[2].Value)
			assert.Equal(t, "%sv4%s", *request.SQLParams[3].Value)

		}
		return &service.ExecuteSQLResponse{}, nil
	}
}

func TestDatabase_Database(t *testing.T) {
	ctrl := gomock.NewController(t)
	mockClient := mockDatabase.NewMockDatabase(ctrl)
	defer ctrl.Finish()
	ds := DatabaseRepository{
		client: mockClient,
	}
	mockClient.EXPECT().ExecuteSQL(gomock.Any(), gomock.Any()).DoAndReturn(mockExecuteSQL(t)).AnyTimes()

	t.Run("execute", func(t *testing.T) {
		response, err := ds.Execute(context.Background(), &nodedatabase.CustomSQLRequest{
			DatabaseInfoID: 1,
			SQL:            "select * from table where v1=? and v2=?",
			Params: []nodedatabase.SQLParam{
				nodedatabase.SQLParam{Value: "1"},
				nodedatabase.SQLParam{Value: "2"},
			},
		})
		assert.Nil(t, err)
		assert.Equal(t, response.Objects, []nodedatabase.Object{
			{"v1": "1", "v2": "2"},
		})
	})

	t.Run("select", func(t *testing.T) {
		req := &nodedatabase.QueryRequest{
			DatabaseInfoID: 1,
			SelectFields:   []string{"v1", "v2", "v3", "v4"},
			Limit:          10,
			OrderClauses: []*nodedatabase.OrderClause{
				{FieldID: "v1", IsAsc: true},
				{FieldID: "v2", IsAsc: false},
			},
			ConditionGroup: &nodedatabase.ConditionGroup{
				Conditions: []*nodedatabase.Condition{
					{Left: "v1", Operator: nodedatabase.OperatorEqual, Right: "1"},
					{Left: "v2", Operator: nodedatabase.OperatorIn, Right: []any{"v2_1", "v2_2"}},
					{Left: "v3", Operator: nodedatabase.OperatorIsNull},
					{Left: "v4", Operator: nodedatabase.OperatorLike, Right: "v4"},
				},
				Relation: nodedatabase.ClauseRelationOR,
			},
		}

		response, err := ds.Query(context.Background(), req)
		assert.Nil(t, err)
		assert.Equal(t, *response.RowNumber, int64(10))
	})

	t.Run("delete", func(t *testing.T) {
		req := &nodedatabase.DeleteRequest{
			DatabaseInfoID: 1,
			ConditionGroup: &nodedatabase.ConditionGroup{
				Conditions: []*nodedatabase.Condition{
					{Left: "v1", Operator: nodedatabase.OperatorEqual, Right: "1"},
					{Left: "v2", Operator: nodedatabase.OperatorNotIn, Right: []any{"v2_1", "v2_2"}},
					{Left: "v3", Operator: nodedatabase.OperatorIsNotNull},
					{Left: "v4", Operator: nodedatabase.OperatorNotLike, Right: "v4"},
				},
				Relation: nodedatabase.ClauseRelationOR,
			},
		}
		response, err := ds.Delete(context.Background(), req)
		assert.Nil(t, err)
		assert.Equal(t, *response.RowNumber, int64(10))
	})

	t.Run("insert", func(t *testing.T) {
		req := &nodedatabase.InsertRequest{
			DatabaseInfoID: 1,
			Fields: map[string]interface{}{
				"v1": "1",
				"v2": 2,
				"v3": 33,
				"v4": "44aacc",
			},
		}
		_, err := ds.Insert(context.Background(), req)
		assert.Nil(t, err)
	})

	t.Run("update", func(t *testing.T) {
		req := &nodedatabase.UpdateRequest{
			DatabaseInfoID: 1,
			ConditionGroup: &nodedatabase.ConditionGroup{
				Conditions: []*nodedatabase.Condition{
					{Left: "v1", Operator: nodedatabase.OperatorEqual, Right: "1"},
					{Left: "v2", Operator: nodedatabase.OperatorIn, Right: []any{"v2_1", "v2_2"}},
					{Left: "v3", Operator: nodedatabase.OperatorIsNull},
					{Left: "v4", Operator: nodedatabase.OperatorLike, Right: "v4"},
				},
				Relation: nodedatabase.ClauseRelationOR,
			},
			Fields: map[string]interface{}{
				"v1": "1",
				"v2": 2,
				"v3": 33,
				"v4": "aabbcc",
			},
		}
		_, err := ds.Update(context.Background(), req)
		assert.Nil(t, err)
	})
}
