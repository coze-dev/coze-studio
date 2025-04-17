package database

import (
	"context"
	"fmt"
	"testing"

	"github.com/stretchr/testify/assert"

	"code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/database"
	"code.byted.org/flow/opencoze/backend/domain/workflow/nodes"
)

type mockDsSelect struct {
	t        *testing.T
	objects  []database.Object
	validate func(request *database.QueryRequest)
}

func (m *mockDsSelect) Query(ctx context.Context, request *database.QueryRequest) (*database.Response, error) {
	n := int64(1)

	m.validate(request)

	return &database.Response{
		RowNumber: &n,
		Objects:   m.objects,
	}, nil
}

func TestDataset_Query(t *testing.T) {
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

				OutputConfig: map[string]*nodes.TypeInfo{
					"v1": {Type: nodes.DataTypeString},
					"v2": {Type: nodes.DataTypeString},
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
			cfg.Queryer = mockQuery

			ds := Query{
				config: cfg,
			}

			in := map[string]any{
				"ClauseGroup": map[string]interface{}{
					"Single": map[string]interface{}{
						"Right": 1},
				},
			}
			cGroup, err := ConvertClauseGroupToConditionGroup(context.Background(), ds.config.ClauseGroup, in)
			assert.NoError(t, err)
			result, err := ds.Query(context.Background(), cGroup)
			assert.NoError(t, err)
			assert.Equal(t, "1", result["outputList"].([]database.Object)[0]["v1"])
			assert.Equal(t, "2", result["outputList"].([]database.Object)[0]["v2"])
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

				OutputConfig: map[string]*nodes.TypeInfo{
					"v1": {Type: nodes.DataTypeString},
					"v2": {Type: nodes.DataTypeString},
				},
			}

			objects := make([]database.Object, 0)
			objects = append(objects, database.Object{
				"v1": "1",
				"v2": 2,
			})

			cfg.Queryer = &mockDsSelect{objects: objects, t: t, validate: func(request *database.QueryRequest) {
				if request.DatabaseInfoID != cfg.DatabaseInfoID {
					t.Fatal("database id should be equal")

				}
				cGroup := request.ConditionGroup
				assert.Equal(t, cGroup.Conditions[0].Right, 1)
				assert.Equal(t, cGroup.Conditions[1].Right, 2)
				assert.Equal(t, cGroup.Relation, cfg.ClauseGroup.Multi.Relation)

			}}

			ds := Query{
				config: cfg,
			}

			in := map[string]any{
				"ClauseGroup": map[string]interface{}{
					"Multi": map[string]interface{}{
						"0": map[string]interface{}{
							"Right": 1},
						"1": map[string]interface{}{
							"Right": 2},
					},
				},
			}
			cGroup, err := ConvertClauseGroupToConditionGroup(context.Background(), ds.config.ClauseGroup, in)
			assert.NoError(t, err)
			result, err := ds.Query(context.Background(), cGroup)
			assert.NoError(t, err)
			assert.NoError(t, err)
			assert.Equal(t, "1", result["outputList"].([]database.Object)[0]["v1"])
			assert.Equal(t, "2", result["outputList"].([]database.Object)[0]["v2"])
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

				OutputConfig: map[string]*nodes.TypeInfo{
					"v1": {Type: nodes.DataTypeInteger},
					"v2": {Type: nodes.DataTypeInteger},
				},
			}
			objects := make([]database.Object, 0)
			objects = append(objects, database.Object{
				"v1": "abc",
				"v2": 2,
			})

			cfg.Queryer = &mockDsSelect{objects: objects, t: t, validate: func(request *database.QueryRequest) {
				if request.DatabaseInfoID != cfg.DatabaseInfoID {
					t.Fatal("database id should be equal")

				}
				cGroup := request.ConditionGroup
				assert.Equal(t, cGroup.Conditions[0].Left, cfg.ClauseGroup.Single.Left)
				assert.Equal(t, cGroup.Conditions[0].Operator, cfg.ClauseGroup.Single.Operator)

			}}

			ds := Query{
				config: cfg,
			}

			in := map[string]any{
				"ClauseGroup": map[string]interface{}{
					"Single": map[string]interface{}{
						"Right": 1},
				},
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

				OutputConfig: map[string]*nodes.TypeInfo{
					"v1": {Type: nodes.DataTypeInteger},
					"v2": {Type: nodes.DataTypeInteger},
					"v3": {Type: nodes.DataTypeInteger},
				},
			}
			objects := make([]database.Object, 0)
			objects = append(objects, database.Object{
				"v1": "1",
				"v2": 2,
			})
			cfg.Queryer = &mockDsSelect{objects: objects, t: t, validate: func(request *database.QueryRequest) {
				if request.DatabaseInfoID != cfg.DatabaseInfoID {
					t.Fatal("database id should be equal")
				}
				cGroup := request.ConditionGroup
				assert.Equal(t, cGroup.Conditions[0].Left, cfg.ClauseGroup.Single.Left)
				assert.Equal(t, cGroup.Conditions[0].Operator, cfg.ClauseGroup.Single.Operator)
			}}

			ds := Query{
				config: cfg,
			}

			in := map[string]any{
				"ClauseGroup": map[string]interface{}{
					"Single": map[string]interface{}{
						"Right": 1},
				},
			}
			cGroup, err := ConvertClauseGroupToConditionGroup(context.Background(), ds.config.ClauseGroup, in)
			assert.NoError(t, err)
			result, err := ds.Query(context.Background(), cGroup)
			assert.NoError(t, err)
			fmt.Println(result)
			assert.Equal(t, int64(1), result["outputList"].([]database.Object)[0]["v1"])
			assert.Equal(t, int64(2), result["outputList"].([]database.Object)[0]["v2"])
			assert.Equal(t, nil, result["outputList"].([]database.Object)[0]["v3"])

		})

	})

	t.Run("other case", func(t *testing.T) {
		eleV6 := nodes.DataTypeInteger
		eleV7 := nodes.DataTypeBoolean
		eleV8 := nodes.DataTypeNumber
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

			OutputConfig: map[string]*nodes.TypeInfo{
				"v1": {Type: nodes.DataTypeInteger},
				"v2": {Type: nodes.DataTypeNumber},
				"v3": {Type: nodes.DataTypeBoolean},
				"v4": {Type: nodes.DataTypeBoolean},
				"v5": {Type: nodes.DataTypeTime},
				"v6": {Type: nodes.DataTypeArray, ElemType: &eleV6},
				"v7": {Type: nodes.DataTypeArray, ElemType: &eleV7},
				"v8": {Type: nodes.DataTypeArray, ElemType: &eleV8},
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
		cfg.Queryer = &mockDsSelect{objects: objects, t: t, validate: func(request *database.QueryRequest) {
			if request.DatabaseInfoID != cfg.DatabaseInfoID {
				t.Fatal("database id should be equal")
			}
			cGroup := request.ConditionGroup
			assert.Equal(t, cGroup.Conditions[0].Left, cfg.ClauseGroup.Single.Left)
			assert.Equal(t, cGroup.Conditions[0].Operator, cfg.ClauseGroup.Single.Operator)

		}}
		ds := Query{
			config: cfg,
		}

		in := map[string]any{
			"ClauseGroup": map[string]interface{}{
				"Single": map[string]interface{}{
					"Right": 1},
			},
		}
		cGroup, err := ConvertClauseGroupToConditionGroup(context.Background(), ds.config.ClauseGroup, in)
		assert.NoError(t, err)
		result, err := ds.Query(context.Background(), cGroup)
		assert.NoError(t, err)

		assert.Equal(t, int64(1), result["outputList"].([]database.Object)[0]["v1"])
		assert.Equal(t, 2.1, result["outputList"].([]database.Object)[0]["v2"])
		assert.Equal(t, false, result["outputList"].([]database.Object)[0]["v3"])
		assert.Equal(t, true, result["outputList"].([]database.Object)[0]["v4"])
		assert.Equal(t, "2020-02-20T10:10:10", result["outputList"].([]database.Object)[0]["v5"])
		assert.Equal(t, []int64{1, 2, 3}, result["outputList"].([]database.Object)[0]["v6"])
		assert.Equal(t, []bool{false, true, true}, result["outputList"].([]database.Object)[0]["v7"])
		assert.Equal(t, []float64{1.2, 2.1, 3.9}, result["outputList"].([]database.Object)[0]["v8"])

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
			OutputConfig: map[string]*nodes.TypeInfo{},
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
		cfg.Queryer = &mockDsSelect{objects: objects, t: t, validate: func(request *database.QueryRequest) {
			if request.DatabaseInfoID != cfg.DatabaseInfoID {
				t.Fatal("database id should be equal")
			}
			cGroup := request.ConditionGroup
			assert.Equal(t, cGroup.Conditions[0].Left, cfg.ClauseGroup.Single.Left)
			assert.Equal(t, cGroup.Conditions[0].Operator, cfg.ClauseGroup.Single.Operator)

		}}
		ds := Query{
			config: cfg,
		}

		in := map[string]any{
			"ClauseGroup": map[string]interface{}{
				"Single": map[string]interface{}{
					"Right": 1},
			},
		}
		cGroup, err := ConvertClauseGroupToConditionGroup(context.Background(), ds.config.ClauseGroup, in)
		assert.NoError(t, err)
		result, err := ds.Query(context.Background(), cGroup)
		assert.NoError(t, err)
		assert.Equal(t, result["outputList"].([]database.Object)[0], database.Object{
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
