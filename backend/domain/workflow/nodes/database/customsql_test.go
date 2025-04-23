package database

import (
	"context"
	"testing"

	"go.uber.org/mock/gomock"

	"github.com/stretchr/testify/assert"

	"code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/database"
	"code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/database/databasemock"
	"code.byted.org/flow/opencoze/backend/domain/workflow/nodes"
)

type mockCustomSQLer struct {
	validate func(req *database.CustomSQLRequest)
}

func (m mockCustomSQLer) Execute() func(ctx context.Context, request *database.CustomSQLRequest) (*database.Response, error) {
	return func(ctx context.Context, request *database.CustomSQLRequest) (*database.Response, error) {
		m.validate(request)
		r := &database.Response{
			Objects: []database.Object{
				database.Object{
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
			ps := []string{"v2_value", "v3_value"}
			assert.Equal(t, ps, req.Params)
			assert.Equal(t, "select * from v1 where v1 = v1_value and v2 = ? and v3 = ?", req.SQL)
		},
	}

	mockDatabaseOperator := databasemock.NewMockDatabaseOperator(ctrl)
	mockDatabaseOperator.EXPECT().Execute(gomock.Any(), gomock.Any()).DoAndReturn(mockSQLer.Execute()).AnyTimes()

	cfg := &CustomSQLConfig{
		DatabaseInfoID:    111,
		SQLTemplate:       "select * from v1 where v1 = {{v1}} and v2 = '{{v2}}' and v3 = `{{v3}}`",
		CustomSQLExecutor: mockDatabaseOperator,
		OutputConfig: map[string]*nodes.TypeInfo{
			"outputList": {Type: nodes.DataTypeArray, ElemTypeInfo: &nodes.TypeInfo{Type: nodes.DataTypeObject, Properties: map[string]*nodes.TypeInfo{
				"v1": {Type: nodes.DataTypeString},
				"v2": {Type: nodes.DataTypeString},
			}}},
			"rowNum": {Type: nodes.DataTypeInteger},
		},
	}
	cl := &CustomSQL{
		config: cfg,
	}

	ctx := context.Background()

	ret, err := cl.Execute(ctx, map[string]any{
		"v1": "v1_value",
		"v2": "v2_value",
		"v3": "v3_value",
	})

	assert.Nil(t, err)

	assert.Equal(t, "v1_ret", ret[outputList].([]database.Object)[0]["v1"])
	assert.Equal(t, "v2_ret", ret[outputList].([]database.Object)[0]["v2"])

}
