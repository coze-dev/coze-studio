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

package conf

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"path"

	"github.com/bytedance/sonic"

	"github.com/coze-dev/coze-studio/backend/pkg/logs"
)

func InitConfig(ctx context.Context) (err error) {
	cwd, err := os.Getwd()
	if err != nil {
		logs.Warnf("[InitConfig] Failed to get current working directory: %v", err)
		cwd = os.Getenv("PWD")
	}

	basePath := path.Join(cwd, "resources", "conf", "plugin")

	err = loadPluginProductMeta(ctx, basePath)
	if err != nil {
		return err
	}

	err = loadOAuthSchema(ctx, basePath)
	if err != nil {
		return err
	}

	return nil
}

var oauthSchema string

func GetOAuthSchema() string {
	return oauthSchema
}

func loadOAuthSchema(ctx context.Context, basePath string) (err error) {
	filePath := path.Join(basePath, "common", "oauth_schema.json")
	file, err := os.ReadFile(filePath)
	if err != nil {
		return fmt.Errorf("read file '%s' failed, err=%v", filePath, err)
	}

	if !isValidJSON(file) {
		return fmt.Errorf("invalid json, filePath=%s", filePath)
	}

	oauthSchema = string(file)

	return nil
}

func isValidJSON(data []byte) bool {
	var js json.RawMessage
	return sonic.Unmarshal(data, &js) == nil
}
