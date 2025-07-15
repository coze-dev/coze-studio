package modelmgr

import (
	"fmt"
	"os"
	"testing"

	"github.com/coze-dev/coze-studio/backend/infra/contract/chatmodel"
	"github.com/stretchr/testify/assert"
)

func TestInitByEnv(t *testing.T) {
	i := 0
	for k := range modelMapping[chatmodel.ProtocolArk] {
		_ = os.Setenv(concatEnvKey(modelProtocolPrefix, i), "ark")
		_ = os.Setenv(concatEnvKey(modelOpenCozeIDPrefix, i), fmt.Sprintf("%d", 45678+i))
		_ = os.Setenv(concatEnvKey(modelNamePrefix, i), k)
		_ = os.Setenv(concatEnvKey(modelIDPrefix, i), k)
		_ = os.Setenv(concatEnvKey(modelApiKeyPrefix, i), "mock_api_key")
		i++
	}

	wd, err := os.Getwd()
	assert.NoError(t, err)

	ms, es, err := initModelByEnv(wd, "../../conf/model/template")
	assert.NoError(t, err)
	assert.Len(t, ms, len(modelMapping[chatmodel.ProtocolArk]))
	assert.Len(t, es, len(modelMapping[chatmodel.ProtocolArk]))
}
