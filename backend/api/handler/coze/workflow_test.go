package coze

import (
	"bytes"
	"net/http"
	"testing"

	"github.com/bytedance/sonic"
	"github.com/cloudwego/hertz/pkg/app/server"
	"github.com/cloudwego/hertz/pkg/common/ut"
	"github.com/stretchr/testify/assert"

	"code.byted.org/flow/opencoze/backend/api/model/ocean/cloud/workflow"
)

func TestNodeTemplateList(t *testing.T) {
	h := server.Default()
	h.POST("/api/workflow_api/node_template_list", NodeTemplateList)
	req := &workflow.NodeTemplateListRequest{
		NodeTypes: []string{"1", "5", "18"},
	}
	m, err := sonic.Marshal(req)
	assert.NoError(t, err)
	w := ut.PerformRequest(h.Engine, "POST", "/api/workflow_api/node_template_list", &ut.Body{Body: bytes.NewBuffer(m), Len: len(m)},
		ut.Header{Key: "Content-Type", Value: "application/json"})
	res := w.Result()
	assert.Equal(t, http.StatusOK, res.StatusCode())
	rBody := res.Body()
	resp := &workflow.NodeTemplateListResponse{}
	err = sonic.Unmarshal(rBody, resp)
	assert.NoError(t, err)
	assert.Equal(t, 3, len(resp.Data.TemplateList))
	assert.Equal(t, 3, len(resp.Data.CateList))
}
