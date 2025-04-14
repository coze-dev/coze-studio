package database

import (
	"context"
	"testing"

	"github.com/stretchr/testify/assert"

	"code.byted.org/flow/opencoze/backend/domain/workflow/cross_domain/database"
)

type mockCustomSQLer struct {
	validate func(req *database.CustomSQLRequest)
}

func (m mockCustomSQLer) Execute(ctx context.Context, request *database.CustomSQLRequest) (*database.Response, error) {
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

func TestCustomSQL_Execute(t *testing.T) {
	cfg := &CustomSQLConfig{
		DatabaseInfoID: 111,
		SQLTemplate:    "select * from v1 where v1 = {{v1}} and v2 = '{{v2}}' and v3 = `{{v3}}`",
		CustomSQLExecutor: mockCustomSQLer{
			validate: func(req *database.CustomSQLRequest) {
				assert.Equal(t, int64(111), req.DatabaseInfoID)
				ps := []string{"v2_value", "v3_value"}
				assert.Equal(t, ps, req.Params)
				assert.Equal(t, "select * from v1 where v1 = v1_value and v2 = ? and v3 = ?", req.SQL)
			},
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
