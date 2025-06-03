package database

import (
	"context"
	"testing"

	"github.com/stretchr/testify/assert"
	"go.uber.org/mock/gomock"

	"code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/database"
	"code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/database/databasemock"
	"code.byted.org/flow/opencoze/backend/domain/workflow/entity"
	"code.byted.org/flow/opencoze/backend/domain/workflow/entity/vo"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/execute"
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
		OutputConfig: map[string]*vo.TypeInfo{
			"outputList": {Type: vo.DataTypeArray, ElemTypeInfo: &vo.TypeInfo{Type: vo.DataTypeObject, Properties: map[string]*vo.TypeInfo{
				"v1": {Type: vo.DataTypeString},
				"v2": {Type: vo.DataTypeString},
			}}},
			"rowNum": {Type: vo.DataTypeInteger},
		},
	}
	cl := &CustomSQL{
		config: cfg,
	}

	ctx := t.Context()
	ctx, err := execute.PrepareRootExeCtx(ctx, &entity.WorkflowBasic{}, 123, false, &entity.InterruptEvent{}, vo.ExecuteConfig{
		Mode: vo.ExecuteModeDebug,
	})
	assert.NoError(t, err)

	ret, err := cl.Execute(ctx, map[string]any{
		"v1": "v1_value",
		"v2": "v2_value",
		"v3": "v3_value",
	})

	assert.Nil(t, err)

	assert.Equal(t, "v1_ret", ret[outputList].([]any)[0].(database.Object)["v1"])
	assert.Equal(t, "v2_ret", ret[outputList].([]any)[0].(database.Object)["v2"])

}
