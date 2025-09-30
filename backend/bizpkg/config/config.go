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

package config

import (
	"context"
	"errors"
	"os"

	"gorm.io/gorm"

	config "github.com/coze-dev/coze-studio/backend/api/model/admin/config"
	"github.com/coze-dev/coze-studio/backend/bizpkg/config/internal/query"
	"github.com/coze-dev/coze-studio/backend/infra/storage"
	"github.com/coze-dev/coze-studio/backend/pkg/kvstore"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/conv"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ternary"
	"github.com/coze-dev/coze-studio/backend/types/consts"
)

const (
	baseConfigKey = "basic_config"
)

var shardConfig *Config

func Init(db *gorm.DB, oss storage.Storage) error {
	kvstore.SetDefault(db)
	query.SetDefault(db)

	shardConfig = &Config{
		base: kvstore.New[config.BasicConfiguration](nil),
		oss:  oss,
	}

	return nil
}

type Config struct {
	base *kvstore.KVStore[config.BasicConfiguration]
	oss  storage.Storage
}

func Shard() *Config {
	return shardConfig
}

func (c *Config) GetBaseConfig(ctx context.Context) (*config.BasicConfiguration, error) {
	conf, err := c.base.Get(ctx, consts.ConfigNameSpace, baseConfigKey)
	if err != nil {
		if errors.Is(err, kvstore.ErrKeyNotFound) {
			return getBasicConfigurationFromOldConfig(), nil
		}

		return nil, err
	}
	return conf, nil
}

func (c *Config) SaveBaseConfig(ctx context.Context, v *config.BasicConfiguration) error {
	return c.base.Save(ctx, consts.ConfigNameSpace, baseConfigKey, v)
}

func getBasicConfigurationFromOldConfig() *config.BasicConfiguration {
	disableUserRegistration := ternary.IFElse(os.Getenv(consts.DisableUserRegistration) == "true", true, false)
	runnerTypeStr := os.Getenv(consts.CodeRunnerType)
	codeRunnerType := ternary.IFElse(runnerTypeStr == "sandbox", config.CodeRunnerType_Sandbox, config.CodeRunnerType_Local)
	timeoutSecondsStr := os.Getenv(consts.CodeRunnerTimeoutSeconds)
	timeoutSeconds, err := conv.StrToFloat64(timeoutSecondsStr)
	if err != nil {
		timeoutSeconds = 60.0
	}

	memoryLimitMbStr := os.Getenv(consts.CodeRunnerMemoryLimitMB)
	memoryLimitMB := conv.StrToInt64D(memoryLimitMbStr, 100)

	const ServerHost = "SERVER_HOST"
	return &config.BasicConfiguration{
		AdminEmails:             "",
		DisableUserRegistration: disableUserRegistration,
		AllowRegistrationEmail:  os.Getenv(consts.DisableUserRegistration),
		CozeAPIToken:            "",
		CodeRunnerType:          codeRunnerType,
		ServerHost:              os.Getenv(ServerHost),
		SandboxConfig: &config.SandboxConfig{
			AllowEnv:       os.Getenv(consts.CodeRunnerAllowEnv),
			AllowRead:      os.Getenv(consts.CodeRunnerAllowRead),
			AllowWrite:     os.Getenv(consts.CodeRunnerAllowWrite),
			AllowNet:       os.Getenv(consts.CodeRunnerAllowNet),
			AllowRun:       os.Getenv(consts.CodeRunnerAllowRun),
			AllowFfi:       os.Getenv(consts.CodeRunnerAllowFFI),
			NodeModulesDir: os.Getenv(consts.CodeRunnerNodeModulesDir),
			TimeoutSeconds: timeoutSeconds,
			MemoryLimitMb:  memoryLimitMB,
		},
	}
}
