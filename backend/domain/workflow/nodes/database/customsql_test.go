package database

import (
	"context"
	"testing"

	"github.com/stretchr/testify/assert"
)

type mockCustomSQLer struct {
	validate func(req *CustomSQLRequest)
}

func (m mockCustomSQLer) Execute(ctx context.Context, request *CustomSQLRequest) (*Response, error) {
	m.validate(request)
	r := &Response{
		Objects: []Object{
			Object{
				"v1": "v1_ret",
				"v2": "v2_ret",
			},
		},
	}

	return r, nil
}

func TestCustomSQL_Execute(t *testing.T) {
	cfg := &CustomSQLConfig{
		DatabaseInfoID: "v1",
		SQLTemplate:    "select * from v1 where v1 = {{v1}} and v2 = '{{v2}}' and v3 = `{{v3}}`",
		CustomSQLer: mockCustomSQLer{
			validate: func(req *CustomSQLRequest) {
				assert.Equal(t, "v1", req.DatabaseInfoID)
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

	assert.Equal(t, "v1_ret", ret[outputList].([]Object)[0]["v1"])
	assert.Equal(t, "v2_ret", ret[outputList].([]Object)[0]["v2"])

}
