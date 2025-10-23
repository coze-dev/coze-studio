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
	"fmt"
	"testing"

	"github.com/bytedance/mockey"
	"go.uber.org/mock/gomock"

	"github.com/stretchr/testify/assert"

	crossdatabase "github.com/coze-dev/coze-studio/backend/crossdomain/database"
	"github.com/coze-dev/coze-studio/backend/crossdomain/database/databasemock"
	database "github.com/coze-dev/coze-studio/backend/crossdomain/database/model"
	workflowModel "github.com/coze-dev/coze-studio/backend/crossdomain/workflow/model"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/execute"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/schema"
)

type mockDsSelect struct {
	t        *testing.T
	objects  []database.Object
	validate func(request *database.QueryRequest)
}

func (m *mockDsSelect) Query() func(ctx context.Context, request *database.QueryRequest) (*database.Response, error) {
	return func(ctx context.Context, request *database.QueryRequest) (*database.Response, error) {
		n := int64(1)

		m.validate(request)

		return &database.Response{
			RowNumber: &n,
			Objects:   m.objects,
		}, nil
	}
}

func TestDataset_Query(t *testing.T) {
	defer mockey.Mock(execute.GetExeCtx).Return(&execute.Context{
		RootCtx: execute.RootCtx{
			ExeCfg: workflowModel.ExecuteConfig{
				Mode:     workflowModel.ExecuteModeDebug,
				Operator: 123,
				BizType:  workflowModel.BizTypeWorkflow,
			},
		},
	}).Build().UnPatch()

	ctrl := gomock.NewController(t)
	defer ctrl.Finish()
	t.Run("string case", func(t *testing.T) {
		t.Run("single", func(t *testing.T) {
			objects := make([]database.Object, 0)
			objects = append(objects, database.Object{
				"v1": "1",
				"v2": int64(2),
			})

			cfg := &QueryConfig{
				DatabaseInfoID: 111,
				ClauseGroup: &database.ClauseGroup{
					Single: &database.Clause{
						Left:     "v1",
						Operator: database.OperatorLike,
					},
				},
				OrderClauses: []*database.OrderClause{{FieldID: "v1", IsAsc: false}},
				QueryFields:  []string{"v1", "v2"},
				Limit:        10,
			}

			mockQuery := &mockDsSelect{objects: objects, t: t, validate: func(request *database.QueryRequest) {
				if request.DatabaseInfoID != cfg.DatabaseInfoID {
					t.Fatal("database id should be equal")
				}
				cGroup := request.ConditionGroup
				assert.Equal(t, cGroup.Conditions[0].Left, cfg.ClauseGroup.Single.Left)
				assert.Equal(t, cGroup.Conditions[0].Operator, cfg.ClauseGroup.Single.Operator)

			}}
			mockDatabaseOperator := databasemock.NewMockDatabase(ctrl)
			mockDatabaseOperator.EXPECT().Query(gomock.Any(), gomock.Any()).DoAndReturn(mockQuery.Query())
			crossdatabase.SetDefaultSVC(mockDatabaseOperator)

			ds, err := cfg.Build(context.Background(), &schema.NodeSchema{
				OutputTypes: map[string]*vo.TypeInfo{
					"outputList": {Type: vo.DataTypeArray, ElemTypeInfo: &vo.TypeInfo{
						Type: vo.DataTypeObject,
						Properties: map[string]*vo.TypeInfo{
							"v1": {Type: vo.DataTypeString},
							"v2": {Type: vo.DataTypeString},
						},
					}},
					"rowNum": {Type: vo.DataTypeInteger},
				},
			})
			assert.NoError(t, err)

			in := map[string]interface{}{
				"__condition_right_0": 1,
			}

			result, err := ds.(*Query).Invoke(t.Context(), in)
			assert.NoError(t, err)
			assert.Equal(t, "1", result["outputList"].([]any)[0].(database.Object)["v1"])
			assert.Equal(t, "2", result["outputList"].([]any)[0].(database.Object)["v2"])
		})

		t.Run("multi", func(t *testing.T) {
			cfg := &QueryConfig{
				DatabaseInfoID: 111,
				ClauseGroup: &database.ClauseGroup{
					Multi: &database.MultiClause{
						Relation: database.ClauseRelationOR,
						Clauses: []*database.Clause{
							{Left: "v1", Operator: database.OperatorLike},
							{Left: "v2", Operator: database.OperatorLike},
						},
					},
				},

				OrderClauses: []*database.OrderClause{{FieldID: "v1", IsAsc: false}},
				QueryFields:  []string{"v1", "v2"},
				Limit:        10,
			}

			objects := make([]database.Object, 0)
			objects = append(objects, database.Object{
				"v1": "1",
				"v2": int64(2),
			})

			mockQuery := &mockDsSelect{objects: objects, t: t, validate: func(request *database.QueryRequest) {
				if request.DatabaseInfoID != cfg.DatabaseInfoID {
					t.Fatal("database id should be equal")

				}
				cGroup := request.ConditionGroup
				assert.Equal(t, cGroup.Conditions[0].Right, 1)
				assert.Equal(t, cGroup.Conditions[1].Right, 2)
				assert.Equal(t, cGroup.Relation, cfg.ClauseGroup.Multi.Relation)

			}}
			mockDatabaseOperator := databasemock.NewMockDatabase(ctrl)
			mockDatabaseOperator.EXPECT().Query(gomock.Any(), gomock.Any()).DoAndReturn(mockQuery.Query()).AnyTimes()
			crossdatabase.SetDefaultSVC(mockDatabaseOperator)

			ds, err := cfg.Build(context.Background(), &schema.NodeSchema{
				OutputTypes: map[string]*vo.TypeInfo{
					"outputList": {Type: vo.DataTypeArray, ElemTypeInfo: &vo.TypeInfo{
						Type: vo.DataTypeObject,
						Properties: map[string]*vo.TypeInfo{
							"v1": {Type: vo.DataTypeString},
							"v2": {Type: vo.DataTypeString},
						},
					}},
					"rowNum": {Type: vo.DataTypeInteger},
				},
			})
			assert.NoError(t, err)

			in := map[string]any{
				"__condition_right_0": 1,
				"__condition_right_1": 2,
			}

			result, err := ds.(*Query).Invoke(t.Context(), in)
			assert.NoError(t, err)
			assert.NoError(t, err)
			assert.Equal(t, "1", result["outputList"].([]any)[0].(database.Object)["v1"])
			assert.Equal(t, "2", result["outputList"].([]any)[0].(database.Object)["v2"])
		})

		t.Run("formated error", func(t *testing.T) {
			cfg := &QueryConfig{
				DatabaseInfoID: 111,
				ClauseGroup: &database.ClauseGroup{
					Single: &database.Clause{
						Left:     "v1",
						Operator: database.OperatorLike,
					},
				},
				OrderClauses: []*database.OrderClause{{FieldID: "v1", IsAsc: false}},
				QueryFields:  []string{"v1", "v2"},
				Limit:        10,
			}
			objects := make([]database.Object, 0)
			objects = append(objects, database.Object{
				"v1": "abc",
				"v2": int64(2),
			})

			mockQuery := &mockDsSelect{objects: objects, t: t, validate: func(request *database.QueryRequest) {
				if request.DatabaseInfoID != cfg.DatabaseInfoID {
					t.Fatal("database id should be equal")

				}
				cGroup := request.ConditionGroup
				assert.Equal(t, cGroup.Conditions[0].Left, cfg.ClauseGroup.Single.Left)
				assert.Equal(t, cGroup.Conditions[0].Operator, cfg.ClauseGroup.Single.Operator)

			}}
			mockDatabaseOperator := databasemock.NewMockDatabase(ctrl)
			mockDatabaseOperator.EXPECT().Query(gomock.Any(), gomock.Any()).DoAndReturn(mockQuery.Query()).AnyTimes()
			crossdatabase.SetDefaultSVC(mockDatabaseOperator)

			ds, err := cfg.Build(context.Background(), &schema.NodeSchema{
				OutputTypes: map[string]*vo.TypeInfo{
					"outputList": {Type: vo.DataTypeArray, ElemTypeInfo: &vo.TypeInfo{
						Type: vo.DataTypeObject,
						Properties: map[string]*vo.TypeInfo{
							"v1": {Type: vo.DataTypeInteger},
							"v2": {Type: vo.DataTypeInteger},
						},
					}},
					"rowNum": {Type: vo.DataTypeInteger},
				},
			})
			assert.NoError(t, err)

			in := map[string]any{
				"__condition_right_0": 1,
			}

			result, err := ds.(*Query).Invoke(t.Context(), in)
			assert.NoError(t, err)
			fmt.Println(result)
			assert.Equal(t, map[string]any{
				"v1": nil,
				"v2": int64(2),
			}, result["outputList"].([]any)[0])

		})

		t.Run("redundancy return field", func(t *testing.T) {
			cfg := &QueryConfig{
				DatabaseInfoID: 111,
				ClauseGroup: &database.ClauseGroup{
					Single: &database.Clause{
						Left:     "v1",
						Operator: database.OperatorLike,
					},
				},
				OrderClauses: []*database.OrderClause{{FieldID: "v1", IsAsc: false}},
				QueryFields:  []string{"v1", "v2"},
				Limit:        10,
			}
			objects := make([]database.Object, 0)
			objects = append(objects, database.Object{
				"v1": "1",
				"v2": int64(2),
			})
			mockQuery := &mockDsSelect{objects: objects, t: t, validate: func(request *database.QueryRequest) {
				if request.DatabaseInfoID != cfg.DatabaseInfoID {
					t.Fatal("database id should be equal")
				}
				cGroup := request.ConditionGroup
				assert.Equal(t, cGroup.Conditions[0].Left, cfg.ClauseGroup.Single.Left)
				assert.Equal(t, cGroup.Conditions[0].Operator, cfg.ClauseGroup.Single.Operator)
			}}
			mockDatabaseOperator := databasemock.NewMockDatabase(ctrl)
			mockDatabaseOperator.EXPECT().Query(gomock.Any(), gomock.Any()).DoAndReturn(mockQuery.Query()).AnyTimes()
			crossdatabase.SetDefaultSVC(mockDatabaseOperator)

			ds, err := cfg.Build(context.Background(), &schema.NodeSchema{
				OutputTypes: map[string]*vo.TypeInfo{
					"outputList": {Type: vo.DataTypeArray, ElemTypeInfo: &vo.TypeInfo{
						Type: vo.DataTypeObject,
						Properties: map[string]*vo.TypeInfo{
							"v1": {Type: vo.DataTypeInteger},
							"v2": {Type: vo.DataTypeInteger},
							"v3": {Type: vo.DataTypeInteger},
						},
					}},
					"rowNum": {Type: vo.DataTypeInteger},
				},
			})
			assert.NoError(t, err)

			in := map[string]any{"__condition_right_0": 1}

			result, err := ds.(*Query).Invoke(t.Context(), in)
			assert.NoError(t, err)
			fmt.Println(result)
			assert.Equal(t, int64(1), result["outputList"].([]any)[0].(database.Object)["v1"])
			assert.Equal(t, int64(2), result["outputList"].([]any)[0].(database.Object)["v2"])
			assert.Equal(t, nil, result["outputList"].([]any)[0].(database.Object)["v3"])

		})

	})

	t.Run("other case", func(t *testing.T) {

		cfg := &QueryConfig{
			DatabaseInfoID: 111,
			ClauseGroup: &database.ClauseGroup{
				Single: &database.Clause{
					Left:     "v1",
					Operator: database.OperatorLike,
				},
			},
			OrderClauses: []*database.OrderClause{{FieldID: "v1", IsAsc: false}},
			QueryFields:  []string{"v1", "v2", "v3", "v4", "v5", "v6", "v7", "v8"},
			Limit:        10,
		}

		objects := make([]database.Object, 0)
		objects = append(objects, database.Object{
			"v1": "1",
			"v2": "2.1",
			"v3": int64(0),
			"v4": "true",
			"v5": "2020-02-20T10:10:10",
			"v6": `["1","2","3"]`,
			"v7": `[false,true,"true"]`,
			"v8": `["1.2",2.1, 3.9]`,
		})

		mockQuery := &mockDsSelect{objects: objects, t: t, validate: func(request *database.QueryRequest) {
			if request.DatabaseInfoID != cfg.DatabaseInfoID {
				t.Fatal("database id should be equal")
			}
			cGroup := request.ConditionGroup
			assert.Equal(t, cGroup.Conditions[0].Left, cfg.ClauseGroup.Single.Left)
			assert.Equal(t, cGroup.Conditions[0].Operator, cfg.ClauseGroup.Single.Operator)

		}}
		mockDatabaseOperator := databasemock.NewMockDatabase(ctrl)
		mockDatabaseOperator.EXPECT().Query(gomock.Any(), gomock.Any()).DoAndReturn(mockQuery.Query()).AnyTimes()
		crossdatabase.SetDefaultSVC(mockDatabaseOperator)

		ds, err := cfg.Build(context.Background(), &schema.NodeSchema{
			OutputTypes: map[string]*vo.TypeInfo{
				"outputList": {Type: vo.DataTypeArray,
					ElemTypeInfo: &vo.TypeInfo{Type: vo.DataTypeObject, Properties: map[string]*vo.TypeInfo{
						"v1": {Type: vo.DataTypeInteger},
						"v2": {Type: vo.DataTypeNumber},
						"v3": {Type: vo.DataTypeBoolean},
						"v4": {Type: vo.DataTypeBoolean},
						"v5": {Type: vo.DataTypeTime},
						"v6": {Type: vo.DataTypeArray, ElemTypeInfo: &vo.TypeInfo{Type: vo.DataTypeInteger}},
						"v7": {Type: vo.DataTypeArray, ElemTypeInfo: &vo.TypeInfo{Type: vo.DataTypeBoolean}},
						"v8": {Type: vo.DataTypeArray, ElemTypeInfo: &vo.TypeInfo{Type: vo.DataTypeNumber}},
					},
					}},
				"rowNum": {Type: vo.DataTypeInteger},
			},
		})
		assert.NoError(t, err)

		in := map[string]any{
			"__condition_right_0": 1,
		}

		result, err := ds.(*Query).Invoke(t.Context(), in)
		assert.NoError(t, err)
		object := result["outputList"].([]any)[0].(database.Object)

		assert.Equal(t, int64(1), object["v1"])
		assert.Equal(t, 2.1, object["v2"])
		assert.Equal(t, false, object["v3"])
		assert.Equal(t, true, object["v4"])
		assert.Equal(t, "2020-02-20T10:10:10", object["v5"])
		assert.Equal(t, []any{int64(1), int64(2), int64(3)}, object["v6"])
		assert.Equal(t, []any{false, true, true}, object["v7"])
		assert.Equal(t, []any{1.2, 2.1, 3.9}, object["v8"])

	})

	t.Run("config output list is nil", func(t *testing.T) {

		cfg := &QueryConfig{
			DatabaseInfoID: 111,
			ClauseGroup: &database.ClauseGroup{
				Single: &database.Clause{
					Left:     "v1",
					Operator: database.OperatorLike,
				},
			},
			OrderClauses: []*database.OrderClause{{FieldID: "v1", IsAsc: false}},
			QueryFields:  []string{"v1", "v2", "v3", "v4", "v5", "v6", "v7", "v8"},
			Limit:        10,
		}

		objects := make([]database.Object, 0)
		objects = append(objects, database.Object{
			"v1": int64(1),
			"v2": "2.1",
			"v3": int64(0),
			"v4": "true",
			"v5": "2020-02-20T10:10:10",
			"v6": `["1","2","3"]`,
			"v7": `[false,true,"true"]`,
			"v8": `["1.2",2.1, 3.9]`,
		})
		mockQuery := &mockDsSelect{objects: objects, t: t, validate: func(request *database.QueryRequest) {
			if request.DatabaseInfoID != cfg.DatabaseInfoID {
				t.Fatal("database id should be equal")
			}
			cGroup := request.ConditionGroup
			assert.Equal(t, cGroup.Conditions[0].Left, cfg.ClauseGroup.Single.Left)
			assert.Equal(t, cGroup.Conditions[0].Operator, cfg.ClauseGroup.Single.Operator)

		}}
		mockDatabaseOperator := databasemock.NewMockDatabase(ctrl)
		mockDatabaseOperator.EXPECT().Query(gomock.Any(), gomock.Any()).DoAndReturn(mockQuery.Query()).AnyTimes()
		crossdatabase.SetDefaultSVC(mockDatabaseOperator)

		ds, err := cfg.Build(context.Background(), &schema.NodeSchema{
			OutputTypes: map[string]*vo.TypeInfo{
				"outputList": {Type: vo.DataTypeArray, ElemTypeInfo: &vo.TypeInfo{Type: vo.DataTypeObject, Properties: map[string]*vo.TypeInfo{}}},
				"rowNum":     {Type: vo.DataTypeInteger},
			},
		})
		assert.NoError(t, err)

		in := map[string]any{
			"__condition_right_0": 1,
		}

		result, err := ds.(*Query).Invoke(t.Context(), in)
		assert.NoError(t, err)
		assert.Equal(t, result["outputList"].([]any)[0].(database.Object), database.Object{
			"v1": "1",
			"v2": "2.1",
			"v3": "0",
			"v4": "true",
			"v5": "2020-02-20T10:10:10",
			"v6": `["1","2","3"]`,
			"v7": `[false,true,"true"]`,
			"v8": `["1.2",2.1, 3.9]`,
		})

	})

}
