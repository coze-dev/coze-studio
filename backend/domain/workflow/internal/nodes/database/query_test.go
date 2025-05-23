package database

import (
	"context"
	"fmt"
	"testing"

	"go.uber.org/mock/gomock"

	"github.com/stretchr/testify/assert"

	"code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/database"
	"code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/database/databasemock"
	"code.byted.org/flow/opencoze/backend/domain/workflow/entity/vo"
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

	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	t.Run("string case", func(t *testing.T) {

		t.Run("single", func(t *testing.T) {
			objects := make([]database.Object, 0)
			objects = append(objects, database.Object{
				"v1": "1",
				"v2": 2,
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
				OutputConfig: map[string]*vo.TypeInfo{
					"outputList": {Type: vo.DataTypeArray, ElemTypeInfo: &vo.TypeInfo{
						Type: vo.DataTypeObject,
						Properties: map[string]*vo.TypeInfo{
							"v1": {Type: vo.DataTypeString},
							"v2": {Type: vo.DataTypeString},
						},
					}},
					"rowNum": {Type: vo.DataTypeInteger},
				},
			}

			mockQuery := &mockDsSelect{objects: objects, t: t, validate: func(request *database.QueryRequest) {
				if request.DatabaseInfoID != cfg.DatabaseInfoID {
					t.Fatal("database id should be equal")
				}
				cGroup := request.ConditionGroup
				assert.Equal(t, cGroup.Conditions[0].Left, cfg.ClauseGroup.Single.Left)
				assert.Equal(t, cGroup.Conditions[0].Operator, cfg.ClauseGroup.Single.Operator)

			}}
			mockDatabaseOperator := databasemock.NewMockDatabaseOperator(ctrl)
			mockDatabaseOperator.EXPECT().Query(gomock.Any(), gomock.Any()).DoAndReturn(mockQuery.Query())

			cfg.Queryer = mockDatabaseOperator

			ds := Query{
				config: cfg,
			}

			in := map[string]interface{}{
				"SingleRight": 1,
			}
			cGroup, err := ConvertClauseGroupToConditionGroup(context.Background(), ds.config.ClauseGroup, in)
			assert.NoError(t, err)
			result, err := ds.Query(context.Background(), cGroup)
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

				OutputConfig: map[string]*vo.TypeInfo{
					"outputList": {Type: vo.DataTypeArray, ElemTypeInfo: &vo.TypeInfo{
						Type: vo.DataTypeObject,
						Properties: map[string]*vo.TypeInfo{
							"v1": {Type: vo.DataTypeString},
							"v2": {Type: vo.DataTypeString},
						},
					}},
					"rowNum": {Type: vo.DataTypeInteger},
				},
			}

			objects := make([]database.Object, 0)
			objects = append(objects, database.Object{
				"v1": "1",
				"v2": 2,
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
			mockDatabaseOperator := databasemock.NewMockDatabaseOperator(ctrl)
			mockDatabaseOperator.EXPECT().Query(gomock.Any(), gomock.Any()).DoAndReturn(mockQuery.Query()).AnyTimes()

			cfg.Queryer = mockDatabaseOperator

			ds := Query{
				config: cfg,
			}

			in := map[string]any{
				"Multi_0_Right": 1,
				"Multi_1_Right": 2,
			}

			cGroup, err := ConvertClauseGroupToConditionGroup(context.Background(), ds.config.ClauseGroup, in)
			assert.NoError(t, err)
			result, err := ds.Query(context.Background(), cGroup)
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

				OutputConfig: map[string]*vo.TypeInfo{
					"outputList": {Type: vo.DataTypeArray, ElemTypeInfo: &vo.TypeInfo{
						Type: vo.DataTypeObject,
						Properties: map[string]*vo.TypeInfo{
							"v1": {Type: vo.DataTypeInteger},
							"v2": {Type: vo.DataTypeInteger},
						},
					}},
					"rowNum": {Type: vo.DataTypeInteger},
				},
			}
			objects := make([]database.Object, 0)
			objects = append(objects, database.Object{
				"v1": "abc",
				"v2": 2,
			})

			mockQuery := &mockDsSelect{objects: objects, t: t, validate: func(request *database.QueryRequest) {
				if request.DatabaseInfoID != cfg.DatabaseInfoID {
					t.Fatal("database id should be equal")

				}
				cGroup := request.ConditionGroup
				assert.Equal(t, cGroup.Conditions[0].Left, cfg.ClauseGroup.Single.Left)
				assert.Equal(t, cGroup.Conditions[0].Operator, cfg.ClauseGroup.Single.Operator)

			}}
			mockDatabaseOperator := databasemock.NewMockDatabaseOperator(ctrl)
			mockDatabaseOperator.EXPECT().Query(gomock.Any(), gomock.Any()).DoAndReturn(mockQuery.Query()).AnyTimes()

			cfg.Queryer = mockDatabaseOperator

			ds := Query{
				config: cfg,
			}

			in := map[string]any{
				"SingleRight": 1,
			}

			cGroup, err := ConvertClauseGroupToConditionGroup(context.Background(), ds.config.ClauseGroup, in)
			assert.NoError(t, err)
			result, err := ds.Query(context.Background(), cGroup)
			assert.NoError(t, err)
			fmt.Println(result)
			assert.Equal(t, nil, result["outputList"])

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

				OutputConfig: map[string]*vo.TypeInfo{
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
			}
			objects := make([]database.Object, 0)
			objects = append(objects, database.Object{
				"v1": "1",
				"v2": 2,
			})
			mockQuery := &mockDsSelect{objects: objects, t: t, validate: func(request *database.QueryRequest) {
				if request.DatabaseInfoID != cfg.DatabaseInfoID {
					t.Fatal("database id should be equal")
				}
				cGroup := request.ConditionGroup
				assert.Equal(t, cGroup.Conditions[0].Left, cfg.ClauseGroup.Single.Left)
				assert.Equal(t, cGroup.Conditions[0].Operator, cfg.ClauseGroup.Single.Operator)
			}}
			mockDatabaseOperator := databasemock.NewMockDatabaseOperator(ctrl)
			mockDatabaseOperator.EXPECT().Query(gomock.Any(), gomock.Any()).DoAndReturn(mockQuery.Query()).AnyTimes()

			cfg.Queryer = mockDatabaseOperator

			ds := Query{
				config: cfg,
			}

			in := map[string]any{"SingleRight": 1}

			cGroup, err := ConvertClauseGroupToConditionGroup(context.Background(), ds.config.ClauseGroup, in)
			assert.NoError(t, err)
			result, err := ds.Query(context.Background(), cGroup)
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

			OutputConfig: map[string]*vo.TypeInfo{
				"outputList": {Type: vo.DataTypeArray, ElemTypeInfo: &vo.TypeInfo{Type: vo.DataTypeObject, Properties: map[string]*vo.TypeInfo{
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
		}

		objects := make([]database.Object, 0)
		objects = append(objects, database.Object{
			"v1": "1",
			"v2": "2.1",
			"v3": 0,
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
		mockDatabaseOperator := databasemock.NewMockDatabaseOperator(ctrl)
		mockDatabaseOperator.EXPECT().Query(gomock.Any(), gomock.Any()).DoAndReturn(mockQuery.Query()).AnyTimes()

		cfg.Queryer = mockDatabaseOperator

		ds := Query{
			config: cfg,
		}

		in := map[string]any{
			"SingleRight": 1,
		}

		cGroup, err := ConvertClauseGroupToConditionGroup(context.Background(), ds.config.ClauseGroup, in)
		assert.NoError(t, err)
		result, err := ds.Query(context.Background(), cGroup)
		assert.NoError(t, err)

		assert.Equal(t, int64(1), result["outputList"].([]any)[0].(database.Object)["v1"])
		assert.Equal(t, 2.1, result["outputList"].([]any)[0].(database.Object)["v2"])
		assert.Equal(t, false, result["outputList"].([]any)[0].(database.Object)["v3"])
		assert.Equal(t, true, result["outputList"].([]any)[0].(database.Object)["v4"])
		assert.Equal(t, "2020-02-20T10:10:10", result["outputList"].([]any)[0].(database.Object)["v5"])
		assert.Equal(t, []int64{1, 2, 3}, result["outputList"].([]any)[0].(database.Object)["v6"])
		assert.Equal(t, []bool{false, true, true}, result["outputList"].([]any)[0].(database.Object)["v7"])
		assert.Equal(t, []float64{1.2, 2.1, 3.9}, result["outputList"].([]any)[0].(database.Object)["v8"])

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
			OutputConfig: map[string]*vo.TypeInfo{
				"outputList": {Type: vo.DataTypeArray, ElemTypeInfo: &vo.TypeInfo{Type: vo.DataTypeObject, Properties: map[string]*vo.TypeInfo{}}},
				"rowNum":     {Type: vo.DataTypeInteger},
			},
		}

		objects := make([]database.Object, 0)
		objects = append(objects, database.Object{
			"v1": 1,
			"v2": "2.1",
			"v3": 0,
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
		mockDatabaseOperator := databasemock.NewMockDatabaseOperator(ctrl)
		mockDatabaseOperator.EXPECT().Query(gomock.Any(), gomock.Any()).DoAndReturn(mockQuery.Query()).AnyTimes()

		cfg.Queryer = mockDatabaseOperator
		ds := Query{
			config: cfg,
		}

		in := map[string]any{
			"SingleRight": 1,
		}
		cGroup, err := ConvertClauseGroupToConditionGroup(context.Background(), ds.config.ClauseGroup, in)
		assert.NoError(t, err)
		result, err := ds.Query(context.Background(), cGroup)
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
