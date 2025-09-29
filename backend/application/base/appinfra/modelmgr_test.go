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

package appinfra

import (
	"fmt"
	"os"
	"testing"

	"github.com/stretchr/testify/assert"

	"github.com/coze-dev/coze-studio/backend/infra/chatmodel"
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
