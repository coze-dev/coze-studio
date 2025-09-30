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

package base

import (
	"context"
	"errors"
	"os"
	"strings"

	"gorm.io/gorm"

	"github.com/coze-dev/coze-studio/backend/api/model/admin/config"
	"github.com/coze-dev/coze-studio/backend/pkg/envkey"
	"github.com/coze-dev/coze-studio/backend/pkg/kvstore"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/conv"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ternary"
	"github.com/coze-dev/coze-studio/backend/types/consts"
)

const (
	baseConfigKey = "basic_config"
)

type BaseConfig struct {
	base *kvstore.KVStore[config.BasicConfiguration]
}

func NewBaseConfig(db *gorm.DB) *BaseConfig {
	return &BaseConfig{
		base: kvstore.New[config.BasicConfiguration](db),
	}
}

func (c *BaseConfig) GetBaseConfig(ctx context.Context) (*config.BasicConfiguration, error) {
	conf, err := c.base.Get(ctx, consts.BaseConfigNameSpace, baseConfigKey)
	if err != nil {
		if errors.Is(err, kvstore.ErrKeyNotFound) {
			return getBasicConfigurationFromOldConfig(), nil
		}

		return nil, err
	}

	return conf, nil
}

func (c *BaseConfig) SaveBaseConfig(ctx context.Context, v *config.BasicConfiguration) error {
	return c.base.Save(ctx, consts.BaseConfigNameSpace, baseConfigKey, v)
}

func getBasicConfigurationFromOldConfig() *config.BasicConfiguration {
	disableUserRegistration := ternary.IFElse(os.Getenv(consts.DisableUserRegistration) == "true", true, false)
	runnerTypeStr := os.Getenv(consts.CodeRunnerType)
	codeRunnerType := ternary.IFElse(runnerTypeStr == "sandbox", config.CodeRunnerType_Sandbox, config.CodeRunnerType_Local)
	timeoutSecondsStr := os.Getenv(consts.CodeRunnerTimeoutSeconds)
	timeoutSeconds := conv.StrToFloat64D(timeoutSecondsStr, 60)
	memoryLimitMbStr := os.Getenv(consts.CodeRunnerMemoryLimitMB)
	memoryLimitMB := conv.StrToInt64D(memoryLimitMbStr, 100)

	const ServerHost = "SERVER_HOST"
	return &config.BasicConfiguration{
		AdminEmails:             "",
		DisableUserRegistration: disableUserRegistration,
		AllowRegistrationEmail:  os.Getenv(consts.DisableUserRegistration),
		PluginConfiguration: &config.PluginConfiguration{
			CozeSaasPluginEnabled: envkey.GetBoolD("COZE_SAAS_PLUGIN_ENABLED", false),
			CozeAPIToken:          envkey.GetString("COZE_SAAS_API_KEY"),
			CozeSaasAPIBaseURL:    envkey.GetStringD("COZE_SAAS_API_BASE_URL", "https://api.coze.cn"),
		},
		CodeRunnerType: codeRunnerType,
		ServerHost:     os.Getenv(ServerHost),
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

func (c *BaseConfig) GetServerHost(ctx context.Context) (string, error) {
	cfg, err := c.GetBaseConfig(ctx)
	if err != nil {
		return "", err
	}

	host := cfg.ServerHost
	if host == "" {
		return "", errors.New("server host is empty")
	}

	if strings.HasPrefix(host, "http://") || strings.HasPrefix(host, "https://") {
		return host, nil
	}

	return "https://" + host, nil
}
