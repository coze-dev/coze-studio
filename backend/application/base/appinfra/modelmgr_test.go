package appinfra

import (
	"fmt"
	"os"
	"testing"

	"github.com/stretchr/testify/assert"

	"github.com/coze-dev/coze-studio/backend/infra/contract/chatmodel"
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

	ms, err := initModelByEnv(wd, "../../../conf/model/template")
	assert.NoError(t, err)
	assert.Len(t, ms, len(modelMapping[chatmodel.ProtocolArk]))
}
